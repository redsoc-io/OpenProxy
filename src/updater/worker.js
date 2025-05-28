const { parentPort } = require('worker_threads');
const downloadFileWithProxy = require("../lib/proxyDownload");

// Worker will receive server data and process it
parentPort.on('message', async (server) => {
  try {
    server.lastChecked = new Date();
    server.tested = true;
    
    // Wrap download in a timeout promise
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 8000)
    );
    
    const { response_time, geo } = await downloadFileWithProxy(server.url);
    server.geo = geo;
    server.responseTime = response_time;
    server.lastOnline = server.lastChecked;
    server.streak = (server.streak || 0) + 1;
    server.working = true;
  } catch (e) {
    server.responseTime = -1;
    server.streak = (server.streak || 1) - 1;
    server.working = false;
  }
  
  // Send the processed server data back to the main thread
  parentPort.postMessage(server);
});
