import { readSheetFromMongo } from './mongoApi';

// Query Capability Maturity Model for business/technology maturity numbers
export async function getMaturityNumbers(businessLevel, technologyLevel) {
  const res = await readSheetFromMongo('Capability Maturity Model');
  if (!res.success || !Array.isArray(res.data)) return { businessNumber: null, technologyNumber: null };
  let businessNumber = null;
  let technologyNumber = null;
  for (const row of res.data) {
    // Find columns
    const businessCol = Object.keys(row).find(k => k && k.toString().trim().toLowerCase() === 'business maturity levels');
    const businessNumCol = Object.keys(row).find(k => k && k.toString().trim().toLowerCase() === 'business maturity number');
    const techCol = Object.keys(row).find(k => k && k.toString().trim().toLowerCase() === 'technology maturity levels');
    const techNumCol = Object.keys(row).find(k => k && k.toString().trim().toLowerCase() === 'technology maturity number');
    if (businessCol && businessNumCol && row[businessCol] && row[businessNumCol] && row[businessCol].toString().trim().toLowerCase() === businessLevel.toString().trim().toLowerCase()) {
      businessNumber = row[businessNumCol];
    }
    if (techCol && techNumCol && row[techCol] && row[techNumCol] && row[techCol].toString().trim().toLowerCase() === technologyLevel.toString().trim().toLowerCase()) {
      technologyNumber = row[techNumCol];
    }
    if (businessNumber !== null && technologyNumber !== null) break;
  }
  return { businessNumber, technologyNumber };
}
