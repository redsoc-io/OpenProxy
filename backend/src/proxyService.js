import { upsertServer, getServers } from "./sqlite.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import axios from "axios";
import { SocksProxyAgent } from "socks-proxy-agent";
import { HttpsProxyAgent } from "https-proxy-agent";
import process from "process";

process.on('uncaughtException', () => {});
process.on('unhandledRejection', () => {});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const lists = JSON.parse(
  readFileSync(join(__dirname, "data", "lists.json"), "utf-8")
);

export async function findNew() {
  let count = 0;
  console.log(`🔍 Fetching from ${lists.length} sources...`);
  const existing = new Set(getServers().map(s => s.id));
  for (const list of lists) {
    try {
      const text = await fetch(list.url).then((r) => r.text());
      const lines = text.split("\n").filter((l) => l.trim());
      let added = 0;
      for (const line of lines) {
        const [host, port] = line.trim().split(":");
        if (!host || !port) continue;
        const id = `${list.type}://${host}:${port}`;
        if (!existing.has(id)) {
          upsertServer({
            id,
            url: id,
            tested: false,
            working: false,
            responseTime: -1,
            streak: 0,
            addedOn: new Date().toISOString(),
            lastOnline: null,
            lastChecked: null,
            geo: null,
          });
          existing.add(id);
          count++;
          added++;
        }
      }
      console.log(`  • ${list.type.padEnd(8)} - ${lines.length} found, ${added} new`);
    } catch (e) {
      console.error(`  • ❌ ${list.type.padEnd(8)} - ${e.message}`);
    }
  }
  return count;
}

export async function getUntested() {
  return getServers()
    .filter((s) => !s.tested)
    .sort((a, b) => new Date(a.addedOn) - new Date(b.addedOn))
    .slice(0, 200);
}

export async function getWorking() {
  return getServers()
    .filter((s) => s.working)
    .sort((a, b) => {
      const aTime = a.lastChecked ? new Date(a.lastChecked).getTime() : 0;
      const bTime = b.lastChecked ? new Date(b.lastChecked).getTime() : 0;
      return aTime - bTime;
    })
    .slice(0, 200);
}

export async function getOldest() {
  return getServers()
    .filter((s) => s.tested)
    .sort((a, b) => {
      const aTime = a.lastChecked ? new Date(a.lastChecked).getTime() : 0;
      const bTime = b.lastChecked ? new Date(b.lastChecked).getTime() : 0;
      return aTime - bTime;
    })
    .slice(0, 200);
}

async function testProxy(server) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve({
        ...server,
        tested: true,
        working: false,
        streak: 0,
        lastChecked: new Date().toISOString(),
      });
    }, 8000);

    (async () => {
      try {
        const start = Date.now();
        const agent = server.url.startsWith("socks")
          ? new SocksProxyAgent(server.url)
          : new HttpsProxyAgent(server.url);

        const geoRes = await axios.get('http://ip-api.com/json/', {
          httpAgent: agent,
          httpsAgent: agent,
          timeout: 7000,
        });

        const responseTime = Date.now() - start;
        const geo = geoRes.data.countryCode;

        clearTimeout(timer);
        resolve({
          ...server,
          tested: true,
          working: true,
          responseTime,
          streak: server.streak + 1,
          lastOnline: new Date().toISOString(),
          lastChecked: new Date().toISOString(),
          geo,
        });
      } catch (e) {
        clearTimeout(timer);
        resolve({
          ...server,
          tested: true,
          working: false,
          streak: 0,
          lastChecked: new Date().toISOString(),
        });
      }
    })().catch(() => {
      clearTimeout(timer);
      resolve({
        ...server,
        tested: true,
        working: false,
        streak: 0,
        lastChecked: new Date().toISOString(),
      });
    });
  });
}

export async function revalidate(list) {
  const batchSize = 50;
  const results = [];
  
  for (let i = 0; i < list.length; i += batchSize) {
    const batch = list.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch.map(testProxy));
    const resolved = batchResults.map(r => r.status === 'fulfilled' ? r.value : null).filter(Boolean);
    results.push(...resolved);
    
    const working = resolved.filter(s => s.working).length;
    console.log(`  ⚡ Batch ${Math.floor(i/batchSize) + 1}: ${working}/${batch.length} working`);
  }
  
  return results;
}

export async function updateList(list) {
  for (const server of list) {
    upsertServer(server);
  }
  return list.length;
}
