const db = require("../../lib/db");

export default async function handler(req, res) {
  const servers = await db.servers.findMany({
    where: {
      working: true,
    },
  });
  res.status(200).json(servers);
}
