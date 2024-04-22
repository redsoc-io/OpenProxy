export default async function handler(req, res) {
  const { from } = req;
  console.log(`Hello from ${from}`);
  res.status(200).json({ from: from || "???" });
}
