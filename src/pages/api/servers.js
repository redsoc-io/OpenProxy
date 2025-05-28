const proxyService = require("../../lib/proxyService");
const getRedisClient = require("../../lib/redis");

const CACHE_KEY = 'api:servers:working';
const CACHE_TTL = 60; // Cache for 60 seconds

export default async function handler(req, res) {
  const redis = getRedisClient();
  
  try {
    // Try to get from cache first
    const cachedData = await redis.get(CACHE_KEY);
    if (cachedData) {
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json(JSON.parse(cachedData));
    }

    // If not in cache, fetch from database
    const servers = await proxyService.findMany({
      where: {
        working: true,
      },
    });

    // Cache the result
    await redis.set(CACHE_KEY, JSON.stringify(servers), 'EX', CACHE_TTL);
    
    res.setHeader('X-Cache', 'MISS');
    res.status(200).json(servers);
  } catch (error) {
    console.error("Error fetching servers:", error);
    res.status(500).json({ error: "Failed to fetch servers" });
  }
}
