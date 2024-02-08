// Open IndexedDB database
const request = window.indexedDB.open("videoRecordings", 1);
let db;

request.onerror = (event) => {
  console.error("Failed to open IndexedDB database");
};

request.onsuccess = (event) => {
  db = event.target.result;
};

request.onupgradeneeded = (event) => {
  db = event.target.result;
  const objectStore = db.createObjectStore("videoChunks", {
    autoIncrement: true,
  });
};

// Save video chunk to IndexedDB
export function saveVideoChunkToDB(chunk) {
  const transaction = db.transaction(["videoChunks"], "readwrite");
  const objectStore = transaction.objectStore("videoChunks");
  objectStore.add(chunk);
}

// Example usage: Call saveVideoChunkToDB(chunk) for each video chunk

// Retrieve all video chunks from IndexedDB
export function getAllVideoChunksFromDB() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["videoChunks"], "readonly");
    const objectStore = transaction.objectStore("videoChunks");
    const chunks = [];

    objectStore.openCursor().onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        chunks.push(cursor.value);
        cursor.continue();
      } else {
        resolve(chunks);
      }
    };

    transaction.onerror = () => {
      reject(new Error("Error retrieving video chunks from IndexedDB"));
    };
  });
}

export function concatenateVideoChunks(chunks) {
  return new Blob(chunks, { type: "video/webm" });
}

export function downloadCompleteVideo(blob) {
  const videoUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  a.href = videoUrl;
  a.download = "complete_video.webm";
  a.click();
  URL.revokeObjectURL(videoUrl);
}
