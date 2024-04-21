import db from "../../lib/mongo";
import downloadFileWithProxy from "../../lib/proxyDownload";
const n = 10;

export default async function handler(req, res) {
  const mg = await db();
  const docs = await mg.find().sort({ last_checked: 1 }).limit(n).toArray();

  var test = docs.map(async (doc) => {
    console.log(doc.url);
    try {
      const test_results = await downloadFileWithProxy(doc.url);
      doc.last_checked = new Date();
      doc.tested = 1;
      doc.response_time = test_results.responseTime;
      doc.working = true;
      doc.bandwidth = test_results.fileSize;
    } catch {
      doc.last_checked = new Date();
      doc.tested = 1;
      doc.working = false;
      doc.bandwidth = 0;
    }
    return doc;
  });

  test = await Promise.all(test);

  const dbUpdate = test.map((doc) => {
    return mg.updateOne({ _id: doc._id }, { $set: doc });
  });

  const resuts = await Promise.all(dbUpdate);

  const working = test.filter((t) => t.working);

  res.status(200).json({ working, test });
}
