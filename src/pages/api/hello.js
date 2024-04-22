export default async function handler(req, res) {
  const { from } = req.query;

  const country = req.headers["X-Vercel-IP-Country"];

  console.log(`Hello from ${country || "??"} by ${from}`);
  res.status(200).json({ from: from || "???", country: country || "??" });
}
