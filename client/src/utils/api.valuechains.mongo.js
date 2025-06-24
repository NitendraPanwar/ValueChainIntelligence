// Fetch a single value chain by its ID
export async function getValueChainById(id) {
  const res = await fetch(`/api/valuechains/${id}`);
  if (!res.ok) throw new Error('Failed to fetch value chain');
  return res.json();
}
