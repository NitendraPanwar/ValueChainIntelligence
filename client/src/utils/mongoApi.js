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
