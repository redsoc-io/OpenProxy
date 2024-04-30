const datastore = require("../lib/datastore");
const downloadFileWithProxy = require("../lib/proxyDownload");
async function updateAll(days = 7) {
  const startTime = new Date();
  const thresholdTime = new Date(Date.now() - 1000 * 60 * 60 * 24 * days);
  const docs = datastore
    .filter((doc) => {
      const conv = new Date(doc.last_checked);
      return conv > thresholdTime;
    })
    .filter((doc) => doc.working === false)
    .sort((a, b) => new Date(a.last_checked) - new Date(b.last_checked))
    .splice(0, 30);

  var test = docs.map(async (doc) => {
    try {
      const test_results = await downloadFileWithProxy(doc.url);
      doc.last_checked = new Date();
      doc.tested = 1;
      doc.working = true;
      doc.lastOnline = new Date();
      doc = { ...doc, ...test_results };
    } catch (e) {
      doc.last_checked = new Date();
      doc.tested = 1;
      doc.working = false;
      doc.streak -= 1;
      //console.log(e);
    }
    return doc;
  });

  test = await Promise.all(test);

  const endTime = new Date();

  const dbWriteTime = new Date();

  const updated = datastore.update(test);

  const dbWriteEndTime = new Date();

  const working = test.filter((t) => t.working);
  const workingCountries = working.map((t) => t.geo);
  return {
    working: working.length,
    updated: updated.updatedCount,
    workingCountries: workingCountries,
    tested: test.length,
    date: new Date(),
    delay: endTime - startTime,
    dbWriteTime: dbWriteEndTime - dbWriteTime,
  };
}

module.exports = updateAll;
