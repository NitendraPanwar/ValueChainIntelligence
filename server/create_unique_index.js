// create_unique_index.js
// Run this script once to create a unique index on { name, businessType } for ValueChainEntries

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { getDb } = require('./mongo');

async function createUniqueIndex() {
  const db = await getDb();
  await db.collection('ValueChainEntries').createIndex(
    { name: 1, businessType: 1 },
    { unique: true, name: 'unique_name_businessType' }
  );
  console.log('Unique index on { name, businessType } created for ValueChainEntries.');
  process.exit(0);
}

createUniqueIndex().catch(err => {
  console.error('Error creating unique index:', err);
  process.exit(1);
});
