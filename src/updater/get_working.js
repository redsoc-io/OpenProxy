const db = require("../lib/db");

const get_working = async () => {
  return await db.servers.findMany({
    where: {
      working: true,
    },
    take: 10,
    orderBy: {
      lastChecked: "asc",
    },
  });
};

module.exports = get_working;
