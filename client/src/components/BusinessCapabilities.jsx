import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import InlineInfoIcon from './InlineInfoIcon';
import ExpandedCapabilityView from './ExpandedCapabilityView';
import CapabilityMaturityAssessment from './CapabilityMaturityAssessment';
import { getSubmissions } from '../utils/api';
import CapabilityButton from './CapabilityButton';
import FrameSection from './FrameSection';
import CapabilityPopupModal from './CapabilityPopupModal';
import { useValueChainData } from '../utils/useValueChainData';

function BusinessCapabilities({ businessType, onNext, userFlow, filterMaturityOnly, onBack, showCheckboxInFilteredView, onCapabilitySelect, selectedCapabilities }) {
  // State for frames/capabilities
  const { frames, capabilitiesByFrame, loading, error } = useValueChainData(businessType);
  const [checked, setChecked] = useState({}); // { capName: true }
  const [hoverInfo, setHoverInfo] = useState({ show: false, text: '', x: 0, y: 0 });
  const [popupInfo, setPopupInfo] = useState({ show: false, text: '', x: 0, y: 0 });
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [capabilityMaturity, setCapabilityMaturity] = useState({}); // { capName: maturityLevel }
  const [displayMode, setDisplayMode] = useState('capability'); // 'capability' | 'business' | 'technology'

  useEffect(() => {
    getSubmissions().then(subs => {
      // Only use the submission that matches the current userFlow (name, businessType, label)
      const sub = subs.find(s =>
        s.name === userFlow.name &&
        s.businessType === userFlow.businessType &&
        s.label === userFlow.label
      );
      const capMaturity = {};
      if (sub && sub.ValueChain && Array.isArray(sub.ValueChain)) {
        sub.ValueChain.forEach(vc => {
          if (vc.Capability && Array.isArray(vc.Capability)) {
            vc.Capability.forEach(cap => {
              if (cap.Name) {
                const vcKey = (vc.Name || '').toString().trim().toLowerCase();
                const capKey = (cap.Name || '').toString().trim().toLowerCase();
                if (cap['Maturity Level']) capMaturity[`${vcKey}||${capKey}`] = cap['Maturity Level'];
                if (cap['Business Maturity']) capMaturity[`${vcKey}||${capKey}|business`] = cap['Business Maturity'];
                if (cap['Technology Maturity']) capMaturity[`${vcKey}||${capKey}|technology`] = cap['Technology Maturity'];
              }
            });
          }
        });
      }
      setCapabilityMaturity(capMaturity);
    });
  }, [businessType, popupInfo, userFlow]);

  // Filter capabilities if filterMaturityOnly is true
  const filteredCapabilitiesByFrame = React.useMemo(() => {
    if (!filterMaturityOnly) return capabilitiesByFrame;
    // Only include capabilities with a maturity level set
    const filtered = {};
    Object.entries(capabilitiesByFrame).forEach(([frame, caps]) => {
      filtered[frame] = caps.filter(cap => {
        const vcKey = frame.toString().trim().toLowerCase();
        const capKey = cap.name.toString().trim().toLowerCase();
        return capabilityMaturity[`${vcKey}||${capKey}`];
      });
    });
    return filtered;
  }, [capabilitiesByFrame, capabilityMaturity, filterMaturityOnly]);

  // Show back button if filterMaturityOnly is true
  const showBackButton = !!filterMaturityOnly;

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
      <div className="top-frame homepage" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{`Building Blocks (Business) Capabilities – ${businessType}`}</span>
        {/* Segmented Control (Modern Pill Switch) */}
        <div style={{
          display: 'flex',
          borderRadius: 20,
          background: '#e3e8f0',
          overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
          minWidth: 120
        }}>
          <button
            onClick={() => setDisplayMode('capability')}
            style={{
              flex: 1,
              padding: '8px 18px',
              background: displayMode === 'capability' ? '#2b5cb8' : 'transparent',
              color: displayMode === 'capability' ? '#fff' : '#222',
              border: 'none',
              fontWeight: 600,
              fontSize: 20,
              transition: 'background 0.2s, color 0.2s',
              outline: 'none',
              cursor: 'pointer',
              boxShadow: displayMode === 'capability' ? '0 2px 8px rgba(43,92,184,0.12)' : 'none'
            }}
            title="Capability"
          >
            🧩
          </button>
          <button
            onClick={() => setDisplayMode('business')}
            style={{
              flex: 1,
              padding: '8px 18px',
              background: displayMode === 'business' ? '#2b5cb8' : 'transparent',
              color: displayMode === 'business' ? '#fff' : '#222',
              border: 'none',
              fontWeight: 600,
              fontSize: 20,
              transition: 'background 0.2s, color 0.2s',
              outline: 'none',
              cursor: 'pointer',
              boxShadow: displayMode === 'business' ? '0 2px 8px rgba(43,92,184,0.12)' : 'none'
            }}
            title="Business"
          >
            💼
          </button>
          <button
            onClick={() => setDisplayMode('technology')}
            style={{
              flex: 1,
              padding: '8px 18px',
              background: displayMode === 'technology' ? '#2b5cb8' : 'transparent',
              color: displayMode === 'technology' ? '#fff' : '#222',
              border: 'none',
              fontWeight: 600,
              fontSize: 20,
              transition: 'background 0.2s, color 0.2s',
              outline: 'none',
              cursor: 'pointer',
              boxShadow: displayMode === 'technology' ? '0 2px 8px rgba(43,92,184,0.12)' : 'none'
            }}
            title="Technology"
          >
            💻
          </button>
        </div>
      </div>
      <div className="third-page-content" style={{ maxWidth: '100%', margin: 0, borderRadius: 0, padding: 0, fontSize: '1em', color: '#222', boxShadow: 'none', background: 'transparent' }}>
        <div style={{ margin: '32px 0' }}>
          <div className="frames horizontal-scroll" style={{width: '100%', maxWidth: '100vw', justifyContent: 'flex-start'}}>
            {frames.filter(Boolean).map((item, idx) => (
              item && item.name && Array.isArray(filteredCapabilitiesByFrame[item.name]) && (
                <FrameSection
                  key={idx}
                  frame={item}
                  capabilities={filteredCapabilitiesByFrame[item.name]}
                  displayMode={displayMode}
                  capabilityMaturity={capabilityMaturity}
                  popupInfo={popupInfo}
                  setPopupInfo={setPopupInfo}
                  setHoverInfo={setHoverInfo}
                  setIsExpanded={setIsExpanded}
                  setShowAssessment={setShowAssessment}
                  showCheckboxInFilteredView={showCheckboxInFilteredView}
                  onCapabilitySelect={onCapabilitySelect}
                  selectedCapabilities={selectedCapabilities}
                />
              )
            ))}
          </div>
        </div>
        <div className="third-page-actions" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: 32, marginTop: 24 }}>
          {showBackButton && (
            <button
              className="lets-go-btn"
              style={{ minWidth: 120, background: '#fff', color: '#2b5cb8', border: '1.5px solid #2b5cb8', fontWeight: 700, marginRight: 120 }}
              onClick={onBack}
            >
              &larr; Back
            </button>
          )}
          <button className="lets-go-btn" onClick={onNext}>Next</button>
        </div>
      </div>
      <CapabilityPopupModal
        popupInfo={popupInfo}
        isExpanded={isExpanded}
        showAssessment={showAssessment}
        setPopupInfo={setPopupInfo}
        setIsExpanded={setIsExpanded}
        setShowAssessment={setShowAssessment}
        userFlow={userFlow}
      />
    </div>
  );
}

export default BusinessCapabilities;
