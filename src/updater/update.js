const db = require("../lib/db");

const update = async (servers) => {
  const updatedRecords = await prisma.$transaction(
    servers.map((s) => {
      const d = { ...s };
      delete d.id;
      return db.servers.update({
        where: { id: s.id },
        data: d,
      });
    })
  );
  return updatedRecords;
};

module.exports = update;
