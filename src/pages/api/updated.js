// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default async function handler(req, res) {
  const request = await fetch(`https://api.oproxy.ml`);
  const data = await request.text();
  res.statusCode = 200;
  res.send(data);
}
