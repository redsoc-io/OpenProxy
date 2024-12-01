const downloadFileWithProxy = require("../lib/proxyDownload");

const revalidate_servers = async (servers) => {
  const rl = servers.map(async (s) => {
    s.lastChecked = new Date();
    s.tested = true;
    try {
      const { response_time, geo } = await downloadFileWithProxy(s.url);
      s.geo = geo;
      s.responseTime = response_time;
      s.lastOnline = s.lastChecked;
      s.streak = (s.streak || 0) + 1;
      s.working = true;
    } catch (e) {
      s.responseTime = -1;
      s.streak = (s.streak || 1) - 1;
      s.working = false;
    }
    return s;
  });
  const wt = await Promise.all(rl);
  const n_working = wt.filter(({ working }) => !working).length;
  const y_working = wt.filter(({ working }) => !!working).length;
  console.info(`✅ ${y_working} | ❌ ${n_working}`);
  return wt;
};

module.exports = revalidate_servers;
