// Fetch all Strategic Initiative Entries from the backend
export async function fetchAllStrategicInitiatives() {
  const res = await fetch('/api/initiative/all');
  if (!res.ok) return [];
  return res.json();
}
// Utility function to save a submission to the backend
export async function saveSubmission(data) {
  return fetch('/api/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

// Utility function to get all submissions
export async function getSubmissions() {
  const res = await fetch('/api/submissions');
  if (!res.ok) return [];
  return res.json();
}

// Save capability maturity assessment for a capability within a value chain
export async function saveCapabilityAssessment(data) {
  return fetch('/api/saveCapabilityAssessment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

// Utility function to save initiative details to the backend
export async function saveInitiative(initiative) {
  const res = await fetch('/api/save-initiative', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(initiative)
  });
  return res.json();
}

// Save a value chain entry to the backend (new flow)
export async function saveValueChainEntry(data) {
  return fetch('/api/valuechainentry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

// Fetch all value chain entries from the new ValueChainEntries collection
export async function getAllValueChainEntries() {
  const res = await fetch('/api/valuechainentries');
  if (!res.ok) return [];
  return res.json();
}

// Delete a value chain entry from the new ValueChainEntries collection
export async function deleteValueChainEntry(id) {
  const res = await fetch('/api/delete-valuechainentry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });
  return res.json();
}

// Save multiple value chains (with star ratings) linked to a parent ValueChainEntry by _id
export async function saveValueChains({ entryId, entryName, valueChains }) {
  const res = await fetch('/api/valuechains', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ valueChainEntryId: entryId, valueChainEntryName: entryName, valueChains })
  });
  return res.json();
}

// Persist a capability (name only) for a value chain
export async function persistCapability({ valueChainId, valueChainName, entryId, entryName, name }) {
  return fetch('/api/capability', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      valueChainId,
      valueChainName,
      valueChainEntryId: entryId,
      valueChainEntryName: entryName,
      name
    })
  });
}

// Fetch all capabilities for a value chain
export async function getCapabilitiesByValueChainId(valueChainId) {
  const res = await fetch(`/api/capabilities/${valueChainId}`);
  if (!res.ok) throw new Error('Failed to fetch capabilities');
  return res.json();
}

// Fetch all capabilities from the Capabilities collection
export async function getAllCapabilities() {
  const res = await fetch('/api/capabilities');
  if (!res.ok) throw new Error('Failed to fetch all capabilities');
  return res.json();
}

// Update only maturity fields for a capability
export async function updateCapabilityMaturity(payload) {
  return fetch('/api/updateCapability', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

// Fetch all capabilities for a valueChainEntryId (entryId)
export async function getCapabilitiesByEntryId(entryId) {
  const res = await fetch(`/api/capabilities/byEntryId/${encodeURIComponent(entryId)}`);
  if (!res.ok) throw new Error('Failed to fetch capabilities by entryId');
  return res.json();
}

// Fetch initiative and its capabilities by name
export async function fetchInitiativeByName(initiativeName) {
  const res = await fetch(`/api/initiative/by-name?initiativeName=${encodeURIComponent(initiativeName)}`);
  if (!res.ok) throw new Error('Failed to fetch initiative');
  return await res.json();
}
