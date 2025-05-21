const proxyService = require("../lib/proxyService");

const get_recently_active = async () => {
  return await proxyService.findMany({
    where: {
      working: false,
      tested: true,
      lastOnline: {
        not: null
      }
    },
    take: 50,
    orderBy: {
      lastChecked: 'asc'
    }
  });
};

module.exports = get_recently_active;
