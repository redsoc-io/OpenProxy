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

    setTimeout(() => {
      try {
        axios.get(`${base_url}/api/cron`);
      } catch (e) {
        console.log(e);
      }
    }, 8000);

    try {
      await axios.get(`${base_url}/api/update`);
    } catch (e) {
      console.log(e);
    }

    res.status(200).json({
      base_url,
      time: new Date(),
    });
  } catch (e) {
    console.log(e);
  }

  running = false;
}
