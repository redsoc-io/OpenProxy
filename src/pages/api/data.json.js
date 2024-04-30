const path = require("path");
const fs = require("fs");

function filepathExists(filepath) {
  try {
    fs.accessSync(filepath, fs.constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}
export default async function handler(req, res) {
  const PWD = process.env.PWD;
  var data_path = `${PWD}/data/data.json`;

  if (!filepathExists(data_path)) {
    console.log("Working.json file not found");
    res.status(500).json([]);
    return;
  }

  const stream = fs.createReadStream(data_path, { encoding: "utf8" });
  res.setHeader("Content-Type", "application/json");

  stream.pipe(res);
}
