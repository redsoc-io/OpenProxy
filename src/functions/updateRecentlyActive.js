const datastore = require("../lib/datastore");
const downloadFileWithProxy = require("../lib/proxyDownload");

async function updateRecentlyActive(days = 20) {
  const thresholdTime = new Date(Date.now() - 1000 * 60 * 60 * 24 * days);
  const n = 30;

  const docs = datastore
    .filter((doc) => {
      if (!doc.lastOnline) return false;
      const conv = new Date(doc.lastOnline);
      return conv > thresholdTime;
    })
    .filter((doc) => doc.working === false)
    .sort((a, b) => new Date(a.last_checked) - new Date(b.last_checked))
    .splice(0, n);

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
      doc.streak = doc.streak ? (doc.streak > 0 ? doc.streak + 1 : 0) : 1;
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

module.exports = updateRecentlyActive;
