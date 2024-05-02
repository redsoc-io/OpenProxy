const fs = require("fs");

const createFileIfNotExist = (path) => {
  fs.open(path, "r", (err, fd) => {
    if (err) {
      console.log("File does not exist, creating file");
      fs.writeFile(path, "{}", (err) => {});
    }
  });
};

const readFile = (path) => {
  return new Promise((resolve, reject) => {
    createFileIfNotExist(path);
    fs.readFile(path, "utf8", (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(JSON.parse(data));
    });
  });
};

async function loadData(n) {
  const { PWD } = process.env;
  var timeTaken = new Date();
  const read = await readFile(`${PWD}/data/data.json`);

  timeTaken = new Date() - timeTaken;
  return {
    result: {
      totalServers: Object.keys(read).length,
      timeTaken: timeTaken,
    },
    data: read,
  };
}

module.exports = loadData;
