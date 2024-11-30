const { MongoClient } = require("mongodb");

const mongoClient = new MongoClient(process.env.DATABASE_URL);

module.exports = mongoClient;
