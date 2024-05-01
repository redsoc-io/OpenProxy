const fs = require("fs");

async function writeFile(path, data) {
  try {
    fs.writeFileSync(path, JSON.stringify(data));
  } catch (e) {
    console.log(e);
  }
}

async function writeData(data) {
  const { PWD } = process.env;
  var timeTaken = Date.now();
  writeFile(`${PWD}/data/data.json`, data);
  timeTaken = Date.now() - timeTaken;
  return {
    result: {
      total: Object.keys(data).length,
      timeTaken,
    },
    data,
  };
}

module.exports = writeData;
