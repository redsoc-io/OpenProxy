const db = require("../lib/db");

const get_working = async () => {
  const ta = new Date(Date.now() - 3 * 60 * 1000);
  return await db.servers.findMany({
    where: {
      working: true,
      lastChecked: {
        lt: ta,
      },
    },
    take: 20,
    orderBy: {
      lastChecked: "asc",
    },
  });
};

module.exports = get_working;
