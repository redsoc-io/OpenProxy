const proxyService = require("../lib/proxyService");

const get_working = async () => {
  const ta = new Date(Date.now() - 3 * 60 * 1000);
  return await proxyService.findMany({
    where: {
      working: true,
      lastChecked: {
        lt: ta.toISOString()
      }
    },
    take: 20,
    orderBy: {
      lastChecked: 'asc'
    }
  });
};

module.exports = get_working;
