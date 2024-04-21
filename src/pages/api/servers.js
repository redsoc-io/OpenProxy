import db from "../../lib/mongo";

export default async function handler(req, res) {
  const col = await db();
  const servers = await col
    .find({ working: true })
    .sort({
      last_checked: -1,
    })
    .toArray();
  res.status(200).json(servers);
}
