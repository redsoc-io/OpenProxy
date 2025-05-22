const proxyService = require("../lib/proxyService");

const get_untested = async () => {
  return await proxyService.findMany({
    where: {
      tested: false,
      working: false
    },
    take: 50,
    orderBy: {
      addedOn: 'asc'
    }
  });
};

module.exports = get_untested;
