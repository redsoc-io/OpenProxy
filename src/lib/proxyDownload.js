const axios = require("axios");
const { SocksProxyAgent } = require("socks-proxy-agent");
const HttpsProxyAgent = require("https-proxy-agent");

var url = "https://api.my-ip.io/v2/ip.txt";

async function downloadFileWithProxy(proxyUrl) {
  let agent;
  if (proxyUrl.startsWith("socks")) {
    agent = new SocksProxyAgent(proxyUrl);
  } else if (proxyUrl.startsWith("http")) {
    agent = new HttpsProxyAgent(proxyUrl);
  } else {
    throw new Error("Invalid proxy URL");
  }

  return new Promise(async (resolve, reject) => {
    let response = null,
      start = Date.now();
    const { CancelToken } = axios;

    try {
      response = await axios.get(url, {
        cancelToken: new CancelToken(function executor(c) {
          setTimeout(c, 5000);
        }),
        httpAgent: agent,
        httpsAgent: agent,
        maxRedirects: 0,
      });
    } catch (e) {
      reject("Timeout Probably");
    }

    if (response === null || response.status !== 200) {
      reject("Invalid response");
      return;
    }

    const { data } = response;

    const geo = data.split("\n")[2];

    const response_time = Date.now() - start;

    resolve({ response_time, geo });
  });
}

module.exports = downloadFileWithProxy;
