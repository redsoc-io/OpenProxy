const downloadFileWithProxy = require("../../../src/lib/proxyDownload");
const transformObjects = require("../transformObject");

async function updateAll(data) {
  const startTime = new Date();

  const days = 7;
  const thresholdTime = new Date(Date.now() - 1000 * 60 * 60 * 24 * days);

  const docs = Object.keys(data)
    .map((key) => {
      return {
        _id: key,
        ...data[key],
      };
    })
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

  const working = test.filter((t) => t.working);
  const workingCountries = working.map((t) => t.geo);
  const updatedCount = test.length;

  const endTime = new Date();

  const transformed = transformObjects(test);

  data = {
    ...data,
    ...transformed,
  };

  return {
    result: {
      working: working.length,
      updated: updatedCount,
      workingCountries: workingCountries,
      timeTaken: endTime - startTime,
    },
    data,
  };
}

module.exports = updateAll;
