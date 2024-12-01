const find_new = require("./find_new");
const get_untested = require("./get_untested");
const get_working = require("./get_working");
const get_recently_active = require("./get_recently_active");
const revalidate = require("./revalidate_servers");
const update = require("./update");
const get_tested = require("./get_tested");

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
    console.info(`Scheduled ${servers.length} untested servers.`);
    this.update_buffer = [...this.update_buffer, ...servers];
  }

  async get_recently_active() {
    const servers = await get_recently_active();
    console.info(`Scheduled ${servers.length} recently active servers.`);
    this.update_buffer = [...this.update_buffer, ...servers];
  }

  async get_working() {
    const servers = await get_working();
    console.info(`Scheduled ${servers.length} working servers.`);
    this.update_buffer = [...this.update_buffer, ...servers];
  }

  async revalidate() {
    this.update_buffer = await revalidate(this.update_buffer);
  }

  async get_tested() {
    const servers = await get_tested();
    console.info(`Scheduled ${servers.length} servers for retesting.`);
    this.update_buffer = [...this.update_buffer, ...servers];
  }

  async remove_duplicates() {
    const uniqueArray = this.update_buffer.filter(
      (item, index, self) =>
        index === self.findIndex((obj) => obj.id === item.id)
    );
    console.log(
      `Removed ${this.update_buffer.length - uniqueArray.length} Duplicates.`
    );
    this.update_buffer = uniqueArray;
  }

  async update() {
    await update(this.update_buffer);
    this.update_buffer = [];
    console.log("\n**********************\n");
  }

  async processes() {
    this.update_buffer = [];
    await this.find_new();
    await this.get_untested();
    await this.get_tested();
    await this.get_recently_active();
    await this.remove_duplicates();
    await this.get_working();
    await this.revalidate();
    await this.update();
  }

  async run() {
    try {
      await this.processes();
    } catch (e) {
      console.error("Process had to exit");
    }
    this.run();
  }
}

const updater = new UpdateSync();
updater.run();
