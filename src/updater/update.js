const proxyService = require("../lib/proxyService");

const update = async (servers) => {
  const operations = servers.map((server) => {
    const { id, ...data } = server;
    return proxyService.updateServer(id, data);
  });

  const results = await Promise.all(operations);
  const modifiedCount = results.filter(Boolean).length;
  
  console.log(`Updated ${modifiedCount} Records.`);
  return { modifiedCount };
};

module.exports = update;
