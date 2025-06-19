import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

export function useValueChainData(businessType) {
  const [frames, setFrames] = useState([]); // [{ name, description }]
  const [capabilitiesByFrame, setCapabilitiesByFrame] = useState({}); // { frameName: [capObj, ...] }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!businessType) {
      setFrames([]);
      setCapabilitiesByFrame({});
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    fetch('/VC_Capability_Master.xlsx')
      .then(res => res.arrayBuffer())
      .then(data => {
        const workbook = XLSX.read(data, { type: 'array' });
        // 1. Load frames from Value Chain Master
        const vcSheet = workbook.Sheets['Value Chain Master'];
        if (!vcSheet) {
          setError('Value Chain Master sheet not found.');
          setLoading(false);
          return;
        }
        const vcJson = XLSX.utils.sheet_to_json(vcSheet, { header: 1 });
        const vcHeaderRow = vcJson[0] || [];
        const valueChainCol = vcHeaderRow.findIndex(h => h && h.toString().trim().toLowerCase() === 'value chain');
        const nameCol = vcHeaderRow.findIndex(h => h && h.toString().trim().toLowerCase() === 'name');
        const descCol = vcHeaderRow.findIndex(h => h && h.toString().trim().toLowerCase() === 'description');
        if (valueChainCol === -1 || nameCol === -1 || descCol === -1) {
          setError('Required columns not found in Value Chain Master. Columns found: ' + JSON.stringify(vcHeaderRow));
          setLoading(false);
          return;
        }
        const foundFrames = [];
        for (let i = 1; i < vcJson.length; i++) {
          if (vcJson[i][valueChainCol] && vcJson[i][valueChainCol].toString().trim() === businessType) {
            const frameName = vcJson[i][nameCol] || '';
            const description = vcJson[i][descCol] || '';
            let frame = foundFrames.find(f => f.name === frameName);
            if (!frame) {
              frame = { name: frameName, description };
              foundFrames.push(frame);
            }
          }
        }
        // 2. Load capabilities from Capability Master
        const capSheet = workbook.Sheets['Capability Master'];
        if (!capSheet) {
          setError('Capability Master sheet not found.');
          setLoading(false);
          setFrames(foundFrames);
          setCapabilitiesByFrame({});
          return;
        }
        const capJson = XLSX.utils.sheet_to_json(capSheet, { header: 1 });
        const capHeaderRow = capJson[0] || [];
        const capStageCol = capHeaderRow.findIndex(h => h && h.toString().trim().toLowerCase() === 'value chain stage');
        const capNameCol = capHeaderRow.findIndex(h => h && h.toString().trim().toLowerCase() === 'capability name');
        const capDescCol = capHeaderRow.findIndex(h => h && h.toString().trim().toLowerCase() === 'description');
        if (capStageCol === -1 || capNameCol === -1) {
          setError('Required columns not found in Capability Master. Columns found: ' + JSON.stringify(capHeaderRow));
          setLoading(false);
          setFrames(foundFrames);
          setCapabilitiesByFrame({});
          return;
        }
        // Map capabilities to frames
        const capByFrame = {};
        foundFrames.forEach(frame => {
          capByFrame[frame.name] = [];
        });
        for (let i = 1; i < capJson.length; i++) {
          const row = capJson[i];
          const frameName = row[capStageCol];
          const capability = row[capNameCol];
          const capDesc = capDescCol !== -1 ? row[capDescCol] : '';
          if (capByFrame[frameName] && capability) {
            capByFrame[frameName].push({ name: capability, description: capDesc });
          }
        }
        setFrames(foundFrames);
        setCapabilitiesByFrame(capByFrame);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load Value Chain or Capability Master sheet.');
        setLoading(false);
      });
  }, [businessType]);

  return { frames, capabilitiesByFrame, loading, error };
}
