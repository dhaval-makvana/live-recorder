import React, { useState, useEffect, useRef } from "react";
import "./LiveRecorder.css";

import { saveChunkToDB, getDB } from "../../utils/DB";

function LiveRecorder() {
  const [mediaStream, setMediaStream] = useState(null);
  const [recorder, setRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [recordingStatus, setRecordingStatus] = useState("Not Started");
  const [showPermissionScreen, setShowPermissionScreen] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    let intervalId;
    if (isRecording && !isPaused) {
      intervalId = setInterval(() => {
        setVideoDuration((prevDuration) => prevDuration + 1);
      }, 1000);
    } else {
      clearInterval(intervalId);
    }
    return () => clearInterval(intervalId);
  }, [isRecording, isPaused]);

  const handleStart = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMediaStream(stream);
      videoRef.current.srcObject = stream;
      const rec = new MediaRecorder(stream);
      let chunks = [];

      rec.ondataavailable = (e) => {
        chunks.push(e.data);
        saveChunkToDB(e.data);
      };

      rec.onstop = () => {
        setIsRecording(false);
        setIsDownloaded(true);
        setRecordingStatus("Not Started");
      };

      setRecorder(rec);
      setIsRecording(true);
      setRecordingStatus("Recording");
      rec.start();
    } catch (err) {
      console.error("Error accessing media devices: ", err);
      setShowPermissionScreen(true);
    }
  };

  const handlePause = () => {
    if (isRecording && !isPaused) {
      recorder.pause();
      setIsPaused(true);
      setRecordingStatus("Paused");
      videoRef.current.pause();
    } else if (isRecording && isPaused) {
      recorder.resume();
      setIsPaused(false);
      setRecordingStatus("Recording");
      videoRef.current.play();
    }
  };

  const handleStop = () => {
    if (isRecording) {
      recorder.stop();
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
      setRecorder(null);
    }
  };

  const downloadVideo = async () => {
    const db = getDB();
    const transaction = db.transaction(["chunks"], "readonly");
    const objectStore = transaction.objectStore("chunks");
    const chunks = [];

    objectStore.openCursor().onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        chunks.push(cursor.value.chunk);
        cursor.continue();
      } else {
        const fullBlob = new Blob(chunks, { type: "video/webm" });
        const videoUrl = URL.createObjectURL(fullBlob);
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        a.href = videoUrl;
        a.download = "recording.webm";
        a.click();
        URL.revokeObjectURL(videoUrl);

        // Delete recorded chunks from IndexedDB after downloading
        const deleteTransaction = db.transaction(["chunks"], "readwrite");
        const deleteObjectStore = deleteTransaction.objectStore("chunks");
        deleteObjectStore.clear();
        setIsDownloaded(false);
        setRecordingStatus("Not Started");
      }
    };
  };

  return (
    <div className="live-recorder-container">
      {showPermissionScreen ? (
        <div className="permission-screen">
          <p>Recording Permission Required</p>
          <p>
            Please provide the required permissions and{" "}
            <button onClick={() => setShowPermissionScreen(false)}>
              Try Again
            </button>
          </p>
        </div>
      ) : (
        <>
          <div className="video-status">
            <p>Recording Status: {recordingStatus}</p>
            <p>Recording Duration: {videoDuration} seconds</p>
          </div>
          <div className="video-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="video-player"
            />
          </div>
          <div className="control-buttons">
            {!isRecording && !isDownloaded && (
              <button onClick={handleStart}>Start</button>
            )}
            {isRecording && (
              <>
                <button onClick={handlePause}>
                  {isPaused ? "Resume" : "Pause"}
                </button>
                <button onClick={handleStop}>Stop</button>
              </>
            )}
            {isDownloaded && <button onClick={downloadVideo}>Download</button>}
          </div>
        </>
      )}
    </div>
  );
}

export default LiveRecorder;
