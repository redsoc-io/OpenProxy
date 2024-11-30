const db = require("../lib/mongodb");

const update = async (servers) => {
  const t = servers.map((s) => {
    const d = { ...s };
    delete d.id;
    return {
      updateOne: {
        filter: { _id: s.id },
        update: { $set: d },
      },
    };
  });
  const result = await db.db("servers").collection("servers").bulkWrite(t);
  console.log(`Updated ${result.modifiedCount} Records.`);
  return result;
};

module.exports = update;
