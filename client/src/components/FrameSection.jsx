import React from 'react';
import CapabilityButton from './CapabilityButton';
import { getMaturityNumbers } from '../utils/maturityApi';
import GaugeChart from '../components/GaugeChart';

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
                  valueChainEntryName: frame.valueChainEntryName, // Pass valueChainEntryName
                  popupStep: 'description', // Step 1: small description
                  width: 200 // Make small description popup 200px wide
                });
                setHoverInfo({ show: false, text: '', x: 0, y: 0 });
                setIsExpanded(false); // Reset expand state
                setShowAssessment(false); // Reset assessment state
              }}
              onClick={async e => {
                e.preventDefault();
                e.stopPropagation();
                // Only show popup if maturity is Low, Medium, or High
                const vcKey = (frame.name || '').toString().trim().toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ');
                const capKey = (cap.name || '').toString().trim().toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ');
                const maturity = capabilityMaturity[`${vcKey}||${capKey}`];
                const businessMaturity = capabilityMaturity[`${vcKey}||${capKey}|business`] || 'Not available';
                const technologyMaturity = capabilityMaturity[`${vcKey}||${capKey}|technology`] || 'Not available';
                // Owners (if available on cap)
                const businessOwner = cap.businessOwner || 'Not available';
                const technologyOwner = cap.technologyOwner || 'Not available';
                if (["Low", "Medium", "High"].includes(maturity)) {
                  // Query MongoDB for maturity numbers and log them
                  const { businessNumber, technologyNumber } = await getMaturityNumbers(businessMaturity, technologyMaturity);
                  console.log('Business Maturity Number:', businessNumber);
                  console.log('Technology Maturity Number:', technologyNumber);
                  setPopupInfo({
                    show: true,
                    x: e.clientX,
                    y: e.clientY,
                    popupStep: 'gauge', // Step for gauge chart popup (was 'expanded')
                    // No width override here; gauge chart popup uses default/modal width
                    text: (
                      <div style={{
                        minWidth: 700,
                        maxWidth: 700,
                        width: 700,
                        boxSizing: 'border-box',
                        padding: '32px 32px 32px 0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0,
                        overflowX: 'auto'
                      }}>
                        {/* Top frame: Title */}
                        <div style={{fontWeight: 700, fontSize: 22, marginBottom: 18, textAlign: 'center', borderBottom: '1px solid #eee', paddingBottom: 8}}>Capability Maturity</div>
                        {/* Second frame: Charts */}
                        <div style={{display: 'flex', alignItems: 'flex-start', gap: 0, justifyContent: 'center', margin: '0 0 18px 0', padding: 0}}>
                          {/* Business Gauge */}
                          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, paddingLeft: 0, paddingRight: 0}}>
                            <GaugeChart value={typeof businessNumber === 'number' ? businessNumber : 0} min={0} max={5} label="Business Maturity" width={220} />
                          </div>
                          {/* Technology Gauge */}
                          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, paddingLeft: 0, paddingRight: 0}}>
                            <GaugeChart value={typeof technologyNumber === 'number' ? technologyNumber : 0} min={0} max={5} label="Technology Maturity" width={220} />
                          </div>
                        </div>
                        {/* Third frame: Owners */}
                        <div style={{fontWeight: 600, marginBottom: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: 12}}>
                          <div>Business Owner: <b>{businessOwner}</b></div>
                          <div>Technology Owner: <b>{technologyOwner}</b></div>
                        </div>
                        {/* Fourth frame: Maturity Level */}
                        <div style={{fontWeight: 600, textAlign: 'center', borderTop: '1px solid #eee', paddingTop: 12, fontSize: 18}}>
                          Maturity Level: <b>{maturity}</b>
                        </div>
                      </div>
                    )
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
