const db = require("../lib/mongo");
const downloadFileWithProxy = require("../lib/proxyDownload");

async function updateWorking() {
  const mg = await db();
  const thresholdTime = new Date(Date.now() - 3 * 60 * 1000);
  const n = 20;
  const docs = await mg
    .find({ working: true, last_checked: { $lt: thresholdTime } })
    .sort({ last_checked: 1 })
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
      doc.working = true;
      doc.streak = (doc.streak || 0) + 1;
      doc.lastOnline = new Date();
      doc = { ...doc, ...test_results };
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
  const workingCountries = working.map((t) => t.geo);

  return {
    working: working.length,
    workingCountries: workingCountries,
    tested: test.length,
    date: new Date(),
    delay: endTime - startTime,
    dbWriteTime: dbWriteEndTime - dbWriteTime,
  };
}

module.exports = updateWorking;
