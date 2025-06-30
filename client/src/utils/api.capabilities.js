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

const backendUrl = 'http://localhost:4000'; // Backend server URL

// Fetch a capability by name and valueChainEntryName
export async function getCapabilityByNameAndEntry(capabilityName, valueChainEntryName) {
  console.log('[api.capabilities.js] getCapabilityByNameAndEntry called with:', { capabilityName, valueChainEntryName });
  const url = `${backendUrl}/api/capabilities/debug/by-name-or-entry?capabilityName=${encodeURIComponent(capabilityName)}&valueChainEntryName=${encodeURIComponent(valueChainEntryName)}`;
  console.log('[api.capabilities.js] Fetching URL:', url);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error('[api.capabilities.js] Fetch failed with status:', response.status, 'statusText:', response.statusText);
      return [];
    }
    const data = await response.json();
    console.log('[api.capabilities.js] Fetched data:', data);
    return data.docs || []; // Return the `docs` array from the debug endpoint response
  } catch (error) {
    console.error('[api.capabilities.js] Fetch error:', error);
    return [];
  }
}
