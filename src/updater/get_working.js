const db = require("../lib/db");

const get_working = async () => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return await db.servers.findMany({
    where: {
      working: true,
      lastChecked: {
        lt: fiveMinutesAgo,
      },
    },
    take: 5,
    orderBy: {
      lastChecked: "asc",
    },
  });
};

module.exports = get_working;
