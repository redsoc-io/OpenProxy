const sources = require("../../../src/data/lists.json");
const crypto = require("crypto");
const transformObjects = require("../transformObject");

function isValidUrl(url) {
  var urlRegex = /^(http|https|socks4|socks5):\/\/[^ "]+$/;

  return urlRegex.test(url);
}

function sha2hash(text) {
  return crypto.createHash("sha256").update(text).digest("base64");
}

async function get_new_servers() {
  var dat = sources.map(async (source) => {
    const request = await fetch(source.url);
    var data = await request.text();

    data = data.split("\n");
    data = data.map((line) => {
      if (source.type === "http") return `http://${line}`;
      if (source.type === "https") return `https://${line}`;
      if (source.type === "socks4") return `socks4://${line}`;
      if (source.type === "socks5") return `socks5://${line}`;
      return line;
    });
    return data;
  });

  dat = await Promise.all(dat);

  dat = dat.flat();
  dat = dat.filter((line) => isValidUrl(line));
  var len = dat.length;
  dat = new Set(dat);
  dat = Array.from(dat);
  len = len - dat.length;

  var insert = dat.map(async (server) => {
    const hash = sha2hash(server);
    return {
      _id: hash,
      url: server,
      last_checked: new Date(),
      tested: 0,
      response_time: 0,
      working: false,
      streak: 0,
      addedOn: new Date(),
    };
  });

  insert = await Promise.all(insert);

  return insert;
}

async function findNew(data) {
  const existingDataLength = Object.keys(data).length;
  var timeTaken = Date.now();
  const prm = [get_new_servers].map(async (fn) => {
    const result = await fn();
    return result;
  });

  const [nservers] = await Promise.all(prm);
  const n_servers_transformed = transformObjects(nservers);

  data = { ...n_servers_transformed, ...data };

  const newDataLength = Object.keys(data).length;

  timeTaken = Date.now() - timeTaken;

  return {
    data,
    result: {
      newServers: newDataLength - existingDataLength,
      timeTaken,
    },
  };
}

module.exports = findNew;
