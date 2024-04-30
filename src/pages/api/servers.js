const path = require("path");
const fs = require("fs");

const readFile = (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(JSON.parse(data));
    });
  });
};

export default async function handler(req, res) {
  const PWD = process.env.PWD;
  var data_path = `${PWD}/data/working.json`;
  var servers = await readFile(data_path);

  console.log(`Total Available: ${servers.length}`);
  res.status(200).json(servers);
}
