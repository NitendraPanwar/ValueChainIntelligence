// Utility to fetch a capability by its _id from MongoDB using fetch

/**
 * Fetch a capability document by its MongoDB _id.
 * @param {string} capabilityId - The _id of the capability to fetch.
 * @returns {Promise<Object>} The capability document, or null if not found.
 */
export async function getCapabilityById(capabilityId) {
  if (!capabilityId) return null;
  try {
    const response = await fetch(`/api/capabilities/${capabilityId}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (err) {
    console.error('Error fetching capability by id:', capabilityId, err);
    return null;
  }
}

// Use relative path for API base URL to support both local and Codespaces
const backendUrl = '';

// Fetch a capability by name and valueChainEntryName
export async function getCapabilityByNameAndEntry(capabilityName, valueChainEntryName) {
  const url = `${backendUrl}/api/capabilities/debug/by-name-or-entry?capabilityName=${encodeURIComponent(capabilityName)}&valueChainEntryName=${encodeURIComponent(valueChainEntryName)}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return data.docs || [];
  } catch (error) {
    return [];
  }
}
