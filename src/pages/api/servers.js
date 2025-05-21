const proxyService = require("../../lib/proxyService");

export default async function handler(req, res) {
  try {
    const servers = await proxyService.findMany({
      where: {
        working: true,
      },
    });
    res.status(200).json(servers);
  } catch (error) {
    console.error("Error fetching servers:", error);
    res.status(500).json({ error: "Failed to fetch servers" });
  }
}
