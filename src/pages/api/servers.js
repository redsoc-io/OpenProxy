import db from "../../lib/mongo";

export default async function handler(req, res) {
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
  console.log(`Total Available: ${servers.length}`);
  res.status(200).json(servers);
}
