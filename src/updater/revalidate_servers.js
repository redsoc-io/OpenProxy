const { Worker } = require('worker_threads');
const path = require('path');
const os = require('os');

// Create a worker pool
class WorkerPool {
  constructor(size) {
    this.workers = [];
    this.queue = [];
    this.activeWorkers = 0;
    
    for (let i = 0; i < size; i++) {
      const worker = new Worker(path.join(__dirname, 'worker.js'));
      this.workers.push(worker);
    }
  }

  async processServer(server) {
    return new Promise((resolve) => {
      const worker = this.workers.find(w => !w.processing);
      
      if (worker) {
        worker.processing = true;
        this.activeWorkers++;
        
        worker.once('message', (result) => {
          worker.processing = false;
          this.activeWorkers--;
          this.processNextInQueue();
          resolve(result);
        });
        
        worker.postMessage(server);
      } else {
        this.queue.push({ server, resolve });
      }
    });
  }

  processNextInQueue() {
    if (this.queue.length > 0 && this.activeWorkers < this.workers.length) {
      const next = this.queue.shift();
      this.processServer(next.server).then(next.resolve);
    }
  }

  async cleanup() {
    await Promise.all(this.workers.map(worker => worker.terminate()));
  }
}

const revalidate_servers = async (servers) => {
  const pool = new WorkerPool(os.cpus().length);
  
  // Process all servers using the worker pool
  const wt = await Promise.all(servers.map(server => pool.processServer(server)));
  
  // Cleanup worker pool
  await pool.cleanup();
  
  const n_working = wt.filter(({ working }) => !working).length;
  const y_working = wt.filter(({ working }) => !!working).length;
  console.info(`✅ ${y_working} | ❌ ${n_working}`);
  return wt;
};

module.exports = revalidate_servers;
