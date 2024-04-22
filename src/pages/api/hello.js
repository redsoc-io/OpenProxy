export default async function handler(req, res) {
  const { from } = req;
  res.status(200).json({ from: from || "???" });
}
