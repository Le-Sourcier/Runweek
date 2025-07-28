const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const xlsx = require("xlsx");

function parseFile(filePath, originalName = "") {
  return new Promise((resolve, reject) => {
    const ext = path.extname(originalName || filePath).toLowerCase();
    const rows = [];

    if (ext === ".csv") {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => {
          if (Object.keys(data).length > 0) rows.push(data);
        })
        .on("end", () => resolve(rows));
    } else if (ext === ".xlsx" || ext === ".xls") {
      const workbook = xlsx.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = xlsx.utils.sheet_to_json(sheet);
      resolve(jsonData);
    } else {
      reject(new Error("Unsupported file format"));
    }
  });
}

module.exports = parseFile;
