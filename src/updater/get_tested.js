const proxyService = require("../lib/proxyService");

const get_tested = async () => {
  return await proxyService.findMany({
    where: {
      tested: true,
      working: false
    },
    take: 50,
    orderBy: {
      lastChecked: 'asc'
    }
  });
};

module.exports = get_tested;
