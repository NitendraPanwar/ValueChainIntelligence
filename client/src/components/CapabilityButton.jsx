import React from 'react';
import InlineInfoIcon from './InlineInfoIcon';

// Helper to normalize names for key matching (copied from BusinessCapabilities)
function normalizeName(name) {
  return name
    ? name.toString().trim().toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ')
    : '';
}

function CapabilityButton({
  cap,
  frameName,
  displayMode,
  capabilityMaturity,
  onInfoClick,
  onInfoHover,
  onInfoLeave,
  showCheckboxInFilteredView,
  onCapabilitySelect,
  selectedCapabilities,
  onClick // <-- add onClick prop
}) {
  const vcKey = normalizeName(frameName);
  const capKey = normalizeName(cap.name);
  const maturity = capabilityMaturity[`${vcKey}||${capKey}`];
  let color = '#bbb';
  if (maturity === 'Low') color = 'red';
  else if (maturity === 'Medium') color = 'orange';
  else if (maturity === 'High') color = 'green';

  // Determine if this capability is selected
  const isChecked = !!(selectedCapabilities && selectedCapabilities.some(c => c.name === cap.name && c.frame === frameName));

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
      {/* Checkbox for filtered view in StrategicInitiativePage */}
      {showCheckboxInFilteredView && (
        <input
          type="checkbox"
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            zIndex: 5,
            width: 16,
            height: 16
          }}
          tabIndex={-1}
          aria-label="Select capability"
          checked={isChecked}
          onChange={e => onCapabilitySelect && onCapabilitySelect(cap, e.target.checked, frameName)}
        />
      )}
      {/* Info icon, hidden in filtered view on StrategicInitiativePage */}
      {!showCheckboxInFilteredView && (
        <span style={{ position: 'absolute', right: 2, bottom: 2, zIndex: 3 }}>
          <InlineInfoIcon
            onMouseEnter={onInfoHover}
            onMouseLeave={onInfoLeave}
            onClick={onInfoClick}
            style={{ fontSize: 16, width: 16, height: 16 }}
          />
        </span>
      )}
      <button className={`frame-btn flipped`} disabled={false} style={{ paddingLeft: 28, position: 'relative', paddingRight: 24 }}
        onClick={onClick}
      >
        {displayMode === 'capability' && cap.name}
        {displayMode === 'business' && (capabilityMaturity[`${vcKey}||${capKey}|business`] || 'Not available')}
        {displayMode === 'technology' && (capabilityMaturity[`${vcKey}||${capKey}|technology`] || 'Not available')}
      </button>
    </div>
  );
}

export default CapabilityButton;
