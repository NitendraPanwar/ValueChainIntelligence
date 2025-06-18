import React from 'react';
import InlineInfoIcon from './InlineInfoIcon';

function CapabilityButton({
  cap,
  frameName,
  displayMode,
  capabilityMaturity,
  onInfoClick,
  onInfoHover,
  onInfoLeave
}) {
  const vcKey = frameName.toString().trim().toLowerCase();
  const capKey = cap.name.toString().trim().toLowerCase();
  const maturity = capabilityMaturity[`${vcKey}||${capKey}`];
  let color = '#bbb';
  if (maturity === '1' || maturity === 1) color = 'red';
  else if (maturity === '2' || maturity === 2) color = 'orange';
  else if (maturity === '3' || maturity === 3) color = 'green';

  return (
    <div className="capability-btn-wrapper" style={{ position: 'relative' }}>
      {/* Traffic light indicator */}
      {maturity && (
        <span style={{
          position: 'absolute',
          left: 6,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          zIndex: 4
        }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: color, border: '1.5px solid #888', display: 'block' }} />
        </span>
      )}
      <button className={`frame-btn flipped`} disabled style={{ paddingLeft: 28, position: 'relative', paddingRight: 24 }}>
        {displayMode === 'capability' && cap.name}
        {displayMode === 'business' && (capabilityMaturity[`${vcKey}||${capKey}|business`] || 'Not available')}
        {displayMode === 'technology' && (capabilityMaturity[`${vcKey}||${capKey}|technology`] || 'Not available')}
      </button>
      <span style={{ position: 'absolute', right: 2, bottom: 2, zIndex: 3 }}>
        <InlineInfoIcon
          onMouseEnter={onInfoHover}
          onMouseLeave={onInfoLeave}
          onClick={onInfoClick}
          style={{ fontSize: 16, width: 16, height: 16 }}
        />
      </span>
    </div>
  );
}

export default CapabilityButton;
