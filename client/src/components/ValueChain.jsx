import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import StarRating from './StarRating';
import InlineInfoIcon from './InlineInfoIcon';
import { saveSubmission } from '../utils/api';

function ValueChain({ selected, frames, headers, onBack, onNextPage, preselectedBusinessType, onSelectBusinessType, userFlow }) {
  const [vcName, setVcName] = useState([]);
  const [capabilitiesByFrame, setCapabilitiesByFrame] = useState({});
  const [capMaturity, setCapMaturity] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoverInfo, setHoverInfo] = useState({ show: false, text: '', x: 0, y: 0 });
  const [starRatings, setStarRatings] = useState({}); // { capabilityName: rating }

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
              <div key={idx} className={`frame horizontal-frame`} style={{ minHeight: 'unset', height: 'auto', padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div className="frame-content" style={{ padding: 0, margin: 0, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <button
                      className={`frame-btn${isHighlighted ? ' selected' : ''}`}
                      style={{ width: '100%', marginBottom: 8, background: isHighlighted ? '#4caf50' : undefined, color: isHighlighted ? '#fff' : undefined }}
                      disabled
                    >
                      {item.name}
                      <span style={{ position: 'absolute', right: 2, bottom: 10 }}>
                        <InlineInfoIcon
                          onMouseEnter={e => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoverInfo({ show: true, text: item.description, x: rect.right, y: rect.bottom });
                          }}
                          onMouseLeave={() => setHoverInfo({ show: false, text: '', x: 0, y: 0 })}
                          style={{ fontSize: 16, width: 16, height: 16 }}
                        />
                      </span>
                    </button>
                  </div>
                </div>
                <StarRating maxStars={4} rating={starRatings[item.name] || 0} onChange={r => setStarRatings(prev => ({ ...prev, [item.name]: r }))} />
              </div>
            );
          })
        }
      </div>
      <div style={{
        background: '#fff',
        color: '#222',
        fontWeight: 400,
        fontSize: 16,
        textAlign: 'center',
        borderRadius: 8,
        padding: '16px 0',
        margin: '24px 0 0 0',
        boxShadow: '0 1px 6px rgba(0,0,0,0.04)'
      }}>
        Value Chain Maturity Assessment (Select based on company maturity)
      </div>
      <div style={{
        background: 'transparent',
        color: '#222',
        borderRadius: 8,
        padding: '20px 24px',
        margin: '20px 0 0 0',
        boxShadow: 'none',
        maxWidth: 900,
        marginLeft: 'auto',
        marginRight: 'auto',
        fontSize: 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8, width: '100%' }}>
          {[1,2,3,4].map(level => (
            <div key={level} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: 220, maxWidth: 220 }}>
              {[1,2,3,4].map(i => (
                <span key={i} style={{ color: i <= level ? '#fbbf24' : '#e5e7eb', fontSize: 22, marginRight: 2 }}>&#9733;</span>
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div style={{ textAlign: 'center', minWidth: 220, maxWidth: 220 }}>Functional</div>
          <div style={{ textAlign: 'center', minWidth: 220, maxWidth: 220 }}>Foundational Excellence</div>
          <div style={{ textAlign: 'center', minWidth: 220, maxWidth: 220 }}>Integrated Value Chain</div>
          <div style={{ textAlign: 'center', minWidth: 220, maxWidth: 220 }}>Ecosystem Driven</div>
        </div>
      </div>
      <button className="lets-go-btn" onClick={onBack}>Back</button>
      <button className="lets-go-btn" style={{ marginLeft: 16 }} onClick={async () => {
        // Save value chain names and star ratings as ValueChain array
        const valueChainArr = vcName.map(item => ({ Name: item.name, StarRating: starRatings[item.name] || 0 }));
        await saveSubmission({
          ...userFlow,
          ValueChain: valueChainArr
        });
        onNextPage();
      }}>
        Next
      </button>
      {hoverInfo.show && (
        <div
          style={{
            position: 'fixed',
            left: hoverInfo.x + 8,
            top: hoverInfo.y - 40,
            background: '#fff',
            color: '#222',
            border: '1px solid #b6c2d6',
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.13)',
            padding: '12px 18px',
            fontSize: '1em',
            zIndex: 2000,
            minWidth: 220,
            maxWidth: 320,
            pointerEvents: 'none',
            whiteSpace: 'normal',
          }}
        >
          {hoverInfo.text}
        </div>
      )}
    </div>
  );
}

export default ValueChain;
