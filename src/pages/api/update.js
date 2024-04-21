import db from "../../lib/mongo";
import downloadFileWithProxy from "../../lib/proxyDownload";
const n = 100;

export default async function handler(req, res) {
  const mg = await db();
  const docs = await mg.find().sort({ last_checked: 1 }).limit(n).toArray();
  const startTime = new Date();

  var test = docs.map(async (doc) => {
    try {
      const test_results = await downloadFileWithProxy(doc.url);
      doc.last_checked = new Date();
      doc.tested = 1;
      doc.response_time = test_results.responseTime;
      doc.working = true;
      console.log("Working: ", doc.url);
    } catch (e) {
      doc.last_checked = new Date();
      doc.tested = 1;
      doc.working = false;
      console.log("Error: ", doc.url);
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

  const set = await mg.bulkWrite(bulkUpdateOperations);

  const dbWriteEndTime = new Date();

  const working = test.filter((t) => t.working);

  res.status(200).json({
    working: working.length,
    tested: test.length,
    date: new Date(),
    delay: endTime - startTime,
    dbWriteTime: dbWriteEndTime - dbWriteTime,
  });
}
