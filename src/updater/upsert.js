const proxyService = require("../lib/proxyService");

const upsert = async (servers) => {
  const existingIds = await proxyService.client.smembers('servers');
  
  const insert_servers = servers
    .map((d) => ({
      id: d.id,
      url: d.url,
    }))
    .filter(({ id }) => !existingIds.includes(id));

  if (insert_servers.length > 0) {
    await Promise.all(insert_servers.map(server => proxyService.addServer(server)));
    return insert_servers.length;
  }
  return 0;
};

module.exports = upsert;
