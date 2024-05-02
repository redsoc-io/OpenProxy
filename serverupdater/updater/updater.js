const updateAll = require("./functions/updateAll");
const updateWorking = require("./functions/updateWorking");
const updateRecentlyActive = require("./functions/updateRecentlyActive");
const findNew = require("./functions/findNew");
const writeWorking = require("./functions/writeWorking");
const writeData = require("./functions/writeData");
const loadData = require("./functions/loadData");
const updateRecentlyWentOffline = require("./functions/updateRecentlyWentOffline");

async function updater(once = false) {
  const functions = [
    loadData,
    findNew,
    updateWorking,
    writeWorking,
    updateAll,
    updateRecentlyActive,
    updateRecentlyWentOffline,
    writeWorking,
    writeData,
  ];

  const results = [];

  var totalTime = new Date();

  var param = {};

  for (let i = 0; i < functions.length; i++) {
    const fn = functions[i];
    process.stdout.write(`Running ${fn.name}...`);
    const res = await fn(param);
    const { result } = res;
    param = res.data;
    results[i] = {
      function: fn.name,
      result,
    };
    process.stdout.write("Done\n");
  }

  if (!once) updater();

  process.stdout.write("\x1B[2J\x1B[0f");
  totalTime = new Date() - totalTime;
  console.log(results, `Total Time: ${totalTime / 1000} seconds`);
  return results;
}

module.exports = updater;
