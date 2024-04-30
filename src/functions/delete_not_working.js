const datastore = require("../lib/datastore");

async function delete_not_working() {
  var timeTaken = Date.now();

  const mongo = await db();

  const deleteR = await mongo.deleteMany({
    streak: { $lt: -30 },
  });

  timeTaken = Date.now() - timeTaken;

  return {
    deleted: deleteR.deletedCount,
  };
}

module.exports = delete_not_working;
