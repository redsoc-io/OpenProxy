import {
  findNew,
  getUntested,
  getOldest,
  revalidate,
  updateList,
} from "../proxyService.js";

class UpdateSync {
  constructor() {
    this.updateBuffer = [];
  }

  async findNew() {
    const n = await findNew();
    console.log(`✅ Added ${n} new servers`);
  }

  async gather(stageFn, msg) {
    const items = await stageFn();
    console.log(`📋 Scheduled ${items.length} for ${msg}`);
    this.updateBuffer.push(...items);
  }

  async removeDuplicates() {
    const unique = [];
    const seen = new Set();
    for (const s of this.updateBuffer) {
      if (!seen.has(s.id)) {
        seen.add(s.id);
        unique.push(s);
      }
    }
    console.log(`🔄 Removed ${this.updateBuffer.length - unique.length} duplicates`);
    this.updateBuffer = unique;
  }

  async process() {
    const startTime = Date.now();
    console.log("\n🚀 === Starting update cycle ===");
    this.updateBuffer = [];
    
    const untested = await getUntested();
    if (untested.length > 0) {
      console.log(`🎯 Priority: ${untested.length} untested proxies`);
      this.updateBuffer = untested;
    } else {
      const oldest = await getOldest();
      if (oldest.length > 0) {
        console.log(`🕒 Testing ${oldest.length} oldest proxies`);
        this.updateBuffer = oldest;
      } else {
        await this.findNew();
      }
    }
    
    if (this.updateBuffer.length === 0) {
      console.log("ℹ️  No proxies to test");
      console.log("=== Update cycle complete ===\n");
      return;
    }
    
    console.log(`🧪 Testing ${this.updateBuffer.length} proxies...`);
    this.updateBuffer = await revalidate(this.updateBuffer);
    const working = this.updateBuffer.filter(s => s.working).length;
    const failed = this.updateBuffer.length - working;
    const updated = await updateList(this.updateBuffer);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`💾 Persisted ${updated} records (✅ ${working} working, ❌ ${failed} failed)`);
    console.log(`⏱️  Completed in ${elapsed}s`);
    console.log("=== Update cycle complete ===\n");
  }

  async run() {
    console.log("🌟 Worker started - running continuous cycles\n");
    while (true) {
      try {
        await this.process();
        if (global.gc) global.gc();
      } catch (e) {
        console.error("❌ Error during update cycle:", e);
      }
      console.log("⏳ Starting next cycle immediately...\n");
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

const upd = new UpdateSync();
upd.run();
