const datastore = require("../lib/datastore");
const downloadFileWithProxy = require("../lib/proxyDownload");

async function updateWorking() {
  const thresholdTime = new Date(Date.now() - 3 * 60 * 1000);

  const docs = datastore
    .filter((doc) => {
      return new Date(doc.last_checked) < thresholdTime;
    })
    .filter((doc) => doc.working === true)
    .sort((a, b) => new Date(a.last_checked) - new Date(b.last_checked))
    .splice(0, 30);

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

module.exports = updateWorking;
