// load_homepage_to_mongo.js
// Script to load 'Homepage' sheet from VC_Capability_Master.xlsx into MongoDB BusinessComplexity collection

const path = require('path');
const xlsx = require('xlsx');
const { MongoClient } = require('mongodb');

const EXCEL_PATH = path.join(__dirname, '../public/VC_Capability_Master.xlsx');
const SHEET_NAME = 'Homepage';
const MONGO_URL = 'mongodb://localhost:27017'; // Change if needed
const DB_NAME = 'ValueChainDB';
const COLLECTION_NAME = 'BusinessComplexity';

async function main() {
  // Read Excel file
  const workbook = xlsx.readFile(EXCEL_PATH);
  const worksheet = workbook.Sheets[SHEET_NAME];
  if (!worksheet) {
    console.error(`Sheet '${SHEET_NAME}' not found in ${EXCEL_PATH}`);
    process.exit(1);
  }
  const data = xlsx.utils.sheet_to_json(worksheet);

  // Connect to MongoDB
  const client = new MongoClient(MONGO_URL);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Optional: Clear existing data
    await collection.deleteMany({});

    // Insert new data
    if (data.length > 0) {
      await collection.insertMany(data);
      console.log(`Inserted ${data.length} records into '${COLLECTION_NAME}' collection.`);
    } else {
      console.log('No data found in the sheet.');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

main();
