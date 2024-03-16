import React, { useState, useEffect } from "react";
import axios from "axios";

const FileList = ({ folders }) => {
  const [selectedFolder, setSelectedFolder] = useState("");
  const [selectedFile, setSelectedFile] = useState("");

  const handleDeleteFile = async () => {
    try {
      await axios.delete(`/deleteFile/${selectedFolder}/${selectedFile}`);
      // Refresh the file list after deletion
      // You might want to fetch the updated file list from the server
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  return (
    <div>
      <h2>File List</h2>
      {folders.map((folder) => (
        <div key={folder.folder}>
          <h3>{folder.folder}</h3>
          <ul>
            {folder.files.map((file) => (
              <li key={file}>
                {file}
                <button
                  onClick={() => {
                    setSelectedFolder(folder.folder);
                    setSelectedFile(file);
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {selectedFile && (
        <div>
          <p>
            Are you sure you want to delete the file {selectedFile} in the folder {selectedFolder}?
          </p>
          <button onClick={handleDeleteFile}>Yes, Delete</button>
        </div>
      )}
    </div>
  );
};

export default FileList;
