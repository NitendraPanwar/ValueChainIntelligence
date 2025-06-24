// mongoApi.js
// Utility functions for MongoDB push/read operations

// Push sheet data to MongoDB
export async function pushSheetToMongo(sheetName, data) {
  // POST to backend endpoint (to be implemented on server)
  const res = await fetch('/api/mongo/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sheetName, data })
  });
  if (!res.ok) throw new Error('Failed to push data to MongoDB');
  return res.json();
}

// Read sheet data from MongoDB
export async function readSheetFromMongo(sheetName) {
  // GET from backend endpoint (to be implemented on server)
  const res = await fetch(`/api/mongo/read?sheetName=${encodeURIComponent(sheetName)}`);
  if (!res.ok) throw new Error('Failed to read data from MongoDB');
  return res.json();
}

// Get unique industries from Homepage sheet in MongoDB
export async function getHomepageIndustriesFromMongo() {
  const res = await readSheetFromMongo('Homepage');
  if (!res.success || !Array.isArray(res.data)) return [];
  // Try to find the industry column (case-insensitive)
  const industryCol = res.data.length > 0 ? Object.keys(res.data[0]).find(
    k => k && k.toString().trim().toLowerCase() === 'industry'
  ) : null;
  if (!industryCol) return [];
  const types = [];
  for (const row of res.data) {
    const val = row[industryCol];
    if (val && !types.includes(val)) types.push(val);
  }
  return types;
}

// Get unique Business Complexity values from Homepage sheet in MongoDB
export async function getHomepageBusinessComplexityFromMongo() {
  const res = await readSheetFromMongo('Homepage');
  if (!res.success || !Array.isArray(res.data)) return [];
  // Try to find the business complexity column (case-insensitive)
  const complexityCol = res.data.length > 0 ? Object.keys(res.data[0]).find(
    k => k && k.toString().trim().toLowerCase() === 'business complexity'
  ) : null;
  if (!complexityCol) return [];
  const complexities = [];
  for (const row of res.data) {
    const val = row[complexityCol];
    if (val && !complexities.includes(val)) complexities.push(val);
  }
  return complexities;
}

// Get all value chain master data from MongoDB (no filter)
export async function getValueChainMasterFromMongo() {
  const res = await readSheetFromMongo('Value Chain Master');
  if (!res.success || !Array.isArray(res.data)) return [];
  // Use actual MongoDB column names
  const valueChainCol = 'Value Chain Stage';
  const descCol = 'Description';
  return res.data.map(row => ({
    valueChain: row[valueChainCol] || '',
    description: row[descCol] || ''
  }));
}

// Fetch all value chain entries created by users (from Submissions collection in MongoDB)
export async function getAllValueChainEntriesFromMongo() {
  // This assumes the backend saves user-created value chain entries in the 'Submissions' collection
  const res = await fetch('/api/mongo/read?sheetName=Submissions');
  if (!res.ok) throw new Error('Failed to read value chain entries from MongoDB');
  const json = await res.json();
  if (!json.success || !Array.isArray(json.data)) return [];
  // Only return entries with label 'Value chain' (to match HomePage logic)
  return json.data.filter(entry => entry.label === 'Value chain');
}

// Get business capabilities from Capability Master with filtering
export async function getBusinessCapabilitiesFromMongo(valueChainEntryName, businessType) {
  const res = await readSheetFromMongo('Capability Master');
  if (!res.success || !Array.isArray(res.data)) return [];
  const valueChainCol = 'Value Chain Stage';
  const industriesCol = 'Industries';
  const capNameCol = 'Capability Name';
  const descCol = 'Description';
  const shortDescCol = res.data.length > 0 ? Object.keys(res.data[0]).find(
    k => k && k.toString().trim().toLowerCase() === 'short description'
  ) : null;

  // Filter by valueChainEntryName and businessType (case-insensitive, trimmed)
  const filtered = res.data.filter(row => {
    const stage = (row[valueChainCol] || '').toString().trim().toLowerCase();
    const entryName = (valueChainEntryName || '').toString().trim().toLowerCase();
    if (stage !== entryName) return false;
    const industries = (row[industriesCol] || '').split(',').map(s => s.trim().toLowerCase());
    const type = (businessType || '').toString().trim().toLowerCase();
    return industries.includes(type);
  });
  return filtered.map(row => ({
    capabilityName: row[capNameCol] || '',
    description: row[descCol] || '',
    shortDescription: shortDescCol ? row[shortDescCol] || '' : '',
    valueChainStage: row[valueChainCol] || '',
    industries: row[industriesCol] || ''
  }));
}

// Fetch capability details from MongoDB Capability Details collection
export async function getCapabilityDetailsFromMongo(valueChainName, capabilityName) {
  const res = await readSheetFromMongo('Capability Details');
  if (!res.success || !Array.isArray(res.data)) return null;
  // Find the row matching both fields (case-insensitive, trimmed)
  const match = res.data.find(row => {
    const stage = (row['Value Chain Stage'] || '').toString().trim().toLowerCase();
    const cap = (row['Capability Name'] || '').toString().trim().toLowerCase();
    return stage === valueChainName.toString().trim().toLowerCase() && cap === capabilityName.toString().trim().toLowerCase();
  });
  return match || null;
}

// Fetch unique business and technology maturity levels from MongoDB Capability Maturity Model table
export async function getMaturityLevelsFromMongo() {
  const res = await readSheetFromMongo('Capability Maturity Model');
  if (!res.success || !Array.isArray(res.data)) return { business: [], technology: [], mapping: [] };
  // Find columns (case-insensitive)
  const firstRow = res.data[0] || {};
  const businessCol = Object.keys(firstRow).find(k => k && k.toString().trim().toLowerCase() === 'business maturity levels');
  const techCol = Object.keys(firstRow).find(k => k && k.toString().trim().toLowerCase() === 'technology maturity levels');
  const labelCol = Object.keys(firstRow).find(k => k && k.toString().trim().toLowerCase() === 'maturity level label');

  const businessSet = new Set();
  const technologySet = new Set();
  const mapping = [];
  for (const row of res.data) {
    if (businessCol && row[businessCol]) businessSet.add(row[businessCol]);
    if (techCol && row[techCol]) technologySet.add(row[techCol]);
    if (businessCol && techCol && labelCol && row[businessCol] && row[techCol] && row[labelCol]) {
      mapping.push({
        business: row[businessCol],
        technology: row[techCol],
        label: row[labelCol]
      });
    }
  }
  return { business: Array.from(businessSet), technology: Array.from(technologySet), mapping };
}

// Lookup maturity level label from mapping
export function lookupMaturityLevelLabel(mapping, business, technology) {
  if (!business || !technology) return '';
  const b = business.trim().toLowerCase();
  const t = technology.trim().toLowerCase();
  const found = mapping.find(row =>
    row.business && row.technology &&
    row.business.toString().trim().toLowerCase() === b &&
    row.technology.toString().trim().toLowerCase() === t
  );
  return found && found.label !== undefined && found.label !== null ? String(found.label) : '';
}

// Fetch description for a given business maturity level
export async function getBusinessMaturityDescriptionFromMongo(level) {
  if (!level) return '';
  const res = await readSheetFromMongo('Capability Maturity Model');
  if (!res.success || !Array.isArray(res.data)) return '';
  const businessCol = Object.keys(res.data[0] || {}).find(k => k && k.toString().trim().toLowerCase() === 'business maturity levels');
  const descCol = Object.keys(res.data[0] || {}).find(k => k && k.toString().trim().toLowerCase() === 'business maturity decription');
  if (!businessCol || !descCol) return '';
  const match = res.data.find(row =>
    (row[businessCol] || '').toString().trim().toLowerCase() === level.toString().trim().toLowerCase() &&
    row[descCol] && row[descCol].toString().trim() !== ''
  );
  return match && match[descCol] ? match[descCol] : '';
}

// Fetch description for a given technology maturity level
export async function getTechnologyMaturityDescriptionFromMongo(level) {
  if (!level) return '';
  const res = await readSheetFromMongo('Capability Maturity Model');
  if (!res.success || !Array.isArray(res.data)) return '';
  const techCol = Object.keys(res.data[0] || {}).find(k => k && k.toString().trim().toLowerCase() === 'technology maturity levels');
  const descCol = Object.keys(res.data[0] || {}).find(k => k && k.toString().trim().toLowerCase() === 'technology maturity description');
  if (!techCol || !descCol) return '';
  const match = res.data.find(row =>
    (row[techCol] || '').toString().trim().toLowerCase() === level.toString().trim().toLowerCase() &&
    row[descCol] && row[descCol].toString().trim() !== ''
  );
  return match && match[descCol] ? match[descCol] : '';
}

// Fetch all business and technology maturity descriptions and map them locally
export async function getAllMaturityDescriptionsFromMongo() {
  const res = await readSheetFromMongo('Capability Maturity Model');
  if (!res.success || !Array.isArray(res.data)) return { business: {}, technology: {} };
  const firstRow = res.data[0] || {};
  const businessCol = Object.keys(firstRow).find(k => k && k.toString().trim().toLowerCase() === 'business maturity levels');
  // Use correct column name for business maturity description
  const businessDescCol = Object.keys(firstRow).find(k => k && k.toString().trim().toLowerCase() === 'business maturity description');
  const techCol = Object.keys(firstRow).find(k => k && k.toString().trim().toLowerCase() === 'technology maturity levels');
  const techDescCol = Object.keys(firstRow).find(k => k && k.toString().trim().toLowerCase() === 'technology maturity description');
  const business = {};
  const technology = {};
  for (const row of res.data) {
    if (businessCol && businessDescCol && row[businessCol] && row[businessDescCol] && row[businessDescCol].toString().trim() !== '') {
      const key = row[businessCol].toString().trim();
      if (!business[key]) business[key] = row[businessDescCol];
    }
    if (techCol && techDescCol && row[techCol] && row[techDescCol] && row[techDescCol].toString().trim() !== '') {
      const key = row[techCol].toString().trim();
      if (!technology[key]) technology[key] = row[techDescCol];
    }
  }
  return { business, technology };
}
