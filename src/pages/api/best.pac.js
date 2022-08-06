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
    const first_n = best_server.slice(0, 10);
    const pick_random = first_n[Math.floor(Math.random() * first_n.length)];
    if (pick_random) {
        const pac = write_proxy_pac(pick_random.url);
        res.setHeader('Content-Type', 'application/x-ns-proxy-autoconfig');
        //res.setHeader("Content-Disposition", "attachment; filename=proxy.pac");
        res.status(200).send(pac);
    }
    else {
        res.status(404).send('No proxy found');
    }
}