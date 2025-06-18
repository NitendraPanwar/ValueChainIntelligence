import * as XLSX from 'xlsx';

// Reads maturity levels from the Excel file and returns them as arrays (unique, no duplicates)
export async function getMaturityLevels() {
  // Fetch the Excel file
  const res = await fetch('/VC_Capability_Master.xlsx');
  const data = await res.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const sheet = workbook.Sheets['Maturity Mapping'];
  if (!sheet) return { business: [], technology: [], mapping: [] };
  const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const headerRow = json[0] || [];
  const businessCol = headerRow.findIndex(h => h && h.toString().trim().toLowerCase() === 'business maturity levels');
  const techCol = headerRow.findIndex(h => h && h.toString().trim().toLowerCase() === 'technology maturity levels');
  const maturityCol = headerRow.findIndex(h => h && h.toString().trim().toLowerCase() === 'maturity level');
  const businessSet = new Set();
  const technologySet = new Set();
  const mapping = [];
  for (let i = 1; i < json.length; i++) {
    if (businessCol !== -1 && json[i][businessCol]) businessSet.add(json[i][businessCol]);
    if (techCol !== -1 && json[i][techCol]) technologySet.add(json[i][techCol]);
    if (
      businessCol !== -1 && techCol !== -1 && maturityCol !== -1 &&
      json[i][businessCol] && json[i][techCol] && json[i][maturityCol]
    ) {
      mapping.push({
        business: json[i][businessCol],
        technology: json[i][techCol],
        maturity: json[i][maturityCol]
      });
    }
  }
  return { business: Array.from(businessSet), technology: Array.from(technologySet), mapping };
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
