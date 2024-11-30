const list = require("../data/lists.json");
const crypto = require("crypto");
const upsert = require("./upsert");

function sha2hash(text) {
  return crypto.createHash("md5").update(text).digest("hex");
}

async function find_new() {
  const p = list.map(async ({ url }) => {
    const res = await fetch(url);
    const d = await res.text();
    const urls = d.split("\n");
    return urls;
  });
  const data = (await Promise.all(p)).flat().filter((p) => !!p);
  const flat = [...new Set(data)].map((u) => ({
    url: u,
    id: sha2hash(u),
    type: u.split(":")[0].toLowerCase(),
  }));

  return await upsert(flat);
}

module.exports = find_new;
