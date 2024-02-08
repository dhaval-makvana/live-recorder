import "./App.css";
import VideoRecorder from "./components/VideoRecorder";
import { useEffect } from "react";

import { initializeIndexedDB } from "./utils/DB";

function App() {
  // initializing indexDB connection on mount
  useEffect(() => {
    initializeIndexedDB();
  }, []);

  return (
    <div className="App">
      <VideoRecorder />
    </div>
  );
}

export default App;
