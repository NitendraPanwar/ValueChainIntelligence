// Fetch all value chains linked to a ValueChainEntry by entryId
export async function getValueChainsByEntryId(entryId) {
  const res = await fetch(`/api/valuechains/${entryId}`);
  if (!res.ok) throw new Error('Failed to fetch value chains');
  return res.json();
}

// Fetch all value chains in the system
export async function getAllValueChains() {
  const res = await fetch('/api/valuechains');
  if (!res.ok) throw new Error('Failed to fetch all value chains');
  return res.json();
}

// Fetch all capabilities for a value chain by its ID
export async function getCapabilitiesByValueChainId(valueChainId) {
  const res = await fetch(`/api/capabilities/${encodeURIComponent(valueChainId)}`);
  if (!res.ok) throw new Error('Failed to fetch capabilities');
  return await res.json();
}
