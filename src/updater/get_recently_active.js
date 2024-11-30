const db = require("../lib/db");

const get_recently_active = async () => {
  return await db.servers.findMany({
    where: {
      working: false,
      tested: true,
      lastOnline: {
        not: null,
      },
    },
    take: 10,
    orderBy: {
      lastChecked: "asc",
    },
  });
};

module.exports = get_recently_active;
