export default async function handler(req, res) {
  const { from } = req.query;
  console.log(`Hello from ${from}`);
  res.status(200).json({ from: from || "???" });
}
