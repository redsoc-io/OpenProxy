import { time } from "console";

const fs = require("fs");
const axios = require("axios");
const { SocksProxyAgent } = require("socks-proxy-agent");
const HttpsProxyAgent = require("https-proxy-agent");

export default async function downloadFileWithProxy(proxyUrl) {
  var url =
    "https://github.com/jamesward/play-load-tests/raw/master/public/1mb.txt";
  let agent;
  if (proxyUrl.startsWith("socks")) {
    agent = new SocksProxyAgent(proxyUrl);
  } else if (proxyUrl.startsWith("http")) {
    agent = new HttpsProxyAgent(proxyUrl);
  } else {
    throw new Error("Invalid proxy URL");
  }

  return new Promise(async (resolve, reject) => {
    setTimeout(() => {
      reject("Timeout!");
    }, 6000);
    const start = Date.now();

    let response = null;

    try {
      response = await axios({
        method: "GET",
        url: url,
        responseType: "stream",
        httpAgent: agent,
        httpsAgent: agent,
      });
    } catch (e) {
      reject(e);
    }

    if (response === null) {
      return;
    }

    const end = Date.now();
    const responseTime = end - start;

    const fileSize = response.headers["content-length"];
    const writeStream = fs.createWriteStream("downloaded_file");

    let downloadedSize = 0;
    response.data.on("data", (chunk) => {
      downloadedSize += chunk.length;
      const speed = downloadedSize / ((Date.now() - start) / 1000); // bytes per second
      console.log(`Download speed: ${speed.toFixed(2)} B/s`);
    });

    response.data.pipe(writeStream);

    writeStream.on("finish", () => {
      const speed =
        ((downloadedSize / 1024) * 1021) / ((Date.now() - start) / 1000); // MB per second
      console.log(`Download speed: ${speed.toFixed(2)} MB/s`);
      console.log(`Response time: ${responseTime} ms`);
      resolve({
        fileSize,
        responseTime,
      });
    });
    writeStream.on("error", (err) => {
      reject(err);
    });
  });
}
