import * as XLSX from 'xlsx';

// Reads maturity levels from the Excel file and returns them as arrays (unique, no duplicates)
export async function getMaturityLevels() {
  // Fetch from backend API instead of Excel file
  const res = await fetch('/api/maturitylevels');
  if (!res.ok) return { business: [], technology: [], mapping: [] };
  return await res.json();
}

// Lookup maturity level based on business and technology maturity (case-insensitive, trimmed)
export function lookupMaturityLevel(mapping, business, technology) {
  if (!business || !technology) return '';
  const b = business.trim().toLowerCase();
  const t = technology.trim().toLowerCase();
  const found = mapping.find(row =>
    row.business && row.technology &&
    row.business.toString().trim().toLowerCase() === b &&
    row.technology.toString().trim().toLowerCase() === t
  );
  // Always return as string for display
  return found && found.maturity !== undefined && found.maturity !== null ? String(found.maturity) : '';
}
