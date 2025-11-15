import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { getServers } from "./sqlite.js";
import { fork } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = new Hono();

// CORS middleware for API routes only
app.use("/api/*", async (c, next) => {
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Headers", "*");
  c.header("Access-Control-Allow-Methods", "*");
  if (c.req.method === "OPTIONS") {
    return c.text("", 204);
  }
  return await next();
});

app.get("/api/servers", (c) => {
  try {
    const list = getServers({ working: true });
    console.log(`📊 Serving ${list.length} working proxies`);
    return c.json(list);
  } catch (e) {
    console.error("❌ Error fetching servers:", e);
    return c.json({ error: e.message }, 500);
  }
});

app.get("/api/proxy.pac", async (c) => {
  const list = getServers({ working: true });
  const script = `function FindProxyForURL(url, host) { return '${list
    .map((s) => "PROXY " + s.url)
    .join(";")}'; }`;
  return c.text(script, {
    headers: { "Content-Type": "application/x-ns-proxy-autoconfig" },
  });
});

// Serve static files from public directory
const publicPath = join(__dirname, "../public");
if (existsSync(publicPath)) {
  app.use("/assets/*", serveStatic({ root: "./public" }));
  app.use("/favicon.ico", serveStatic({ path: "./public/favicon.ico" }));
  app.get("*", serveStatic({ path: "./public/index.html" }));
}

app.notFound((c) => c.json({ error: "Not Found" }, 404));

export default app;

// Start server if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = process.env.PORT || 3000;
  
  // Start worker process
  const workerPath = join(__dirname, "worker", "index.js");
  const worker = fork(workerPath);
  console.log("🔧 Worker process started");

  worker.on("error", (err) => {
    console.error("❌ Worker error:", err);
  });

  worker.on("exit", (code) => {
    console.log(`⚠️  Worker exited with code ${code}`);
  });

  serve({
    fetch: app.fetch,
    port,
  });
  
  console.log(`🚀 Server running at http://localhost:${port}`);
}
