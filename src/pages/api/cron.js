import axios from "axios";

export default async function handler(req, res) {
  try {
    const protocol = req.connection.encrypted ? "https" : "http";
    const host_base = req.headers.host;
    const base_url = `${protocol}://${host_base}`;

    let resp = {};

    try {
      const { data } = await axios.get(`${base_url}/api/update`);
      resp = data;
    } catch (e) {
      console.log(e);
    }
    res.status(200).json({
      base_url,
      time: new Date(),
      ...resp,
    });
  } catch (e) {
    console.log(e);
  }
}
