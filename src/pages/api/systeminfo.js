const si = require("systeminformation");
const fs = require("fs");
const { PWD } = process.env;

async function getFileSize(filePath) {
  try {
    const stats = await fs.promises.stat(filePath);
    const fileSizeInBytes = stats.size;
    return fileSizeInBytes;
  } catch (err) {
    console.error("Error getting file size:", err);
    return null;
  }
}

export default async function handler(req, res) {
  var data = {};

  try {
    const { manufacturer, brand } = await si.cpu();
    data.cpu = {
      manufacturer,
      brand,
    };
  } catch (e) {
    console.error(e);
  }

  try {
    const { total, free, used } = await si.mem();
    data.mem = {
      total,
      free,
      used,
    };
  } catch (e) {
    console.error(e);
  }

  try {
    const s = await si.fsSize();
    data.fsSize = s;
  } catch (e) {
    console.error(e);
  }

  try {
    console.log("PWD:", PWD);
    const fileSize = await getFileSize(`${PWD}/data/data.json`);
    data.dataSize = fileSize;
  } catch (e) {
    console.error(e);
  }
  res.status(200).json(data);
}
