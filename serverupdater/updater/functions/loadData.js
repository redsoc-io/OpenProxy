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
