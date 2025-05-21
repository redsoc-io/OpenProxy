const getRedisClient = require('./redis');
const redis = getRedisClient();

class ProxyService {
  constructor() {
    this.client = redis;
  }

  async addServer(server) {
    const { id, url, ...data } = server;
    await this.client.hset(`server:${id}`, {
      id,
      url,
      tested: false,
      working: false,
      addedOn: new Date().toISOString(),
      ...data
    });
    await this.client.sadd('servers', id);
  }

  async getServer(id) {
    const server = await this.client.hgetall(`server:${id}`);
    if (!server || Object.keys(server).length === 0) return null;
    return this.parseServer(server);
  }

  async findMany({ where = {}, take = null, orderBy = null } = {}) {
    const serverIds = await this.client.smembers('servers');
    const servers = await Promise.all(
      serverIds.map(id => this.getServer(id))
    );

    let filteredServers = servers.filter(server => {
      if (!server) return false;
      return Object.entries(where).every(([key, value]) => {
        if (typeof value === 'object') {
          if (value.not === null) return server[key] !== null;
          if (value.lt) return new Date(server[key]) < new Date(value.lt);
        }
        return server[key] === value;
      });
    });

    if (orderBy) {
      const [field, order] = Object.entries(orderBy)[0];
      filteredServers.sort((a, b) => {
        if (order === 'asc') return a[field] > b[field] ? 1 : -1;
        return a[field] < b[field] ? 1 : -1;
      });
    }

    if (take) {
      filteredServers = filteredServers.slice(0, take);
    }

    return filteredServers;
  }

  async updateServer(id, data) {
    const server = await this.getServer(id);
    if (!server) return null;

    const updatedData = { ...server, ...data };
    await this.client.hset(`server:${id}`, updatedData);
    return updatedData;
  }

  async bulkWrite(operations) {
    const pipeline = this.client.pipeline();
    
    for (const op of operations) {
      if (op.updateOne) {
        const { filter, update } = op.updateOne;
        const { _id } = filter;
        const updateData = update.$set;
        pipeline.hset(`server:${_id}`, updateData);
      }
    }

    const results = await pipeline.exec();
    return {
      modifiedCount: results.filter(([err, res]) => !err && res === 'OK').length
    };
  }

  parseServer(server) {
    return {
      ...server,
      tested: server.tested === 'true',
      working: server.working === 'true',
      responseTime: parseInt(server.responseTime || '-1'),
      streak: parseInt(server.streak || '0'),
      addedOn: server.addedOn ? new Date(server.addedOn) : null,
      lastOnline: server.lastOnline ? new Date(server.lastOnline) : null,
      lastChecked: server.lastChecked ? new Date(server.lastChecked) : null
    };
  }
}

module.exports = new ProxyService();
