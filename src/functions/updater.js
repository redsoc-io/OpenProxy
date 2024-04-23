const updateAll = require("./updateAll");
const updateWorking = require("./updateWorking");
const find_new = require("./find_new");

async function updater(once = false) {
  const functions = [find_new, updateAll, updateWorking];

  var results = functions.map(async (func) => {
    try {
      return await func();
    } catch (e) {
      console.log(e);
    }
  });

  results = await Promise.all(results);

  if (!once) updater();

  console.log(results);
  return results;
}

module.exports = updater;
