import axios from "axios";

function resend(base_url) {
  setTimeout(() => {
    try {
      axios.get(`${base_url}/api/cron`);
    } catch (e) {
      console.log(e);
      resend(base_url);
    }
  }, 8000);
}

export default async function handler(req, res) {
  try {
    const protocol = req.connection.encrypted ? "https" : "http";
    const host_base = req.headers.host;
    const base_url = `${protocol}://${host_base}`;

    try {
      resend(base_url);
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
}
