// sheetRelationsApi.js
// Utility functions for saving and loading sheet relations and node positions to/from MongoDB

export async function saveSheetRelations(sheetName, relations, nodePositions) {
  const res = await fetch('/api/mongo/sheet-relations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sheetName, relations, nodePositions })
  });
  if (!res.ok) throw new Error('Failed to save sheet relations');
  return res.json();
}

export async function loadSheetRelations(sheetName) {
  const res = await fetch(`/api/mongo/sheet-relations?sheetName=${encodeURIComponent(sheetName)}`);
  if (!res.ok) throw new Error('Failed to load sheet relations');
  return res.json();
}
