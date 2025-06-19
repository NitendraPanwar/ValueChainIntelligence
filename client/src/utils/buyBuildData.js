import * as XLSX from 'xlsx';

export async function getBuyBuildData(capabilityName, industry) {
  // industry = businessType
  const res = await fetch('/VC_Capability_Master.xlsx');
  const data = await res.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const sheet = workbook.Sheets['Buy or Build'];
  if (!sheet) {
    return { description: '', suggestions: '' };
  }
  const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const headerRow = json[0] || [];
  const capNameCol = headerRow.findIndex(h => h && h.toString().trim().toLowerCase() === 'capability name');
  const industryCol = headerRow.findIndex(h => h && h.toString().trim().toLowerCase() === 'industry');
  const descCol = headerRow.findIndex(h => h && h.toString().trim().toLowerCase() === 'buy/build description');
  const suggCol = headerRow.findIndex(h => h && h.toString().trim().toLowerCase() === 'suggestions');
  if (capNameCol === -1 || industryCol === -1 || descCol === -1 || suggCol === -1) {
    return { description: '', suggestions: '' };
  }
  for (let i = 1; i < json.length; i++) {
    const row = json[i];
    if (
      row[capNameCol] && row[capNameCol].toString().trim().toLowerCase() === capabilityName.toString().trim().toLowerCase() &&
      row[industryCol] && row[industryCol].toString().trim().toLowerCase() === industry.toString().trim().toLowerCase()
    ) {
      const result = {
        description: row[descCol] || '',
        suggestions: row[suggCol] || ''
      };
      return result;
    }
  }
  return { description: '', suggestions: '' };
}
