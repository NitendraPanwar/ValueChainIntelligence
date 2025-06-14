import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

function BuildingBlocks({ businessType, onNext }) {
  // State for frames/capabilities
  const [frames, setFrames] = useState([]); // [{ name, description }]
  const [capabilitiesByFrame, setCapabilitiesByFrame] = useState({}); // { frameName: [capObj, ...] }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checked, setChecked] = useState({}); // { capName: true }

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
        // const capDescCol = capHeaderRow.findIndex(h => h && h.toString().trim().toLowerCase() === 'description');
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
          // const capDesc = capDescCol !== -1 ? row[capDescCol] : '';
          if (capByFrame[frameName] && capability) {
            capByFrame[frameName].push({ name: capability });
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

  return (
    <div className="container">
      {/* ...existing code... */}
      <div className="top-frame homepage">
        {`Building Blocks (Business) Capabilities – ${businessType}`}
      </div>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div className="third-page-content" style={{ maxWidth: '100%', margin: 0, borderRadius: 0, padding: 0, fontSize: '1em', color: '#222', boxShadow: 'none', background: 'transparent' }}>
        <div style={{ margin: '32px 0' }}>
          <div className="frames horizontal-scroll" style={{width: '100%', maxWidth: '100vw', justifyContent: 'flex-start'}}>
            {frames.length === 0 && !loading && (
              <div style={{ color: '#888', fontSize: '1.1em', margin: '32px auto' }}>
                No capabilities found.
              </div>
            )}
            {frames.map((item, idx) => (
              <div key={idx} className="frame horizontal-frame">
                <div className="frame-content">
                  <div className="frame-heading-fixed">{item.name}</div>
                  {/* Remove the description on BuildingBlocks page */}
                  {/* <div className="frame-description">{item.description}</div> */}
                  <div className="capability-btn-group">
                    {(capabilitiesByFrame[item.name] || []).map((cap, i) => (
                      <div key={i} className="capability-btn-wrapper" style={{ position: 'relative' }}>
                        <input
                          type="checkbox"
                          className="cap-checkbox"
                          style={{ position: 'absolute', top: 4, left: 4, zIndex: 2 }}
                          checked={!!checked[cap.name]}
                          onChange={e => setChecked(prev => ({ ...prev, [cap.name]: e.target.checked }))}
                        />
                        <button className={`frame-btn flipped`} disabled style={{ paddingLeft: 28 }}>{cap.name}</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="third-page-actions">
          <button className="lets-go-btn" onClick={() => {
            // Gather selected capabilities for next page
            const selectedCaps = [];
            frames.forEach(frame => {
              (capabilitiesByFrame[frame.name] || []).filter(cap => checked[cap.name]).forEach(cap => {
                selectedCaps.push({ frameName: frame.name, capName: cap.name });
              });
            });
            onNext(selectedCaps);
          }}>Next</button>
        </div>
      </div>
    </div>
  );
}

export default BuildingBlocks;
