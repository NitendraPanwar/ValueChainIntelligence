// Fetch a single value chain entry by its ID
export async function getValueChainEntryById(id) {
  const res = await fetch(`/api/valuechainentries/${id}`);
  if (!res.ok) throw new Error('Failed to fetch value chain entry');
  return res.json();
}

// Fetch all value chain entries
export async function getAllValueChainEntries() {
  const res = await fetch('/api/valuechainentries');
  if (!res.ok) throw new Error('Failed to fetch value chain entries');
  return res.json();
}
