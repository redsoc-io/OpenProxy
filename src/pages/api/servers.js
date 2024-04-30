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
  var data_path = `${PWD}/data/data.json`;
  console.log(data_path, __dirname, PWD);
  var read = await readFile(data_path);
  var servers = Object.keys(read)
    .map((key) => {
      return {
        _id: key,
        ...read[key],
      };
    })
    .filter((doc) => doc.working === true)
    .sort((a, b) => b.streak - a.streak);

  console.log(`Total Available: ${servers.length}`);
  res.status(200).json(servers);
}
