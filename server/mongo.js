// mongo.js - MongoDB connection utility
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URL;
const dbName = process.env.MONGO_DB;

let client;

async function getDb() {
  if (!client) {
    client = new MongoClient(uri); // Removed deprecated options
    await client.connect();
  }
  return client.db(dbName);
}

module.exports = { getDb };
