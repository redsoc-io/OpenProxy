const { Worker } = require('worker_threads');
const path = require('path');
const os = require('os');

// Create a worker pool
class WorkerPool {
  constructor() {
    // Use either 2 workers or half of available CPUs, whichever is smaller
    this.size = Math.min(2, Math.floor(os.cpus().length / 2));
    this.workers = [];
    this.queue = [];
    this.activeWorkers = 0;
    this.batchSize = 10; // Process servers in batches
  }

  async processServer(server) {
    return new Promise((resolve) => {
      if (this.activeWorkers < this.size) {
        this.startWorker(server, resolve);
      } else {
        this.queue.push({ server, resolve });
      }
    });
  }

  startWorker(server, resolve) {
    const worker = new Worker(path.join(__dirname, 'worker.js'));
    this.activeWorkers++;

    const timeout = setTimeout(() => {
      worker.terminate();
      resolve({
        ...server,
        working: false,
        responseTime: -1,
        lastChecked: new Date(),
        tested: true,
        streak: 0
      });
    }, 10000); // 10 second timeout

    worker.on('message', (result) => {
      clearTimeout(timeout);
      worker.terminate();
      this.activeWorkers--;
      resolve(result);
      this.processNextInQueue();
    });

    worker.on('error', () => {
      clearTimeout(timeout);
      worker.terminate();
      this.activeWorkers--;
      resolve({
        ...server,
        working: false,
        responseTime: -1,
        lastChecked: new Date(),
        tested: true,
        streak: 0
      });
      this.processNextInQueue();
    });

    worker.postMessage(server);
  }

  processNextInQueue() {
    if (this.queue.length > 0 && this.activeWorkers < this.size) {
      const { server, resolve } = this.queue.shift();
      this.startWorker(server, resolve);
    }
  }

  async cleanup() {
    // Wait for all workers to complete
    while (this.activeWorkers > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

const revalidate_servers = async (servers) => {
  const pool = new WorkerPool();
  const results = [];
  
  // Process servers in batches
  for (let i = 0; i < servers.length; i += pool.batchSize) {
    const batch = servers.slice(i, i + pool.batchSize);
    const batchResults = await Promise.all(batch.map(server => pool.processServer(server)));
    results.push(...batchResults);
    
    // Give a small break between batches to prevent system overload
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Cleanup worker pool
  await pool.cleanup();
  
  const n_working = results.filter(({ working }) => !working).length;
  const y_working = results.filter(({ working }) => !!working).length;
  console.info(`✅ ${y_working} | ❌ ${n_working}`);
  return results;
};

module.exports = revalidate_servers;
