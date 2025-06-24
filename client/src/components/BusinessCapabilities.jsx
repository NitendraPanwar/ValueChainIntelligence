import React, { useState, useEffect } from 'react';
import InlineInfoIcon from './InlineInfoIcon';
import ExpandedCapabilityView from './ExpandedCapabilityView';
import CapabilityMaturityAssessment from './CapabilityMaturityAssessment';
import { getSubmissions, persistCapability } from '../utils/api';
import { getValueChainsByEntryId, getCapabilitiesByValueChainId } from '../utils/api.valuechains';
import CapabilityButton from './CapabilityButton';
import FrameSection from './FrameSection';
import CapabilityPopupModal from './CapabilityPopupModal';
import { useValueChainData } from '../utils/useValueChainData';

function BusinessCapabilities({ businessType, onNext, userFlow, filterMaturityOnly, onBack, showCheckboxInFilteredView, onCapabilitySelect, selectedCapabilities, entryId, valueChainId, valueChainIds = [], valueChainNames = [] }) {
  // Use valueChainNames (array) and businessType for MongoDB query if provided, else fallback to userFlow.valueChainName
  const effectiveValueChainNames = valueChainNames.length > 0 ? valueChainNames : [userFlow.valueChainName || userFlow.name];
  const effectiveValueChainIds = valueChainIds.length > 0 ? valueChainIds : (valueChainId ? [valueChainId] : []);
  // Pass the full array to useValueChainData, not just the first element
  const { frames, capabilitiesByFrame, loading, error } = useValueChainData(effectiveValueChainNames, businessType);
  // State for frames/capabilities
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
      // Helper to normalize names for key matching
      function normalizeName(name) {
        return name
          ? name.toString().trim().toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ')
          : '';
      }
      // Helper to recursively collect all capabilities
      function collectCapabilities(vc, vcName) {
        if (vc.Capability && Array.isArray(vc.Capability)) {
          vc.Capability.forEach(cap => {
            if (cap.Name) {
              const vcKey = normalizeName(vcName || vc.Name || '');
              const capKey = normalizeName(cap.Name || '');
              if (cap['Maturity Level']) capMaturity[`${vcKey}||${capKey}`] = cap['Maturity Level'];
              if (cap['Business Maturity']) capMaturity[`${vcKey}||${capKey}|business`] = cap['Business Maturity'];
              if (cap['Technology Maturity']) capMaturity[`${vcKey}||${capKey}|technology`] = cap['Technology Maturity'];
            }
            // Recursively collect nested capabilities
            if (cap.Capability && Array.isArray(cap.Capability)) {
              collectCapabilities(cap, vcName || vc.Name);
            }
          });
        }
      }
      if (sub && sub.ValueChain && Array.isArray(sub.ValueChain)) {
        sub.ValueChain.forEach(vc => {
          collectCapabilities(vc, vc.Name);
        });
      }
      setCapabilityMaturity(capMaturity);
    });
  }, [businessType, popupInfo, userFlow]);

  // Persist all capabilities (name only) for each value chain (frame) on load
  useEffect(() => {
    if (!entryId || effectiveValueChainIds.length === 0) return;
    // To avoid duplicate capability names for the same valueChainId and entryId
    const persisted = new Set();
    frames.forEach((frame, idx) => {
      // Use valueChainIds and valueChainNames arrays for all frames (assume 1:1 order)
      const currentValueChainId = effectiveValueChainIds[idx] || effectiveValueChainIds[0];
      const currentValueChainName = valueChainNames[idx] || valueChainNames[0];
      const caps = capabilitiesByFrame[frame.name] || [];
      caps.forEach(cap => {
        if (cap && cap.name && currentValueChainId) {
          const key = `${currentValueChainId}||${entryId}||${cap.name.trim().toLowerCase()}`;
          if (!persisted.has(key)) {
            persisted.add(key);
            persistCapability({
              valueChainId: currentValueChainId,
              valueChainName: currentValueChainName,
              entryId,
              entryName: userFlow.name,
              name: cap.name,
              valueChainEntryId: entryId,
              valueChainEntryName: userFlow.name
            })
              .then(res => {
                // Handle response if needed
              })
              .catch(err => {
                // Handle error if needed
              });
          }
        }
      });
    });
  }, [frames, capabilitiesByFrame, entryId, valueChainId, valueChainIds, valueChainNames, userFlow.name]);

  // Filter capabilities if filterMaturityOnly is true
  const filteredCapabilitiesByFrame = React.useMemo(() => {
    if (!filterMaturityOnly) return capabilitiesByFrame;
    // Only include capabilities with a maturity level set
    const filtered = {};
    Object.entries(capabilitiesByFrame).forEach(([frame, caps]) => {
      filtered[frame] = caps.filter(cap => {
        const vcKey = normalizeName(frame.toString());
        const capKey = normalizeName(cap.name.toString());
        return capabilityMaturity[`${vcKey}||${capKey}`];
      });
    });
    return filtered;
  }, [capabilitiesByFrame, capabilityMaturity, filterMaturityOnly]);

  // Show back button if filterMaturityOnly is true
  const showBackButton = !!filterMaturityOnly;

  // Ensure each frame has valueChainId and valueChainName
  const framesWithIds = frames.map((frame, idx) => ({
    ...frame,
    valueChainId: frame.valueChainId || frame._id || effectiveValueChainIds[idx] || effectiveValueChainIds[0],
    valueChainName: frame.valueChainName || effectiveValueChainNames[idx] || effectiveValueChainNames[0],
  }));

  if (!valueChainIds.length || !valueChainNames.length) {
    return <div style={{padding: 40, textAlign: 'center', fontSize: 22}}>Loading value chains...</div>;
  }

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
            {framesWithIds.filter(Boolean).map((item, idx) => (
              item && item.name && Array.isArray(filteredCapabilitiesByFrame[item.name]) && (
                <FrameSection
                  key={idx}
                  frame={item}
                  capabilities={filteredCapabilitiesByFrame[item.name]}
                  displayMode={displayMode}
                  capabilityMaturity={capabilityMaturity}
                  popupInfo={popupInfo}
                  setPopupInfo={(info) => {
                    // Attach valueChainId and valueChainName to popupInfo when opening popup
                    setPopupInfo({ ...info, valueChainId: item.valueChainId, valueChainName: item.valueChainName });
                  }}
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
        {/* ...existing code... */}
      </div>
      <CapabilityPopupModal
        popupInfo={popupInfo}
        isExpanded={isExpanded}
        showAssessment={showAssessment}
        setPopupInfo={setPopupInfo}
        setIsExpanded={setIsExpanded}
        setShowAssessment={setShowAssessment}
        userFlow={userFlow}
        entryId={entryId} // Pass entryId for completeness
      />
    </div>
  );
}

export default BusinessCapabilities;
