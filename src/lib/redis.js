const Redis = require('ioredis');

let redis = null;

function getRedisClient() {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }
  return redis;
}

module.exports = getRedisClient;
