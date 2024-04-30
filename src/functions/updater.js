const updateAll = require("./updateAll");
const updateWorking = require("./updateWorking");
const updateRecentlyActive = require("./updateRecentlyActive");
const find_new = require("./find_new");
const writeWorking = require("./writeWorking");

async function updater(once = false) {
  const functions = [
    find_new,
    updateAll,
    updateWorking,
    updateRecentlyActive,
    writeWorking,
  ];

  const results = [];

  var totalTime = new Date();

  for (let i = 0; i < functions.length; i++) {
    const fn = functions[i];
    process.stdout.write(`Running ${fn.name}...`);
    const res = await fn();
    results[i] = {
      function: fn.name,
      ...res,
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
