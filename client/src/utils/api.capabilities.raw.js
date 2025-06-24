// Delete all capabilities from MongoDB
export async function deleteAllCapabilities() {
  const res = await fetch('/api/capabilities', {
    method: 'DELETE',
  });
  return res.json();
}
