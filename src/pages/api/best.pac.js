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

export default async function handler(req, res) {
    const request = await fetch(`https://api.oproxy.ml/servers`);
    var data = await request.json()
    const best_server = data.sort((a, b) => b.speed_score - a.speed_score)[0];
    const pac = write_proxy_pac(best_server.url);
    res.setHeader('Content-Type', 'application/x-ns-proxy-autoconfig');
    res.setHeader("Content-Disposition", "attachment; filename=proxy.pac");
    res.status(200).send(pac);
}