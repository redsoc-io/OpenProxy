const { MongoClient } = require("mongodb");

//dotenv
require("dotenv").config();

const url = process.env.MONGO_URL;
const client = new MongoClient(url);

let collection = null;

async function db() {
  if (!collection) {
    await client.connect();
    const db = client.db("servers");
    collection = db.collection("servers");
  }
  return collection;
}

module.exports = db;
