import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import StarRating from './StarRating';

function ValueChain({ selected, frames, headers, onBack, onNextPage, preselectedBusinessType, onSelectBusinessType }) {
  const [vcName, setVcName] = useState([]);
  const [capabilitiesByFrame, setCapabilitiesByFrame] = useState({});
  const [capMaturity, setCapMaturity] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Compute the business type to highlight: selected or preselected if none selected
  let selectedBusinessType = '';
  let businessType = '';
  Object.keys(selected).forEach(key => {
    if (selected[key]) {
      const [frameIdx, btnIdx] = key.split('-').map(Number);
      if (headers[frameIdx] && headers[frameIdx].trim().toLowerCase() === 'business type') {
        selectedBusinessType = frames[frameIdx]?.[btnIdx] || '';
        businessType = frames[frameIdx]?.[btnIdx] || '';
      }
    }
  });
  // If not selected, use preselectedBusinessType (for both highlight and data loading)
  if (!selectedBusinessType && preselectedBusinessType) {
    selectedBusinessType = preselectedBusinessType;
  }
  if (!businessType && preselectedBusinessType) {
    businessType = preselectedBusinessType;
  }

  // If still no businessType, try to fallback to first available in frames (for robustness)
  if (!businessType && frames && headers) {
    headers.forEach((header, frameIdx) => {
      if (header && header.trim().toLowerCase() === 'business type') {
        if (frames[frameIdx] && frames[frameIdx][0]) {
          businessType = frames[frameIdx][0];
        }
      }
    });
  }

  // Ensure businessType is passed to parent for BuildingBlocks page
  useEffect(() => {
    if (typeof onSelectBusinessType === 'function' && businessType) {
      // Find the frameIdx and btnIdx for the current businessType
      headers.forEach((header, frameIdx) => {
        if (header && header.trim().toLowerCase() === 'business type') {
          const btnIdx = frames[frameIdx]?.findIndex(val => val === businessType);
          if (btnIdx !== -1 && btnIdx !== undefined) {
            onSelectBusinessType(frameIdx, btnIdx);
          }
        }
      });
    }
    // Only run when businessType changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessType]);

  useEffect(() => {
    if (!businessType) {
      setVcName([]);
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
        const sheet = workbook.Sheets['Value Chain Master'];
        if (!sheet) {
          setError('Value Chain Master sheet not found.');
          setLoading(false);
          return;
        }
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const headerRow = json[0] || [];
        const valueChainCol = headerRow.findIndex(h => h && h.toString().trim().toLowerCase() === 'value chain');
        const nameCol = headerRow.findIndex(h => h && h.toString().trim().toLowerCase() === 'name');
        const descCol = headerRow.findIndex(h => h && h.toString().trim().toLowerCase() === 'description');
        if (valueChainCol === -1 || nameCol === -1 || descCol === -1) {
          setError('Required columns not found in Value Chain Master. Columns found: ' + JSON.stringify(headerRow));
          setLoading(false);
          return;
        }
        const found = [];
        for (let i = 1; i < json.length; i++) {
          if (json[i][valueChainCol] && json[i][valueChainCol].toString().trim() === businessType) {
            found.push({
              name: json[i][nameCol] || '',
              description: json[i][descCol] || ''
            });
          }
        }
        setVcName(found);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load Value Chain Master sheet.');
        setLoading(false);
      });
  }, [businessType, frames, headers, selected]);

  return (
    <div className="container">
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 100, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: '16px 0 8px 0', textAlign: 'right' }}>
        <h1 style={{ margin: 0, fontSize: '2em' }}>Value Chain Intelligence</h1>
        <h2 style={{ margin: 0, fontSize: '1.1em', fontWeight: 400 }}>Powered by Beyond Axis</h2>
      </div>
      <div style={{ height: 90 }} />
      <div className="top-frame">
        Value Chain{businessType ? ' - ' + businessType : ''}
      </div>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div className="frames horizontal-scroll" style={{ marginBottom: 24, paddingLeft: 0, marginLeft: 0, justifyContent: 'flex-start' }}>
        {Array.isArray(vcName) && vcName.length > 0 &&
          vcName.map((item, idx) => {
            // Find the frameIdx and btnIdx for this item
            let frameIdx = -1, btnIdx = -1;
            headers.forEach((header, fIdx) => {
              if (header && header.trim().toLowerCase() === 'business type') {
                const bIdx = frames[fIdx]?.findIndex(val => val === item.name);
                if (bIdx !== -1 && bIdx !== undefined) {
                  frameIdx = fIdx;
                  btnIdx = bIdx;
                }
              }
            });
            // Highlight if this is the selected or preselected business type
            let isHighlighted = false;
            if (Object.values(selected).some(Boolean)) {
              isHighlighted = selected[`${frameIdx}-${btnIdx}`] === true;
            } else if (preselectedBusinessType && item.name === preselectedBusinessType) {
              isHighlighted = true;
            }
            return (
              <div key={idx} className={`frame horizontal-frame`}>
                <div className="frame-content">
                  <button
                    className={`frame-btn${isHighlighted ? ' selected' : ''}`}
                    style={{ width: '100%', marginBottom: 8, background: isHighlighted ? '#4caf50' : undefined, color: isHighlighted ? '#fff' : undefined }}
                    disabled
                  >
                    {item.name}
                  </button>
                  <div className="frame-heading-fixed">{item.name}</div>
                  {/* Remove the description on BuildingBlocks page, only show on ValueChain */}
                  {typeof onNextPage === 'function' && (
                    <div className="frame-description">{item.description}</div>
                  )}
                </div>
                <StarRating maxStars={4} />
              </div>
            );
          })
        }
      </div>
      <button className="lets-go-btn" onClick={onBack}>Back</button>
      <button className="lets-go-btn" style={{ marginLeft: 16 }} onClick={onNextPage}>
        Next
      </button>
    </div>
  );
}

export default ValueChain;
