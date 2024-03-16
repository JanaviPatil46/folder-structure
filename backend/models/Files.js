// server/models/File.js
const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  filename: String,
  originalname: String,
  path: String,
});

const File = mongoose.model("File", fileSchema);

module.exports = File;
