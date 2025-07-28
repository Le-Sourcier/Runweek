// uploadFile.js
const path = require("path");
const fs = require("fs");
const csvParser = require("csv-parser");
const xlsx = require("xlsx");

// Constants for file validation
const ALLOWED_EXTENSIONS = [".csv", ".xlsx", ".xls"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Validate file before processing
function validateFile(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error(
      `Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(", ")}`
    );
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`
    );
  }
}

// Parse file contents based on type
function parseFile(filePath, originalName = "") {
  return new Promise((resolve, reject) => {
    const ext = path.extname(originalName || filePath).toLowerCase();
    const rows = [];
    try {
      if (ext === ".csv") {
        fs.createReadStream(filePath)
          .on("error", (error) => reject(error))
          .pipe(csvParser())
          .on("data", (data) => {
            if (Object.keys(data).length > 0) {
              rows.push(data);
            }
          })
          .on("end", () => resolve(rows))
          .on("error", (error) => reject(error));
      } else if (ext === ".xlsx" || ext === ".xls") {
        const workbook = xlsx.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = xlsx.utils.sheet_to_json(sheet, { defval: null });
        resolve(jsonData);
      } else {
        reject(new Error("Unsupported file format"));
      }
    } catch (error) {
      reject(error);
    }
  });
}

// Clean up temporary file
function cleanupTempFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      // fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Error cleaning up temp file:", error);
  }
}

// Main upload handler (parses and returns rows)
async function uploadFile(req) {
  const file = req.file;
  if (!file) {
    throw new Error("No file uploaded");
  }
  validateFile(file);
  const rows = await parseFile(file.path, file.originalname);
  cleanupTempFile(file.path);
  return rows;
}

module.exports = { uploadFile, cleanupTempFile };
