import db from "../../lib/mongo";
function extractIpAddress(urlText) {
  var ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
  var ipAddresses = urlText.match(ipRegex);
  return ipAddresses[0];
}

export default async function handler(req, res) {
  const col = await db();
  var servers = await col
    .find({ working: true })
    .sort({
      last_checked: -1,
    })
    .toArray();
  console.log(`Total Available: ${servers.length}`);
  res.status(200).json(servers);
}
