const updateAll = require("./updateAll");
const updateWorking = require("./updateWorking");
const updateRecentlyActive = require("./updateRecentlyActive");
const find_new = require("./find_new");

async function updater(once = false) {
  const functions = [find_new, updateAll, updateWorking, updateRecentlyActive];

  var results = functions.map(async (func) => {
    try {
      const result = await func();
      console.log(`Done for ${func.name}`);
      return {
        name: func.name,
        ...result,
      };
    } catch (e) {
      console.log(e);
    }
  });

  results = await Promise.all(results);

  if (!once) updater();

  process.stdout.write("\x1B[2J\x1B[0f");
  console.log(results);
  return results;
}

module.exports = updater;
