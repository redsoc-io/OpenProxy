const db = require("../lib/db");

const upsert = async (servers) => {
  const s_ids = (
    await db.servers.findMany({
      select: {
        id: true,
      },
    })
  ).map(({ id }) => id);
  const insert_servers = servers
    .map((d) => ({
      id: d.id,
      url: d.url,
    }))
    .filter(({ id }) => !s_ids.includes(id));
  if (insert_servers.length > 0) {
    const cm = await db.servers.createMany({
      data: insert_servers,
    });
    return cm.count;
  }
  return 0;
};

module.exports = upsert;
