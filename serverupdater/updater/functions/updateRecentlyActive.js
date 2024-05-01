const transformObjects = require("../transformObject");
const downloadFileWithProxy = require("../../../src/lib/proxyDownload");

async function updateRecentlyActive(data) {
  const days = 20;
  const thresholdTime = new Date(Date.now() - 1000 * 60 * 60 * 24 * days);

  const docs = Object.keys(data)
    .map((key) => {
      return {
        _id: key,
        ...data[key],
      };
    })
    .filter((doc) => {
      if (!doc.lastOnline) return false;
      const conv = new Date(doc.lastOnline);
      return conv > thresholdTime;
    })
    .filter((doc) => doc.working === false)
    .sort((a, b) => new Date(a.last_checked) - new Date(b.last_checked))
    .splice(0, 30);

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

  const working = test.filter((t) => t.working);
  const workingCountries = working.map((t) => t.geo);

  const endTime = new Date();

  const transformed = transformObjects(test);

  data = {
    ...data,
    ...transformed,
  };

  return {
    result: {
      working: working.length,
      workingCountries,
      updatedCount: test.length,
      timeTaken: endTime - startTime,
    },
    data,
  };
}

module.exports = updateRecentlyActive;
