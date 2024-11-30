const find_new = require("./find_new");
const get_untested = require("./get_untested");
const get_working = require("./get_working");
const get_recently_active = require("./get_recently_active");
const revalidate = require("./revalidate_servers");
const update = require("./update");

class UpdateSync {
  constructor() {
    this.update_buffer = [];
  }

  async find_new() {
    const n = await find_new();
    console.log(`Added ${n} new servers.`);
  }

  async get_untested() {
    const servers = await get_untested();
    this.update_buffer = [...this.update_buffer, ...servers];
  }

  async get_recently_active() {
    const servers = await get_recently_active();
    this.update_buffer = [...this.update_buffer, ...servers];
  }

  async get_working() {
    const servers = await get_working();
    this.update_buffer = [...this.update_buffer, ...servers];
  }

  async revalidate() {
    this.update_buffer = await revalidate(this.update_buffer);
  }

  async update() {
    await update(this.update_buffer);
    this.update_buffer = [];
  }

  async run() {
    await this.find_new();
    await this.get_untested();
    await this.get_recently_active();
    await this.get_working();
    await this.revalidate();
    await this.update();
    this.run();
  }
}

const updater = new UpdateSync();
updater.run();
