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

async function get_all_docs() {
  return (await db()).find({}, { projection: { _id: 1 } }).toArray();
}

export default async function handler(req, res) {
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
  dat = Array.from(new Set(dat));
  len = len - dat.length;
  dat = dat.sort();

  const insert = dat.map((server) => {
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

  const docs = (await get_all_docs()).map(({ _id }) => {
    return _id;
  });

  const filtered = insert.filter(({ _id }) => {
    return !docs.includes(_id);
  });

  if (filtered.length > 0) {
    (await db()).insertMany(filtered);
  }

  res.status(200).json({
    found: dat.length,
    added: filtered.length,
    total_servers: docs.length + filtered.length,
    removed_duplicates: len,
  });
}
