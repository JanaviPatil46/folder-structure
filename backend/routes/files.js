// server/routes/file.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const File = require("../models/Files");
const multer = require('multer');

const upload = multer({ dest: "uploads/" });

// Upload a file
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { file } = req;
    const newFile = new File({
      filename: file.filename,
      originalname: file.originalname,
      path: file.path,
    });
    await newFile.save();
    res.json(newFile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all files
router.get("/", async (req, res) => {
  try {
    const files = await File.find();
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
