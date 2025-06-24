// create_unique_index_valuechains_and_capabilities.js
// Run this script once to create unique indexes for ValueChains and Capabilities

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { getDb } = require('./mongo');

async function createUniqueIndexes() {
  const db = await getDb();
  // Unique index for ValueChains: valueChainEntryId + name
  await db.collection('ValueChains').createIndex(
    { valueChainEntryId: 1, name: 1 },
    { unique: true, name: 'unique_valueChainEntryId_name' }
  );
  console.log('Unique index on { valueChainEntryId, name } created for ValueChains.');

  // Unique index for Capabilities: valueChainId + name
  await db.collection('Capabilities').createIndex(
    { valueChainId: 1, name: 1 },
    { unique: true, name: 'unique_valueChainId_name' }
  );
  console.log('Unique index on { valueChainId, name } created for Capabilities.');

  process.exit(0);
}

createUniqueIndexes().catch(err => {
  console.error('Error creating unique indexes:', err);
  process.exit(1);
});
