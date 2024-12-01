const db = require("../lib/db");

const get_tested = async () => {
  return await db.servers.findMany({
    where: {
      tested: true,
      working: false,
    },
    take: 10,
    orderBy: {
      lastChecked: "asc",
    },
  });
};

module.exports = get_tested;
