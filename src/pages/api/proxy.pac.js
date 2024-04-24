import db from "../../lib/mongo";

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

var cached = {
  urls: [],
  last_updated: 0,
};

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/x-ns-proxy-autoconfig");
  res.setHeader("Content-Disposition", "attachment; filename=proxy.pac");

  if (cached.url && Date.now() - cached.last_updated < 1000 * 60 * 2) {
    console.log("Serving cached proxy.pac");
    res.status(200).send(write_proxy_pac(cached.urls));
    return;
  }

  const col = await db();
  var servers = await col
    .find(
      { working: true },
      {
        projection: {
          _id: 0,
          lastOnline: 0,
        },
      }
    )
    .sort({
      last_checked: -1,
    })
    .toArray();

  servers = servers.sort((a, b) => b.streak - a.streak);
  const urls = servers.map((server) => server.url);

  cached.urls = urls;
  cached.last_updated = Date.now();

  res.status(200).send(write_proxy_pac(urls));
}
