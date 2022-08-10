import fetch from "node-fetch"
import HttpsProxyAgent from "https-proxy-agent";

function write_proxy_pac(url) {
    var split = url.split('://'),
        proto = split[0].toUpperCase(),
        url = split[1]
    return `
    function FindProxyForURL(url, host) {
        return '${proto} ${url}';
    }
  `;
}

async function test_proxy(url) {
    try {
        const proxyAgent = new HttpsProxyAgent(url);
        const response = await fetch('https://raw.githubusercontent.com/jamesward/play-load-tests/master/public/1mb.txt', { agent: proxyAgent, signal: AbortSignal.timeout(3000) });
        return true
    }
    catch (e) {
        // console.log(e)
        return false
    }
}

export default async function handler(req, res) {
    const { filter_country, filter_proto } = req.query;
    const request = await fetch(`https://api.oproxy.ml/servers`);
    var data = await request.json()
    var filter = data
    if (filter_country) {
        filter = filter.filter(x => x.data.country.toLowerCase() === filter_country.toLowerCase())
        console.log(filter)
    }
    if (filter_proto) {
        filter = filter.filter(x => x.proto.toLowerCase() === filter_proto.toLowerCase())
    }
    const best_server = filter.sort((a, b) => b.speed_score - a.speed_score);
    const first_n = best_server.slice(0, 20)

    for (let i = first_n.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [first_n[i], first_n[j]] = [first_n[j], first_n[i]];
    }

    var pick = null;

    while (pick === null && first_n.length > 0) {
        console.log(first_n.length)
        const server = first_n.shift();
        const test_proxy_ret = await test_proxy(server.url);
        if (test_proxy_ret) {
            pick = server;
        }
    }

    if (pick) {
        const pac = write_proxy_pac(pick.url);
        //res.setHeader('Content-Type', 'application/x-ns-proxy-autoconfig');
        //res.setHeader("Content-Disposition", "attachment; filename=proxy.pac");
        res.status(200).send(pac);
    }
    else {
        res.status(404).send('No proxy found');
    }
}