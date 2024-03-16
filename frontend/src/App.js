// client/src/App.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { BsThreeDotsVertical } from "react-icons/bs";

import { FcFolder } from "react-icons/fc";
import { FcOpenedFolder } from "react-icons/fc";
import { FaRegFilePdf, FaRegImage } from 'react-icons/fa6';
import { PiMicrosoftWordLogoFill } from 'react-icons/pi';
import { AiFillFileUnknown } from 'react-icons/ai';
import { BsFiletypeXlsx } from 'react-icons/bs';
function App() {
  const [file, setFile] = useState(null);

  useEffect(() => {
    // Fetch the list of folders and their files when the component mounts
    const fetchFolderData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/folders");
        setFolderData(response.data);
      } catch (error) {
        console.error("Error fetching folder data:", error);
      }
    };

    fetchFolderData();
  }, []);

  const handleFileChange = async (e, folder) => {
    setFile(e.target.files[0]);
    try {
      const formData = new FormData();
      formData.append("file", e.target.files[0]);

      const response = await axios.post(`http://localhost:5000/upload/${folder}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("File uploaded successfully:", response.data);
      // Provide user feedback for successful file upload
      alert("File uploaded successfully!");
      // You can update state or perform any other action here based on the response.
    } catch (error) {
      console.error("Error uploading file:", error);
      // Provide user feedback for failed file upload
      alert("Error uploading file. Please try again.");
    }
  };

  const [folderName, setFolderName] = useState("");

  const handleInputChange = (e) => {
    setFolderName(e.target.value);
  };

  const handleCreateFolder = async () => {
    try {
      await axios.post("http://localhost:5000/createFolder", {
        folderName: folderName,
      });

      console.log("Folder created successfully");
      fetchAllFolders();
    } catch (error) {
      console.error("Error creating folder:", error.response.data.error);
    }
  };
  const [folderData, setFolderData] = useState([]);
  const fetchAllFolders = async () => {
    try {
      const response = await axios.get("http://localhost:5000/allFolders");
      setFolderData(response.data.folders);
    } catch (error) {
      console.error("Error fetching all folders:", error.response.data.error);
    }
  };

  useEffect(() => {
    fetchAllFolders();
  }, []);
  const handleDeleteFile = async (folder, file) => {
    try {
      await axios.delete(`http://localhost:5000/deleteFile/${folder}/${file}`);
      console.log("File deleted successfully");
      // You may want to update the state to reflect the changes immediately
    } catch (error) {
      console.error("Error deleting file:", error.response.data.error);
    }
  };

  const handleDownloadFile = async (folder, file) => {
    try {
      const response = await fetch(`http://localhost:5000/download/${folder}/${file}`);
      const blob = await response.blob(); // Corrected this line

      // Create an anchor element and trigger a download
      const url = window.URL.createObjectURL(blob);

      // Create an anchor element and trigger a download
      const a = document.createElement("a");
      a.href = url;

      // Use the actual filename from the server response
      const contentDisposition = response.headers.get("content-disposition");
      const filenameMatch = contentDisposition && contentDisposition.match(/filename="(.+)"/);
      const suggestedFilename = filenameMatch ? filenameMatch[1] : file;

      a.download = suggestedFilename;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error.response.data.error);
    }
  };

  const handleDeleteFolder = async (folder) => {
    try {
      // Send a request to the server to delete the folder
      await axios.post("http://localhost:5000/deleteFolder", { folderName: folder });
      fetchAllFolders();
    } catch (error) {
      console.error("Error deleting folder:", error);
      // Handle error, show an alert, etc.
    }
  };
  const [expandedFolders, setExpandedFolders] = useState([]);

  const toggleFolder = (folder) => {
    setMenuVisible(false);
    setMenuVisibleFile(false);
    setExpandedFolders((prevExpanded) => {
      const isExpanded = prevExpanded.includes(folder);
      return isExpanded ? prevExpanded.filter((f) => f !== folder) : [...prevExpanded, folder];
    });
  };
  const handleDownloadFolder = async (folder) => {
    try {
      await axios
        .get(`http://localhost:5000/download/${folder}`, {
          responseType: "blob",
        })
        .then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const a = document.createElement("a");
          a.href = url;
          a.download = `${folder}.zip`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        });
    } catch (error) {
      console.error("Error downloading folder:", error);
    }
  };

  const [folder, setFolder] = useState(null); // Add folder state
  const [files, setFiles] = useState([]); // Use an array to store multiple files

  const handleUploadFolder = async () => {
    if (folderName.trim() === "" || files.length === 0) {
      alert("Please enter a folder name and select a folder.");
      return;
    }

    const formData = new FormData();

    // Append each file to the FormData object
    files.forEach((file, index) => {
      formData.append(`file${index + 1}`, file);
    });

    try {
      await axios.post(`http://localhost:5000/uploadFolder/${folderName}`, formData);
      alert("Folder uploaded successfully!");
    } catch (error) {
      console.error("Error uploading folder:", error);
    }
  };

  const handleFolderChange = (e) => {
    setFolder(e.target.files[0]);
  };

  const handleUploadFolderWithFacility = async () => {
    if (folderName.trim() === "" || !folder) {
      alert("Please enter a folder name and select a folder.");
      return;
    }

    const formData = new FormData();
    formData.append("folder", folder);

    try {
      await axios.post(`http://localhost:5000/uploadFolder/${folderName}`, formData);
      alert("Folder uploaded successfully!");
    } catch (error) {
      console.error("Error uploading folder:", error);
    }
  };

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuVisibleFile, setMenuVisibleFile] = useState(false);
  const [selectedFolderIndex, setSelectedFolderIndex] = useState(null);
  const [selectedFileIndex, setSelectedFileIndex] = useState(null);
  const toggleMenu = (index) => {
    setMenuVisible(!menuVisible);
    setSelectedFolderIndex(index);
    setMenuVisibleFile(false);
  };
  const toggleMenuFile = (index) => {
    setMenuVisibleFile(!menuVisibleFile);
    setSelectedFileIndex(index);
    setMenuVisible(false);
  };
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (extension === 'pdf') {
      return <FaRegFilePdf style={{ color: 'red' }} />;
    } else if (extension === 'jpg' || extension === 'jpeg') {
      return <FaRegImage />;
    } else if (extension === 'xlsx' || extension === 'xls') {
      return <BsFiletypeXlsx style={{ color: 'green' }} />;
    } else if (extension === 'txt') {
      return <PiMicrosoftWordLogoFill style={{ color: 'blue' }} />;
    } else {
      return <AiFillFileUnknown style={{ color: 'grey' }} />;
    }
  };
  const [renamedFile, setRenamedFile] = useState("");
  const handleRenameFile = async (folder, oldFileName) => {
    const newFileName = prompt("Enter new file name:", oldFileName);
    if (newFileName) {
      try {
        await axios.put(`http://localhost:5000/renameFile/${folder}/${oldFileName}`, { newFileName });
        setRenamedFile(newFileName); // Update renamed file name in state
        // Refresh folder data after renaming
        fetchAllFolders();
      } catch (error) {
        console.error("Error renaming file:", error.response.data.error);
      }
    }
  };
  
  return (
    <div>
      <div style={{display:'flex',alignItems:'center', gap:'60%', padding:'20px'}}>
        <div>
          <h2>All Folders and Their Files</h2>
        </div>
        <div style={{float:'right'}}>
          <input type="text" placeholder="Enter folder name" value={folderName} onChange={handleInputChange} />
          <button onClick={handleCreateFolder}>Create Folder</button>
        </div>

      </div>
      <div style={{ padding:'10px'}}>
        {folderData.map((folder, index) => (
          <div key={index}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div>
                <h3>
                  <button style={{ background: "none", color: "inherit", border: "none", padding: 0, font: "inherit", cursor: "pointer", outline: "inherit" }} onClick={() => toggleFolder(folder.folder)}>
                    {expandedFolders.includes(folder.folder) ? <FcOpenedFolder /> : <FcFolder />}
                  </button>
                  {folder.folder}
                </h3>
              </div>
              <div style={{ position: "relative" }}>
                <BsThreeDotsVertical onClick={() => toggleMenu(index)} style={{ cursor: "pointer" }} />
                {menuVisible && selectedFolderIndex === index && (
                  <div style={{ position: "absolute", width: "200px", top: "100%", left: 0, background: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", borderRadius: "4px", zIndex: 1 }}>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                      <li style={{ margin: "10px", cursor: "pointer" }} onClick={() => handleDeleteFolder(folder.folder)}>
                        Delete Folder
                      </li>
                      <li style={{ margin: "10px", cursor: "pointer" }} onClick={() => handleDownloadFolder(folder.folder)}>
                        Download Folder
                      </li>
                      <li style={{ margin: "10px", cursor: "pointer" }}>
                        <label htmlFor="fileUpload" style={{ cursor: "pointer" }}>
                          Upload files
                        </label>
                        <input type="file" id="fileUpload" onChange={(e) => handleFileChange(e, folder.folder)} style={{ display: "none" }} />
                      </li>
                     
                      <li style={{ margin: "10px", cursor: "pointer" }}>Rename Folder</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {expandedFolders.includes(folder.folder) && (
              <ul>
                {folder.files.map((file, fileIndex) => (
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <div>
                      <li key={fileIndex} style={{ listStyle: "none", padding: 0,margin:'20px' }}>
                      <span style={{ marginRight: '10px', fontSize:'25px' }}>{getFileIcon(file)}</span>
                      {/* {renamedFile === file ? (
                          <input type="text" value={renamedFile} onChange={(e) => setRenamedFile(e.target.value)} />
                        ) : (
                          file
                        )} */}
                        {file}
                      </li>
                    </div>

                    <div>
                      <div style={{ position: "relative" }}>
                        <BsThreeDotsVertical onClick={() => toggleMenuFile(fileIndex)} style={{ cursor: "pointer" }} />
                        {menuVisibleFile && selectedFileIndex === fileIndex && (
                          <div style={{ position: "absolute", width: "200px", top: "100%", left: 0, background: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", borderRadius: "4px", zIndex: 1 }}>
                            <ul style={{ listStyle: "none", padding: 0 }}>
                              <li style={{ margin: "10px", cursor: "pointer" }} onClick={() => handleDeleteFile(folder.folder, file)}>
                                Delete File
                              </li>
                              <li style={{ margin: "10px", cursor: "pointer" }} onClick={() => handleDownloadFile(folder.folder, file)}>
                                Dowbload File
                              </li>
                              <li style={{ margin: "10px", cursor: "pointer" }} onClick={() => handleRenameFile(folder.folder, file)}>
                                Rename File
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
