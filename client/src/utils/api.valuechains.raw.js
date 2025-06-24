// Fetch all value chains in the system
export async function getAllValueChainsRaw() {
  const res = await fetch('/api/valuechains');
  if (!res.ok) throw new Error('Failed to fetch all value chains');
  return res.json();
}

// Delete all value chains in the system
export async function deleteAllValueChains() {
  const res = await fetch('/api/valuechains', { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete all value chains');
  return res.json();
}
