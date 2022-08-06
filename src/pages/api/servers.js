// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default async function handler(req, res) {
  const request = await fetch(`https://api.oproxy.ml/servers`);
  const data = await request.json();
  res.statusCode = 200;
  res.json(data);
}
