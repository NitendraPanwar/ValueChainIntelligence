// Utility function to save a submission to the backend
export async function saveSubmission(data) {
  return fetch('http://localhost:4000/api/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

// Utility function to get all submissions
export async function getSubmissions() {
  const res = await fetch('http://localhost:4000/api/submissions');
  if (!res.ok) return [];
  return res.json();
}

// Save capability maturity assessment for a capability within a value chain
export async function saveCapabilityAssessment(data) {
  return fetch('http://localhost:4000/api/saveCapabilityAssessment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

// Utility function to save initiative details to the backend
export async function saveInitiative(initiative) {
  const res = await fetch('http://localhost:4000/api/save-initiative', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(initiative)
  });
  return res.json();
}
