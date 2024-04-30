import fs from "fs";

function write_proxy_pac(urls) {
  urls = urls.map((url) => {
    url = url
      .replace("http://", "")
      .replace("https://", "")
      .replace("socks5://", "")
      .replace("socks4://", "");
    return `PROXY ${url}`;
  });
  return `
    function FindProxyForURL(url, host) {
        return '${urls.join(";")}';
    }
  `;
}

function filepathExists(filepath) {
  try {
    fs.accessSync(filepath, fs.constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}

function readFile(filepath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, { encoding: "utf8" }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
}

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/x-ns-proxy-autoconfig");
  res.setHeader("Content-Disposition", "attachment; filename=proxy.pac");

  const { PWD } = process.env;
  console.log(PWD);
  var data_path = `${PWD}/data/working.json`;

  console.log(data_path);

  if (!filepathExists(data_path)) {
    console.log("Working.json file not found");
    res.status(500).json([]);
    return;
  }

  var servers = await readFile(data_path);
  console.log(servers);

  servers = servers.sort((a, b) => b.streak - a.streak);
  const urls = servers.map((server) => server.url);

  res.status(200).send(write_proxy_pac(urls));
}
