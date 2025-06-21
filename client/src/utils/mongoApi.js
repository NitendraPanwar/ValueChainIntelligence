// mongoApi.js
// Utility functions for MongoDB push/read operations

// Push sheet data to MongoDB
export async function pushSheetToMongo(sheetName, data) {
  // POST to backend endpoint (to be implemented on server)
  const res = await fetch('/api/mongo/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sheetName, data })
  });
  if (!res.ok) throw new Error('Failed to push data to MongoDB');
  return res.json();
}

// Read sheet data from MongoDB
export async function readSheetFromMongo(sheetName) {
  // GET from backend endpoint (to be implemented on server)
  const res = await fetch(`/api/mongo/read?sheetName=${encodeURIComponent(sheetName)}`);
  if (!res.ok) throw new Error('Failed to read data from MongoDB');
  return res.json();
}

// Get unique industries from Homepage sheet in MongoDB
export async function getHomepageIndustriesFromMongo() {
  const res = await readSheetFromMongo('Homepage');
  if (!res.success || !Array.isArray(res.data)) return [];
  // Try to find the industry column (case-insensitive)
  const industryCol = res.data.length > 0 ? Object.keys(res.data[0]).find(
    k => k && k.toString().trim().toLowerCase() === 'industry'
  ) : null;
  if (!industryCol) return [];
  const types = [];
  for (const row of res.data) {
    const val = row[industryCol];
    if (val && !types.includes(val)) types.push(val);
  }
  return types;
}

// Get unique Business Complexity values from Homepage sheet in MongoDB
export async function getHomepageBusinessComplexityFromMongo() {
  const res = await readSheetFromMongo('Homepage');
  if (!res.success || !Array.isArray(res.data)) return [];
  // Try to find the business complexity column (case-insensitive)
  const complexityCol = res.data.length > 0 ? Object.keys(res.data[0]).find(
    k => k && k.toString().trim().toLowerCase() === 'business complexity'
  ) : null;
  if (!complexityCol) return [];
  const complexities = [];
  for (const row of res.data) {
    const val = row[complexityCol];
    if (val && !complexities.includes(val)) complexities.push(val);
  }
  return complexities;
}

// Get all value chain master data from MongoDB (no filter)
export async function getValueChainMasterFromMongo() {
  const res = await readSheetFromMongo('Value Chain Master');
  if (!res.success || !Array.isArray(res.data)) return [];
  // Use actual MongoDB column names
  const valueChainCol = 'Value Chain Stage';
  const descCol = 'Description';
  return res.data.map(row => ({
    valueChain: row[valueChainCol] || '',
    description: row[descCol] || ''
  }));
}

// Fetch all value chain entries created by users (from Submissions collection in MongoDB)
export async function getAllValueChainEntriesFromMongo() {
  // This assumes the backend saves user-created value chain entries in the 'Submissions' collection
  const res = await fetch('/api/mongo/read?sheetName=Submissions');
  if (!res.ok) throw new Error('Failed to read value chain entries from MongoDB');
  const json = await res.json();
  if (!json.success || !Array.isArray(json.data)) return [];
  // Only return entries with label 'Value chain' (to match HomePage logic)
  return json.data.filter(entry => entry.label === 'Value chain');
}
