import React, { useState, useEffect } from 'react';
import InlineInfoIcon from './InlineInfoIcon';
import ExpandedCapabilityView from './ExpandedCapabilityView';
import CapabilityMaturityAssessment from './CapabilityMaturityAssessment';
import { persistCapability, getCapabilitiesByEntryId } from '../utils/api';
import { getValueChainsByEntryId, getCapabilitiesByValueChainId } from '../utils/api.valuechains';
import CapabilityButton from './CapabilityButton';
import FrameSection from './FrameSection';
import CapabilityPopupModal from './CapabilityPopupModal';
import { useValueChainData } from '../utils/useValueChainData';

// Remove filterMaturityOnly from props, use local state
function BusinessCapabilities({ businessType, onNext, userFlow, onBack, showCheckboxInFilteredView, onCapabilitySelect, selectedCapabilities, entryId, valueChainId, valueChainIds = [], valueChainNames = [], wizardStep, setWizardStep }) {
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
  const [filterMaturityOnly, setFilterMaturityOnly] = useState(false);

  // Move normalizeName to top-level so it can be used everywhere
  function normalizeName(name) {
    return name
      ? name.toString().trim().toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ')
      : '';
  }

  // Load capability maturity from MongoDB by entryId
  useEffect(() => {
    if (!entryId) return;
    getCapabilitiesByEntryId(entryId)
      .then(caps => {
        const capMaturity = {};
        caps.forEach(cap => {
          const vcKey = normalizeName(cap.valueChainName || '');
          const capKey = normalizeName(cap.name || '');
          if (cap.maturityLevel) capMaturity[`${vcKey}||${capKey}`] = cap.maturityLevel;
          if (cap.businessMaturity) capMaturity[`${vcKey}||${capKey}|business`] = cap.businessMaturity;
          if (cap.technologyMaturity) capMaturity[`${vcKey}||${capKey}|technology`] = cap.technologyMaturity;
        });
        setCapabilityMaturity(capMaturity);
      })
      .catch(() => setCapabilityMaturity({}));
  }, [entryId, popupInfo, userFlow]);

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
            const payload = {
              valueChainId: currentValueChainId,
              valueChainName: currentValueChainName,
              entryId: entryId,
              entryName: userFlow.name,
              name: cap.name,
              valueChainEntryId: entryId,
              valueChainEntryName: userFlow.name
            };
            persistCapability(payload)
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
    // Only include capabilities with a maturity level set (Low, Medium, High)
    const filtered = {};
    Object.entries(capabilitiesByFrame).forEach(([frame, caps]) => {
      filtered[frame] = caps.filter(cap => {
        const vcKey = normalizeName(frame.toString());
        const capKey = normalizeName(cap.name.toString());
        const maturity = capabilityMaturity[`${vcKey}||${capKey}`];
        return maturity === 'Low' || maturity === 'Medium' || maturity === 'High';
      });
    });
    return filtered;
  }, [capabilitiesByFrame, capabilityMaturity, filterMaturityOnly]);

  // Show back button if filterMaturityOnly is true
  const showBackButton = !!filterMaturityOnly;

  // Ensure each frame has valueChainId, valueChainName, valueChainEntryId, and valueChainEntryName
  const framesWithIds = frames.map((frame, idx) => ({
    ...frame,
    valueChainId: frame.valueChainId || frame._id || effectiveValueChainIds[idx] || effectiveValueChainIds[0],
    valueChainName: frame.valueChainName || effectiveValueChainNames[idx] || effectiveValueChainNames[0],
    valueChainEntryId: entryId, // Always pass entryId from props
    valueChainEntryName: userFlow.name // Always pass entryName from userFlow
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
        <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '32px 0 0 0', position: 'fixed', bottom: 32, right: 32, zIndex: 200 }}>
          {filterMaturityOnly && (
            <button
              style={{
                padding: '12px 32px',
                fontSize: '1.1em',
                fontWeight: 600,
                borderRadius: 8,
                background: '#2b5cb8',
                color: '#fff',
                border: 'none',
                boxShadow: '0 2px 8px rgba(43,92,184,0.12)',
                cursor: 'pointer',
                marginRight: 24
              }}
              onClick={() => { setFilterMaturityOnly(false); setWizardStep && setWizardStep(2); }}
            >
              Back
            </button>
          )}
          <button
            style={{
              padding: '12px 32px',
              fontSize: '1.1em',
              fontWeight: 600,
              borderRadius: 8,
              background: '#2b5cb8',
              color: '#fff',
              border: 'none',
              boxShadow: '0 2px 8px rgba(43,92,184,0.12)',
              cursor: 'pointer'
            }}
            onClick={() => { setFilterMaturityOnly(true); setWizardStep && setWizardStep(3); }}
            disabled={filterMaturityOnly}
          >
            Next
          </button>
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
        entryId={entryId} // Pass entryId for completeness
        // Remove onSaveSuccess since refreshMaturityData is gone
      />
    </div>
  );
}

export default BusinessCapabilities;
