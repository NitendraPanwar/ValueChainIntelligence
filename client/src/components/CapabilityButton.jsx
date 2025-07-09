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
      {/* Checkbox and dot stacked for filtered view in StrategicInitiativePage */}
      {showCheckboxInFilteredView ? (
        <div
          style={{
            position: 'absolute',
            left: 4,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 6,
            height: 32,
            // pointerEvents: 'auto', // REMOVE this line
          }}
        >
          <input
            type="checkbox"
            style={{
              width: 16,
              height: 16,
              marginBottom: 2,
              // pointerEvents: 'auto', // REMOVE this line
            }}
            aria-label="Select capability"
            checked={isChecked}
            onChange={e => {
              e.stopPropagation();
              if (onCapabilitySelect) onCapabilitySelect(cap, e.target.checked, frameName);
            }}
          />
          {maturity && (
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: color, border: '1.5px solid #888', display: 'block', marginTop: 2 }} />
          )}
        </div>
      ) : (
        maturity && (
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
        )
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
