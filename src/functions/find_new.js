const sources = require("../data/lists.json");
const crypto = require("crypto");
const datastore = require("../lib/datastore");

function isValidUrl(url) {
  var urlRegex = /^(http|https|socks4|socks5):\/\/[^ "]+$/;

  return urlRegex.test(url);
}

function sha2hash(text) {
  return crypto.createHash("sha256").update(text).digest("base64");
}

async function get_existing_servers() {
  const data = datastore.get().map((doc) => doc._id);

  const set = new Set(data);

  return set;
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

async function find_new() {
  var timeTaken = Date.now();
  const prm = [get_existing_servers, get_new_servers].map(async (fn) => {
    const result = await fn();
    return result;
  });

  const [docs, data] = await Promise.all(prm);

  timeTaken = Date.now() - timeTaken;

  var filtered = data.filter(({ _id }) => !docs.has(_id));

  if (filtered.length > 0) {
    const action = datastore.insert(filtered);

    return {
      added: action.insertedCount,
    };
  }
  return {};
}

module.exports = find_new;
