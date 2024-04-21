import { MongoClient } from "mongodb";
const url = process.env.MONGO_URL;
const client = new MongoClient(url);

let collection = null;

export default async function db() {
  if (!collection) {
    await client.connect();
    const db = client.db("servers");
    collection = db.collection("servers");
  }
  return collection;
}
