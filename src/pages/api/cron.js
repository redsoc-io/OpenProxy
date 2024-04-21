import axios from "axios";
let running = false;

export default async function handler(req, res) {
  if (running) {
    return;
  }
  running = true;

  try {
    const protocol = req.connection.encrypted ? "https" : "http";
    const host_base = req.headers.host;
    const base_url = `${protocol}://${host_base}`;

    await axios.get(`${base_url}/api/update`);

    res.status(200).json({
      base_url,
      time: new Date(),
    });

    setTimeout(() => {
      axios.get(`${base_url}/api/cron`);
    }, 2000);
  } catch (e) {
    console.log(e);
  }

  running = false;
}
