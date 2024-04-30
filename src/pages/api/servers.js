export default async function handler(req, res) {
  const data = require("../../../data/data.json");
  var servers = Object.keys(data)
    .map((key) => {
      return {
        _id: key,
        ...data[key],
      };
    })
    .filter((doc) => doc.working === true)
    .sort((a, b) => b.streak - a.streak);

  console.log(`Total Available: ${servers.length}`);
  res.status(200).json(servers);
}
