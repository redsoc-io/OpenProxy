import sources from "../../data/lists.json";
import db from "../../lib/mongo";
import crypto from "crypto";

function isValidUrl(url) {
  var urlRegex = /^(http|https|socks4|socks5):\/\/[^ "]+$/;

  return urlRegex.test(url);
}

function sha2hash(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

async function get_existing_servers() {
  const sv = await db();
  const servers = await sv.find({}, { projection: { _id: 1 } }).toArray();
  const docs = servers.map(({ _id }) => {
    return _id;
  });
  const set = new Set(docs);
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
    };
  });

  insert = await Promise.all(insert);

  return insert;
}

export default async function handler(req, res) {
  const prm = [get_existing_servers, get_new_servers].map(async (fn) => {
    return await fn();
  });

  const [docs, data] = await Promise.all(prm);

  var filtered = data.filter(({ _id }) => !docs.has(_id));

  if (filtered.length > 0) {
    (await db()).insertMany(filtered);
  }

  res.status(200).json({
    added: filtered.length,
  });
}
