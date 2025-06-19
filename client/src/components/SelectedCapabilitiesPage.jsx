import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getBuyBuildData } from '../utils/buyBuildData';
import { initiativescope, initiativefunction } from '../config';
import { saveInitiative } from '../utils/api';

function SelectedCapabilitiesPage() {
  const location = useLocation();
  const selectedCapabilities = location.state?.selectedCapabilities || [];
  const businessType = location.state?.businessType || '';
  const [buyBuildInfo, setBuyBuildInfo] = useState([]); // [{ description, suggestions }]
  const [showPopup, setShowPopup] = useState(false);
  const [initiativeName, setInitiativeName] = useState('');
  const [initiativeOwner, setInitiativeOwner] = useState('');
  const [initiativeScope, setInitiativeScope] = useState(initiativescope[0] || '');
  const [initiativeFunction, setInitiativeFunction] = useState(initiativefunction[0] || '');
  const [saveStatus, setSaveStatus] = useState('');

  // Track selected suggestions for each capability
  const [selectedSuggestions, setSelectedSuggestions] = useState({}); // { [capName]: [suggestion, ...] }

  useEffect(() => {
    async function fetchAll() {
      const results = await Promise.all(
        selectedCapabilities.map(cap => getBuyBuildData(cap.name, businessType))
      );
      setBuyBuildInfo(results);
    }
    if (selectedCapabilities.length > 0 && businessType) fetchAll();
  }, [selectedCapabilities, businessType]);

  // Handler for toggling suggestion checkbox
  const handleSuggestionToggle = (capName, suggestion) => {
    setSelectedSuggestions(prev => {
      const prevList = prev[capName] || [];
      if (prevList.includes(suggestion)) {
        return { ...prev, [capName]: prevList.filter(s => s !== suggestion) };
      } else {
        return { ...prev, [capName]: [...prevList, suggestion] };
      }
    });
  };

  async function handleSaveInitiative() {
    setSaveStatus('');
    // Build array of { capabilityName, frameName, suggestion } for all checked suggestions
    const selectedSuggestionsArray = [];
    selectedCapabilities.forEach(cap => {
      (selectedSuggestions[cap.name] || []).forEach(suggestion => {
        selectedSuggestionsArray.push({
          capabilityName: cap.name,
          frameName: cap.frame,
          suggestion
        });
      });
    });
    const payload = {
      initiativeName,
      initiativeOwner,
      initiativeScope,
      initiativeFunction,
      valueChainEntryName: location.state?.valueChainEntryName || '',
      label: 'Strategic Initiative',
      selectedSuggestions: selectedSuggestionsArray
    };
    try {
      const res = await saveInitiative(payload);
      if (res.success) {
        setSaveStatus('Saved!');
        setTimeout(() => {
          setShowPopup(false);
          setSaveStatus('');
        }, 1200);
      } else {
        setSaveStatus('Error saving.');
      }
    } catch (e) {
      setSaveStatus('Error saving.');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: '100vh', width: '100vw', background: '#f7f8fa' }}>
      {selectedCapabilities.length === 0 ? (
        <div style={{ margin: 'auto', fontSize: 22, color: '#888' }}>No capabilities selected.</div>
      ) : (
        selectedCapabilities.map((cap, idx) => (
          <div key={idx} style={{ flex: 1, margin: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <h2 style={{ fontSize: 20, marginBottom: 12 }}>{cap.name}</h2>
            <div style={{ color: '#555', fontSize: 16, marginBottom: 12 }}>Frame: {cap.frame}</div>
            {/* Buy/Build Section */}
            <div style={{ border: '1px solid #e3e8f0', borderRadius: 8, padding: 12, background: '#f7f8fa' }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Buy/Build?</div>
              <div style={{ color: '#333', fontSize: 15, minHeight: 40 }}>
                {buyBuildInfo[idx]?.description || <span style={{ color: '#aaa' }}>No data found.</span>}
              </div>
            </div>
            {/* Suggestions Section */}
            <div style={{ border: '1px solid #e3e8f0', borderRadius: 8, padding: 12, background: '#f7f8fa' }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Suggestions</div>
              <div style={{ color: '#333', fontSize: 15, minHeight: 40 }}>
                {buyBuildInfo[idx]?.suggestions ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {buyBuildInfo[idx].suggestions.split('\n').filter(Boolean).map((suggestion, sIdx) => (
                      <label key={sIdx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                          type="checkbox"
                          style={{ accentColor: '#2b5cb8' }}
                          checked={selectedSuggestions[cap.name]?.includes(suggestion) || false}
                          onChange={() => handleSuggestionToggle(cap.name, suggestion)}
                        />
                        {suggestion}
                      </label>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: '#aaa' }}>No suggestions found.</span>
                )}
              </div>
            </div>
          </div>
        ))
      )}
      {/* Popup for Initiative Details */}
      {showPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 340, boxShadow: '0 4px 24px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <h2 style={{ margin: 0, fontSize: 22 }}>Initiative Details</h2>
            <label style={{ fontWeight: 600 }}>Initiative Name:
              <input type="text" value={initiativeName} onChange={e => setInitiativeName(e.target.value)} style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 6, border: '1px solid #b6c2d6', fontSize: 16 }} />
            </label>
            <label style={{ fontWeight: 600 }}>Initiative Owner:
              <input type="text" value={initiativeOwner} onChange={e => setInitiativeOwner(e.target.value)} style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 6, border: '1px solid #b6c2d6', fontSize: 16 }} />
            </label>
            <label style={{ fontWeight: 600 }}>Initiative Scope:
              <select value={initiativeScope} onChange={e => setInitiativeScope(e.target.value)} style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 6, border: '1px solid #b6c2d6', fontSize: 16 }}>
                {initiativescope.map(scope => (
                  <option key={scope} value={scope}>{scope}</option>
                ))}
              </select>
            </label>
            <label style={{ fontWeight: 600 }}>Function:
              <select value={initiativeFunction} onChange={e => setInitiativeFunction(e.target.value)} style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 6, border: '1px solid #b6c2d6', fontSize: 16 }}>
                {initiativefunction.map(func => (
                  <option key={func} value={func}>{func}</option>
                ))}
              </select>
            </label>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
              <button onClick={() => setShowPopup(false)} style={{ padding: '8px 18px', borderRadius: 8, background: '#e3e8f0', color: '#333', fontWeight: 600, border: 'none', fontSize: 16, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveInitiative} style={{ padding: '8px 18px', borderRadius: 8, background: '#2b5cb8', color: '#fff', fontWeight: 600, border: 'none', fontSize: 16, cursor: 'pointer' }}>Save</button>
            </div>
            {saveStatus && <div style={{ color: saveStatus === 'Saved!' ? 'green' : 'red', marginTop: 8 }}>{saveStatus}</div>}
          </div>
        </div>
      )}
      <button
        style={{
          position: 'fixed',
          bottom: 32,
          right: 40,
          padding: '12px 32px',
          borderRadius: 8,
          background: '#2b5cb8',
          color: '#fff',
          fontWeight: 700,
          border: 'none',
          fontSize: 18,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.10)'
        }}
        onClick={() => setShowPopup(true)}
      >
        {`Let's Go`}
      </button>
    </div>
  );
}

export default SelectedCapabilitiesPage;
