import React from 'react';
import CapabilityButton from './CapabilityButton';

function FrameSection({
  frame,
  capabilities,
  displayMode,
  capabilityMaturity,
  popupInfo,
  setPopupInfo,
  setHoverInfo,
  setIsExpanded,
  setShowAssessment,
  showCheckboxInFilteredView,
  onCapabilitySelect,
  selectedCapabilities
}) {
  return (
    <div className="frame horizontal-frame">
      <div className="frame-content">
        <div className="frame-heading-fixed">{frame.name}</div>
        {/* Remove the description on BusinessCapabilities page */}
        {/* <div className="frame-description">{frame.description}</div> */}
        <div className="capability-btn-group">
          {(capabilities || []).map((cap, i) => (
            <CapabilityButton
              key={i}
              cap={cap}
              frameName={frame.name}
              displayMode={displayMode}
              capabilityMaturity={capabilityMaturity}
              showCheckboxInFilteredView={showCheckboxInFilteredView}
              onCapabilitySelect={onCapabilitySelect}
              selectedCapabilities={selectedCapabilities}
              onInfoClick={e => {
                e.preventDefault();
                e.stopPropagation();
                setPopupInfo({ show: true, text: cap.description, capName: cap.name, frameName: frame.name });
                setHoverInfo({ show: false, text: '', x: 0, y: 0 });
                setIsExpanded(false); // Reset expand state
                setShowAssessment(false); // Reset assessment state
              }}
              onInfoHover={e => {
                if (!popupInfo.show) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoverInfo({ show: true, text: cap.description, x: rect.right, y: rect.bottom });
                }
              }}
              onInfoLeave={() => {
                if (!popupInfo.show) setHoverInfo({ show: false, text: '', x: 0, y: 0 });
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default FrameSection;
