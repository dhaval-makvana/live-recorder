let db;

export const initializeIndexedDB = async () => {
  try {
    const request = window.indexedDB.open("videoChunks", 1);

    request.onerror = (event) => {
      console.error("Failed to open IndexedDB database");
    };

    request.onsuccess = (event) => {
      db = event.target.result;
    };

    request.onupgradeneeded = (event) => {
      db = event.target.result;
      if (!db.objectStoreNames.contains("chunks")) {
        db.createObjectStore("chunks", { autoIncrement: true });
      }
    };

    console.log("index DB connected");
  } catch (error) {
    console.error("Error initializing IndexedDB: ", error);
  }
};

export const saveChunkToDB = (chunk) => {
  const transaction = db.transaction(["chunks"], "readwrite");
  const objectStore = transaction.objectStore("chunks");
  objectStore.add({ chunk });
};

export const getDB = () => {
  return db;
};
