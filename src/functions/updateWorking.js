const db = require("../lib/mongo");
const downloadFileWithProxy = require("../lib/proxyDownload");
const n = 100;

async function updateWorking() {
  const mg = await db();
  const thresholdTime = new Date(Date.now() - 3 * 60 * 1000);
  const docs = await mg
    .find({ working: true, last_checked: { $lt: thresholdTime } })
    .limit(n)
    .toArray();

  if (docs.length === 0) {
    return {};
  }

  const startTime = new Date();

  var test = docs.map(async (doc) => {
    try {
      const test_results = await downloadFileWithProxy(doc.url);
      doc.last_checked = new Date();
      doc.tested = 1;
      doc.response_time = test_results.responseTime;
      doc.working = true;
      doc.streak = (doc.streak || 0) + 1;
      doc.geo = test_results.geo;
    } catch (e) {
      doc.last_checked = new Date();
      doc.tested = 1;
      doc.working = false;
      doc.streak = 0;
      //console.log(e);
    }
    return doc;
  });

  test = await Promise.all(test);

  const bulkUpdateOperations = test.map((doc) => ({
    updateOne: {
      filter: { _id: doc._id },
      update: { $set: doc },
    },
  }));
  const endTime = new Date();

  const dbWriteTime = new Date();

  if (bulkUpdateOperations.length > 0) {
    const set = await mg.bulkWrite(bulkUpdateOperations);
  }

  const dbWriteEndTime = new Date();

  const working = test.filter((t) => t.working);

  return {
    working: working.length,
    tested: test.length,
    date: new Date(),
    delay: endTime - startTime,
    dbWriteTime: dbWriteEndTime - dbWriteTime,
  };
}

module.exports = updateWorking;
