const db = require("../lib/db");

const get_untested = async () => {
  const newest = await db.servers.findMany({
    where: {
      tested: false,
    },
    take: 10,
    orderBy: {
      addedOn: "asc",
    },
  });
  return newest;
};

module.exports = get_untested;
