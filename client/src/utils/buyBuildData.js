import * as XLSX from 'xlsx';

export async function getBuyBuildData(capabilityName, industry) {
  // Fetch from backend API instead of Excel file
  const res = await fetch(`/api/buybuild?capabilityName=${encodeURIComponent(capabilityName)}&industry=${encodeURIComponent(industry)}`);
  if (!res.ok) return { description: '', suggestions: '', buy: '' };
  const result = await res.json();
  return {
    description: result.description || '',
    suggestions: result.suggestions || '',
    buy: result.buy || ''
  };
}
