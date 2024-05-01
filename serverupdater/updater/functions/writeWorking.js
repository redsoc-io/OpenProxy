const fs = require("fs");

async function writeFile(path, data) {
  try {
    fs.writeFileSync(path, JSON.stringify(data));
  } catch (e) {
    console.log(e);
  }
}

async function writeWorking(data) {
  const { PWD } = process.env;
  var timeTaken = Date.now();
  var servers = Object.keys(data)
    .map((key) => {
      return {
        _id: key,
        ...data[key],
      };
    })
    .filter((doc) => doc.working === true)
    .sort((a, b) => b.streak - a.streak);
  writeFile(`${PWD}/data/working.json`, servers);
  timeTaken = Date.now() - timeTaken;
  return {
    result: {
      working: servers.length,
      timeTaken,
    },
    data,
  };
}

module.exports = writeWorking;
