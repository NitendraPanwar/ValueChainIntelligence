import React, { useEffect } from 'react';
import { saveValueChainEntry } from '../utils/api';
import { mutuallyExclusiveHeaders } from '../config';
import StarRating from './StarRating';

function BusinessComplexity({
  frames,
  headers,
  error,
  selected,
  handleButtonClick,
  setShowValueChain,
  preselectedBusinessType, // Receive preselectedBusinessType as a prop
  userFlow, // receive userFlow as prop
  businessComplexityOptions = [] // <-- pass from parent
}) {
  // Auto-select preselected industry on mount
  useEffect(() => {
    if (!preselectedBusinessType) return;
    headers.forEach((header, frameIdx) => {
      if (header && header.trim().toLowerCase() === 'industry') {
        const btnIdx = frames[frameIdx]?.findIndex(val => val === preselectedBusinessType);
        if (btnIdx !== -1 && !selected[`${frameIdx}-${btnIdx}`]) {
          handleButtonClick(frameIdx, btnIdx);
        }
      }
    });
    // Only run on mount or when preselectedBusinessType changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedBusinessType, headers, frames]);

  // Map legacy headers to new header for consistency
  const normalizeHeader = h => {
    if (!h) return h;
    const lower = h.trim().toLowerCase();
    if (lower === 'annual revenue' || lower === 'annual revenues' || lower === 'annual revenues (us$)') return 'Annual Revenues';
    return h;
  };
  const normalizedHeaders = headers.map(normalizeHeader);

  // Helper to get selected value for a header
  const getSelectedValue = (headerName) => {
    // Accept all variants for lookup
    const variants = [
      headerName,
      'Annual Revenue',
      'Annual Revenues',
      'Annual Revenues (US$)'
    ].map(h => h.trim().toLowerCase());
    const idx = normalizedHeaders.findIndex(h => h && variants.includes(h.trim().toLowerCase()));
    if (idx === -1) return '';
    const btnIdx = Object.keys(selected).find(key => key.startsWith(`${idx}-`) && selected[key]);
    if (!btnIdx) return '';
    const btnNum = Number(btnIdx.split('-')[1]);
    return frames[idx]?.[btnNum] || '';
  };

  // Render frames, but use businessComplexityOptions for the Business Complexity frame
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
      <div className="frames four-col-homepage">
        {/* Three main frames: Industry, Business Complexity, Annual Revenues */}
        {frames.slice(0, 3).map((frame, frameIdx) => {
          let frameData = frame;
          const header = normalizedHeaders[frameIdx];
          if (header && header.trim().toLowerCase() === 'business complexity' && businessComplexityOptions.length > 0) {
            frameData = businessComplexityOptions;
          }
          // Filter out MongoDB id columns from frameData
          frameData = frameData.filter(val => {
            if (!val) return false;
            if (typeof val === 'string' && (val.trim().toLowerCase() === '_id' || val.trim().toLowerCase() === 'id')) return false;
            return true;
          });
          // Check if this header is mutually exclusive
          const isMutuallyExclusive = mutuallyExclusiveHeaders.map(h => h.trim().toLowerCase()).includes((header || '').trim().toLowerCase());
          return (
            <div className="frame" key={frameIdx}>
              <h3>{header || ''}</h3>
              {frameData.map((val, btnIdx) => {
                const key = `${frameIdx}-${btnIdx}`;
                const isSelected = selected[key];
                // Industry logic for highlight/disable
                const isIndustryFrame = header && header.trim().toLowerCase() === 'industry';
                const isPreselected =
                  isIndustryFrame &&
                  preselectedBusinessType &&
                  val === preselectedBusinessType;
                const shouldDisable =
                  (isIndustryFrame && preselectedBusinessType) ||
                  (isMutuallyExclusive && Object.keys(selected).some(k => k.startsWith(`${frameIdx}-`) && selected[k] && k !== key));
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
          );
        })}
        {/* Fourth column: Let's Go button */}
        <div className="frame lets-go-frame">
          <div className="lets-go-btn-wrapper">
            <button className="lets-go-btn" onClick={async () => {
              // Save value chain entry to MongoDB
              const businessComplexity = getSelectedValue('Business Complexity');
              const annualRevenues = getSelectedValue('Annual Revenues (US$)');
              try {
                const response = await saveValueChainEntry({
                  name: userFlow.name,
                  businessType: userFlow.businessType,
                  label: userFlow.label,
                  businessComplexity,
                  annualRevenues
                });
                const entry = await response.json(); // Parse the response as JSON
                // Pass the new entry's _id to the ValueChain page/component
                if (entry && entry._id) {
                  setShowValueChain(entry._id); // setShowValueChain now expects the entryId
                } else {
                  setShowValueChain(true); // fallback
                }
              } catch (err) {
                // Optionally show error to user
              }
            }}>
              Let's GO !
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessComplexity;
