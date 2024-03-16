require("dotenv").config();
const express = require("express");
const app = express();

const path = require("path");

const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs").promises;

const AdmZip = require("adm-zip");

// const fs = require("fs").promises;

const archiver = require("archiver");

// Read from .env if not available then defaults to 4000
const port = process.env.PORT || 4000;

//middleware
// use json you need import this
app.use(express.json());

app.use(cors());
const subfolder = "vinayak"; // Specify the subfolder name
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("database conected ");
  })
  .catch((error) => {
    console.log(error);
  });

// log request methode in console
app.use("/", (req, res, next) => {
  console.log(req.path, req.method);
  next();
});

app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.params.folder || ""; // Get the folder from the request parameters
    const uploadPath = path.join("uploads", folder);
    fs.mkdir(uploadPath, { recursive: true })
      .then(() => cb(null, uploadPath))
      .catch((err) => cb(err, null));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Handle file uploads to a specific folder
app.post("/upload/:folder", upload.single("file"), (req, res) => {
  res.send("File uploaded successfully!");
});

app.post("/createFolder", async (req, res) => {
  const folderName = req.body.folderName;

  try {
    await fs.mkdir(`uploads/${folderName}`);
    res.status(200).json({ message: "Folder created successfully" });
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Delete Folder
app.post("/deleteFolder", async (req, res) => {
  const folderName = req.body.folderName;

  try {
    // Use recursive option to delete the folder and its contents
    await fs.rmdir(`uploads/${folderName}`, { recursive: true });
    res.status(200).json({ message: "Folder deleted successfully" });
  } catch (error) {
    console.error("Error deleting folder:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Get all folders and their contents
app.get("/allFolders", async (req, res) => {
  const uploadsPath = path.join(__dirname, "uploads");

  try {
    const folders = await fs.readdir(uploadsPath);
    const folderData = await Promise.all(
      folders.map(async (folder) => {
        const folderPath = path.join(uploadsPath, folder);
        const files = await fs.readdir(folderPath);
        return { folder, files };
      })
    );

    res.status(200).json({ folders: folderData });
  } catch (error) {
    console.error("Error fetching all folders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// New endpoint for deleting a file
app.delete("/deleteFile/:folder/:filename", async (req, res) => {
  const folder = req.params.folder;
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "uploads", folder, filename);

  try {
    await fs.unlink(filePath);
    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Handle file downloads
app.get("/download/:folder/:filename", (req, res) => {
  try {
    const fileName = req.params.filename;
    const folder = req.params.folder;

    // Sanitize file and folder names
    const sanitizedFileName = path.basename(fileName);
    const sanitizedFolder = path.basename(folder);

    const filePath = path.join("uploads", sanitizedFolder, sanitizedFileName);

    res.download(filePath, (err) => {
      if (err) {
        // Handle errors (e.g., file not found)
        res.status(404).send("File not found");
      }
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/download/:folder", async (req, res) => {
  const folderName = req.params.folder;
  const folderPath = path.join(__dirname, "uploads", folderName);

  try {
    const zipFilePath = path.join(__dirname, "temp", `${folderName}.zip`);
    const zip = new AdmZip();

    await addFilesToZip(zip, folderPath, folderName);

    zip.writeZip(zipFilePath);

    res.download(zipFilePath, `${folderName}.zip`, async () => {
      await fs.unlink(zipFilePath);
    });
  } catch (error) {
    console.error("Error creating zip file:", error);
    res.status(500).send("Internal Server Error");
  }
});

async function addFilesToZip(zip, folderPath, folderName) {
  const files = await fs.readdir(folderPath);

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const relativePath = path.join(folderName, file);

    const stats = await fs.stat(filePath);

    if (stats.isDirectory()) {
      await addFilesToZip(zip, filePath, relativePath);
    } else {
      const fileContent = await fs.readFile(filePath);
      zip.addFile(relativePath, fileContent);
    }
  }
}
app.post("/uploadFolder/:folder", upload.single("folder"), async (req, res) => {
  const folderName = req.params.folder;
  const folderZipBuffer = req.file.buffer;

  try {
    // Save the zip file temporarily
    const tempZipPath = path.join(__dirname, "temp", "uploadedFolder.zip");
    await fs.writeFile(tempZipPath, folderZipBuffer);

    // Unzip the folder
    const unzipDestination = path.join(__dirname, "uploads", folderName);
    const zip = new AdmZip(tempZipPath);
    zip.extractAllTo(unzipDestination, true);

    // Cleanup: Remove the temporary zip file
    await fs.unlink(tempZipPath);

    res.status(200).json({ message: "Folder uploaded and extracted successfully" });
  } catch (error) {
    console.error("Error uploading and extracting folder:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint for renaming a file
app.put('/renameFile/:folder/:oldFileName', (req, res) => {
  const folder = req.params.folder;
  const oldFileName = req.params.oldFileName;
  const newFileName = req.body.newFileName;

  fs.rename(`uploads/${folder}/${oldFileName}`, `uploads/${folder}/${newFileName}`, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to rename file' });
    }
    res.json({ message: 'File renamed successfully', folder, oldFileName, newFileName });
  });
});



app.listen(port, () => {
  console.log(`Example app listening on port http://127.0.0.1:${port}`);
});
