// Utility function to save a submission to the backend
export async function saveSubmission({ name, businessType, label }) {
  return fetch('http://localhost:4000/api/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, businessType, label })
  });
}

// Utility function to get all submissions
export async function getSubmissions() {
  const res = await fetch('http://localhost:4000/api/submissions');
  if (!res.ok) return [];
  return res.json();
}
