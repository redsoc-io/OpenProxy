const datastore = require("../lib/datastore");
const fs = require("fs");

async function writeFile(path, data) {
  try {
    fs.writeFileSync(path, JSON.stringify(data));
  } catch (e) {
    console.log(e);
  }
}
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

async function writeWorking() {
  const { PWD } = process.env;

  const read = datastore.get();

  var servers = Object.keys(read)
    .map((key) => {
      return {
        _id: key,
        ...read[key],
      };
    })
    .filter((doc) => doc.working === true)
    .sort((a, b) => b.streak - a.streak);
  writeFile(`${PWD}/data/working.json`, servers);
}

module.exports = writeWorking;
