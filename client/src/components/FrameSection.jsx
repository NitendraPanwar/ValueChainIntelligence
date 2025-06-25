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
                setPopupInfo({
                  show: true,
                  text: cap.shortDescription || cap.description,
                  capName: cap.name,
                  frameName: frame.name,
                  valueChainId: frame.valueChainId || frame._id, // Pass valueChainId for assessment
                  valueChainEntryId: frame.valueChainEntryId, // Pass valueChainEntryId
                  valueChainEntryName: frame.valueChainEntryName // Pass valueChainEntryName
                });
                setHoverInfo({ show: false, text: '', x: 0, y: 0 });
                setIsExpanded(false); // Reset expand state
                setShowAssessment(false); // Reset assessment state
              }}
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                // Only show popup if maturity is Low, Medium, or High
                const vcKey = (frame.name || '').toString().trim().toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ');
                const capKey = (cap.name || '').toString().trim().toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ');
                const maturity = capabilityMaturity[`${vcKey}||${capKey}`];
                if (['Low', 'Medium', 'High'].includes(maturity)) {
                  setPopupInfo({
                    show: true,
                    text: 'left click done',
                    x: e.clientX,
                    y: e.clientY
                  });
                }
              }}
              onInfoHover={e => {
                if (!popupInfo.show) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoverInfo({ show: true, text: cap.shortDescription || cap.description, x: rect.right, y: rect.bottom });
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
