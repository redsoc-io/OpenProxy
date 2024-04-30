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
  var data_path = path.join(__dirname, "../../../../data/data.json");
  console.log(data_path, __dirname);
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
