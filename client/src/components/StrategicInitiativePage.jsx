import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { stragtegicfocus } from '../config';
import BusinessCapabilities from './BusinessCapabilities';


function StrategicInitiativePage({ valueChain, businessType, label, entryId, userFlow, valueChainIds = [], valueChainNames = [] }) {
  const navigate = useNavigate();
  // Use state instead of ref for selected capabilities to force re-render
  const [selectedCapabilities, setSelectedCapabilities] = React.useState([]);
  // If userFlow is not passed, fallback to constructing it from props
  const effectiveUserFlow = userFlow || { name: valueChain, businessType, label };
  // ...existing code...
  // entryId, valueChainIds, valueChainNames should be passed from parent (App)
  return (
    <div style={{ padding: 32 }}>
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '100%',
          zIndex: 100,
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          padding: '16px 0 8px 0',
          textAlign: 'right',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '2em' }}>Value Chain Intelligence</h1>
        <h2 style={{ margin: 0, fontSize: '1.1em', fontWeight: 400 }}>
          Powered by Beyond Axis
        </h2>
      </div>
      <div style={{ height: 90 }} />
      <div style={{ display: 'flex', flexDirection: 'row', gap: 32, minHeight: 400 }}>
        {/* Left Frame (25%) split into two rows */}
        <div style={{ flex: '0 0 25%', maxWidth: '25%', background: '#f7f7fa', borderRadius: 12, padding: 24, minHeight: 400, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ flex: 1, background: 'transparent', borderBottom: '1px solid #e5e7eb', paddingBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: '1.15em', color: '#111', marginBottom: 10, textAlign: 'center' }}>Strategy AI Agent</div>
            <div style={{
              background: '#fff',
              borderRadius: 10,
              padding: '16px 12px',
              marginBottom: 10,
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              height: '92%', // Leave some space between Strategic Focus and Search
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start'
            }}>
              <div style={{ marginBottom: 10, fontWeight: 600 }}>Strategic Focus</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
                {stragtegicfocus.map((focus, idx) => (
                  <button
                    key={idx}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 6,
                      border: '1px solid #2563eb',
                      background: '#fff',
                      color: '#2563eb',
                      fontWeight: 500,
                      fontSize: '1em',
                      cursor: 'pointer',
                      marginBottom: 0,
                      width: '100%'
                    }}
                  >
                    {focus}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ flex: 1, background: 'transparent', paddingTop: 12, display: 'flex', alignItems: 'stretch' }}>
            <div style={{
              width: '100%',
              background: '#fff',
              borderRadius: 10,
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              padding: '18px 0 12px 0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              flex: 1,
              minHeight: 0,
              boxSizing: 'border-box',
              alignItems: 'center',
              height: '100%'
            }}>
              <input
                type="text"
                placeholder="Search..."
                style={{
                  width: '92%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid #b6c2d6',
                  fontSize: '1em',
                  background: '#fff',
                  marginTop: 0,
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
        </div>
        {/* Right Frame (75%) */}
        <div style={{ flex: '1 1 75%', maxWidth: '75%', background: '#fff', borderRadius: 12, padding: 24, minHeight: 400, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          {/* Load BusinessCapabilities here, passing value chain entry info */}
          <BusinessCapabilities
            businessType={businessType}
            userFlow={effectiveUserFlow}
            entryId={entryId}
            valueChainIds={valueChainIds}
            valueChainNames={valueChainNames}
            filterMaturityOnly={false}
            // showCheckboxInFilteredView will be managed internally
            onCapabilitySelect={(cap, checked, frameName) => {
              setSelectedCapabilities(prev => {
                if (checked) {
                  // Add if not already present
                  if (!prev.some(c => c.name === cap.name && c.frame === frameName)) {
                    return [...prev, { ...cap, frame: frameName }];
                  }
                  return prev;
                } else {
                  // Remove if present
                  return prev.filter(c => !(c.name === cap.name && c.frame === frameName));
                }
              });
            }}
            selectedCapabilities={selectedCapabilities}
            onNext={() => {
              // Only trigger on filtered view's Next
              // Pass valueChainEntryName and valueChainEntryId for saving initiative
              navigate('/strategic-initiative/selected-capabilities', {
                state: {
                  selectedCapabilities,
                  businessType,
                  valueChainEntryName: userFlow?.name || '',
                  valueChainEntryId: entryId || ''
                }
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default StrategicInitiativePage;
