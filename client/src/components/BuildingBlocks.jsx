import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import InlineInfoIcon from './InlineInfoIcon';
import ExpandedCapabilityView from './ExpandedCapabilityView';
import CapabilityMaturityAssessment from './CapabilityMaturityAssessment';

function BuildingBlocks({ businessType, onNext }) {
  // State for frames/capabilities
  const [frames, setFrames] = useState([]); // [{ name, description }]
  const [capabilitiesByFrame, setCapabilitiesByFrame] = useState({}); // { frameName: [capObj, ...] }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checked, setChecked] = useState({}); // { capName: true }
  const [hoverInfo, setHoverInfo] = useState({ show: false, text: '', x: 0, y: 0 });
  const [popupInfo, setPopupInfo] = useState({ show: false, text: '', x: 0, y: 0 });
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);

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

  return (
    <div className="container">
      {/* Fixed header and subheader */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 100,
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        padding: '16px 0 8px 0',
        textAlign: 'right',
      }}>
        <h1 style={{ margin: 0, fontSize: '2em' }}>Value Chain Intelligence</h1>
        <h2 style={{ margin: 0, fontSize: '1.1em', fontWeight: 400 }}>Powered by Beyond Axis</h2>
      </div>
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
                        {/*
                        <input
                          type="checkbox"
                          className="cap-checkbox"
                          style={{ position: 'absolute', top: 4, left: 4, zIndex: 2 }}
                          checked={!!checked[cap.name]}
                          onChange={e => setChecked(prev => ({ ...prev, [cap.name]: e.target.checked }))}
                        />
                        */}
                        <button className={`frame-btn flipped`} disabled style={{ paddingLeft: 28, position: 'relative', paddingRight: 24 }}>
                          {cap.name}
                        </button>
                        <span style={{ position: 'absolute', right: 2, bottom: 2, zIndex: 3 }}>
                          <InlineInfoIcon
                            onMouseEnter={e => {
                              if (!popupInfo.show) {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setHoverInfo({ show: true, text: cap.description, x: rect.right, y: rect.bottom });
                              }
                            }}
                            onMouseLeave={() => {
                              if (!popupInfo.show) setHoverInfo({ show: false, text: '', x: 0, y: 0 });
                            }}
                            onClick={e => {
                              e.preventDefault();
                              e.stopPropagation();
                              setPopupInfo({ show: true, text: cap.description });
                              setHoverInfo({ show: false, text: '', x: 0, y: 0 });
                              setIsExpanded(false); // Reset expand state
                              setShowAssessment(false); // Reset assessment state
                            }}
                            style={{ fontSize: 16, width: 16, height: 16 }}
                          />
                        </span>
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
      {hoverInfo.show && !popupInfo.show && (
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
      {popupInfo.show && (
        <div
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.18)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: '#fff',
              color: '#222',
              border: '1px solid #b6c2d6',
              borderRadius: 10,
              boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
              padding: '24px 32px 18px 24px',
              fontSize: '1.1em',
              minWidth: isExpanded ? '90vw' : 220,
              maxWidth: isExpanded ? '90vw' : 320,
              minHeight: isExpanded ? '80vh' : undefined,
              position: 'relative',
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
            }}
          >
            {isExpanded ? (
              showAssessment ? (
                <CapabilityMaturityAssessment />
              ) : (
                <ExpandedCapabilityView
                  description={popupInfo.text}
                  onAssess={() => setShowAssessment(true)}
                />
              )
            ) : (
              popupInfo.text
            )}
            <button
              onClick={() => setIsExpanded(exp => !exp)}
              style={{
                position: 'absolute',
                top: 0,
                right: 36,
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: 0,
                background: 'transparent',
                border: 'none',
                fontSize: 22,
                lineHeight: 1,
                color: '#888',
                cursor: 'pointer',
                fontWeight: 700,
                zIndex: 4000,
                transform: 'translateY(1px)'
              }}
              aria-label="Expand"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              ⛶
            </button>
            <button
              onClick={() => {
                setPopupInfo({ show: false, text: '' });
                setIsExpanded(false); // Reset expand state on close
                setShowAssessment(false); // Reset assessment state on close
              }}
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: 0,
                background: 'transparent',
                border: 'none',
                fontSize: 22,
                lineHeight: 1,
                color: '#888',
                cursor: 'pointer',
                fontWeight: 700,
                zIndex: 4000,
              }}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BuildingBlocks;
