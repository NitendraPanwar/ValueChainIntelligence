import React, { useEffect } from 'react';
import { saveSubmission } from '../utils/api';
import StarRating from './StarRating';

function BusinessComplexity({
  frames,
  headers,
  error,
  selected,
  handleButtonClick,
  setShowValueChain,
  preselectedBusinessType, // Receive preselectedBusinessType as a prop
  userFlow // receive userFlow as prop
}) {
  // Auto-select preselected business type on mount
  useEffect(() => {
    if (!preselectedBusinessType) return;
    headers.forEach((header, frameIdx) => {
      if (header && header.trim().toLowerCase() === 'business type') {
        const btnIdx = frames[frameIdx]?.findIndex(val => val === preselectedBusinessType);
        if (btnIdx !== -1 && !selected[`${frameIdx}-${btnIdx}`]) {
          handleButtonClick(frameIdx, btnIdx);
        }
      }
    });
    // Only run on mount or when preselectedBusinessType changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedBusinessType]);

  // Helper to get selected value for a header
  const getSelectedValue = (headerName) => {
    const idx = headers.findIndex(h => h && h.trim().toLowerCase() === headerName.toLowerCase());
    if (idx === -1) return '';
    const btnIdx = Object.keys(selected).find(key => key.startsWith(`${idx}-`) && selected[key]);
    if (!btnIdx) return '';
    const btnNum = Number(btnIdx.split('-')[1]);
    return frames[idx]?.[btnNum] || '';
  };

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
      <div className="top-frame homepage" style={{ marginTop: 0, marginBottom: 0 }}>
        Let’s build your future ready value chain!
      </div>
      {error && <div style={{ color: 'red', margin: '20px 0' }}>{error}</div>}
      <div className="frames">
        {/* Four columns: Business Type, Business Complexity, Number of Employees, Annual Revenues (US$) */}
        {frames.slice(0, 4).map((frame, frameIdx) => (
          <div className="frame" key={frameIdx}>
            <h3>{headers[frameIdx] || ''}</h3>
            {frame.map((val, btnIdx) => {
              const key = `${frameIdx}-${btnIdx}`;
              const isSelected = selected[key];
              // Business Type logic for highlight/disable
              const isBusinessTypeFrame = headers[frameIdx] && headers[frameIdx].trim().toLowerCase() === 'business type';
              const isPreselected =
                isBusinessTypeFrame &&
                preselectedBusinessType &&
                val === preselectedBusinessType;
              const shouldDisable = isBusinessTypeFrame && preselectedBusinessType;
              return (
                <button
                  key={btnIdx}
                  className={`frame-btn${(isSelected || isPreselected) ? ' selected' : ''}`}
                  style={(isSelected || isPreselected) ? { background: '#25BE3B', color: '#111', border: '1px solid #fff' } : {}}
                  disabled={shouldDisable}
                  onClick={() => handleButtonClick(frameIdx, btnIdx)}
                >
                  {val}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <button className="lets-go-btn" onClick={async () => {
        // Save/update submission with Business Complexity and Annual Revenues
        const businessComplexity = getSelectedValue('Business Complexity');
        const annualRevenues = getSelectedValue('Annual Revenues (US$)');
        await saveSubmission({
          name: userFlow.name,
          businessType: userFlow.businessType,
          label: userFlow.label,
          businessComplexity,
          annualRevenues
        });
        setShowValueChain(true);
      }}>Let's GO !</button>
    </div>
  );
}

export default BusinessComplexity;
