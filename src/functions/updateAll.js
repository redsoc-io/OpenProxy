const db = require("../lib/mongo");
const downloadFileWithProxy = require("../lib/proxyDownload");
async function updateAll(days = 7) {
  const mg = await db();

  const n = 200;

  const thresholdTime = new Date(Date.now() - 1000 * 60 * 60 * 24 * days);
  const docs = await mg
    .find({
      working: false,
      addedOn: { $gt: thresholdTime },
    })
    .sort({ last_checked: 1 })
    .limit(n)
    .toArray();
  const startTime = new Date();

  var test = docs.map(async (doc) => {
    try {
      const test_results = await downloadFileWithProxy(doc.url);
      doc.last_checked = new Date();
      doc.tested = 1;
      doc.response_time = test_results.responseTime;
      doc.working = true;
      doc.geo = test_results.country;
      doc.lastOnline = new Date();
    } catch (e) {
      doc.last_checked = new Date();
      doc.tested = 1;
      doc.working = false;
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

module.exports = updateAll;
