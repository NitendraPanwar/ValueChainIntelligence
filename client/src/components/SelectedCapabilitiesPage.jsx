import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getBuyBuildData } from '../utils/buyBuildData';
import { initiativescope, initiativefunction } from '../config';
import { saveInitiative, fetchInitiativeByName } from '../utils/api';

function SelectedCapabilitiesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedCapabilities = location.state?.selectedCapabilities || [];
  const businessType = location.state?.businessType || '';
  const [buyBuildInfo, setBuyBuildInfo] = useState([]); // [{ description, suggestions }]
  const [showPopup, setShowPopup] = useState(false);
  const [initiativeName, setInitiativeName] = useState('');
  const [initiativeOwner, setInitiativeOwner] = useState('');
  const [initiativeScope, setInitiativeScope] = useState(initiativescope[0] || '');
  const [initiativeFunction, setInitiativeFunction] = useState(initiativefunction[0] || '');
  const [saveStatus, setSaveStatus] = useState('');
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateInitiativeName, setDuplicateInitiativeName] = useState('');

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

  async function fetchCapabilitiesForInitiative(initiativeName) {
    try {
      const data = await fetchInitiativeByName(initiativeName);
      // Store initiative details and selected capabilities for dashboard
      localStorage.setItem('initiativeDetails', JSON.stringify({
        initiativeName: data.initiativeName,
        initiativeOwner: data.initiativeOwner,
        initiativeScope: data.initiativeScope,
        initiativeFunction: data.initiativeFunction,
        valueChainEntryName: data.valueChainEntryName,
        valueChainEntryId: data.valueChainEntryId
      }));
      // Convert selectedSuggestions to capability cards (if needed)
      // Here, we just store the selectedSuggestions array
      localStorage.setItem('selectedCapabilities', JSON.stringify(data.selectedSuggestions || []));
      navigate('/transformation-dashboard');
    } catch (e) {
      // fallback: clear and redirect
      localStorage.setItem('selectedCapabilities', JSON.stringify([]));
      localStorage.setItem('initiativeDetails', JSON.stringify({ initiativeName }));
      navigate('/transformation-dashboard');
    }
  }

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
    const valueChainEntryName = location.state?.valueChainEntryName || '';
    const valueChainEntryId = location.state?.valueChainEntryId || location.state?.entryId || '';
    const payload = {
      initiativeName,
      initiativeOwner,
      initiativeScope,
      initiativeFunction,
      valueChainEntryName,
      valueChainEntryId,
      label: 'Strategic Initiative',
      selectedSuggestions: selectedSuggestionsArray
    };
    try {
      const res = await saveInitiative(payload);
      if (res.success) {
        setSaveStatus('Saved!');
        // After saving, fetch the latest initiative from backend before navigating
        const latest = await fetchInitiativeByName(initiativeName);
        // Store selectedCapabilities and initiative details in localStorage for dashboard (optional, for legacy)
        localStorage.setItem('selectedCapabilities', JSON.stringify(latest.selectedSuggestions || []));
        localStorage.setItem('initiativeDetails', JSON.stringify({
          initiativeName: latest.initiativeName,
          initiativeOwner: latest.initiativeOwner,
          initiativeScope: latest.initiativeScope,
          initiativeFunction: latest.initiativeFunction,
          valueChainEntryName: latest.valueChainEntryName,
          valueChainEntryId: latest.valueChainEntryId
        }));
        setTimeout(() => {
          setShowPopup(false);
          setSaveStatus('');
          navigate('/transformation-dashboard');
        }, 500);
      } else if (res.error && res.error.includes('already exists')) {
        setDuplicateInitiativeName(initiativeName);
        setShowDuplicateDialog(true);
      } else {
        setSaveStatus('Error saving.');
      }
    } catch (e) {
      if (e && e.error && e.error.includes('already exists')) {
        setDuplicateInitiativeName(initiativeName);
        setShowDuplicateDialog(true);
      } else {
        setSaveStatus('Error saving.');
      }
    }
  }

  // Log for debugging: show what is being rendered for each capability
  // useEffect(() => {
  //   console.log('Rendering SelectedCapabilitiesPage with:', { selectedCapabilities, businessType, buyBuildInfo });
  // }, [selectedCapabilities, businessType, buyBuildInfo]);

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
                <div><b>Recommendation:</b> {buyBuildInfo[idx]?.buy || <span style={{ color: '#aaa' }}>No data found.</span>}</div>
                <div style={{ marginTop: 6 }}><b>Description:</b> {buyBuildInfo[idx]?.description || <span style={{ color: '#aaa' }}>No data found.</span>}</div>
              </div>
            </div>
            {/* Suggestions Section */}
            <div style={{ border: '1px solid #e3e8f0', borderRadius: 8, padding: 12, background: '#f7f8fa' }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Suggestions</div>
              <div style={{ color: '#333', fontSize: 15, minHeight: 40 }}>
                {buyBuildInfo[idx]?.suggestions ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {buyBuildInfo[idx].suggestions.split(',').map(s => s.trim()).filter(Boolean).map((suggestion, sIdx) => (
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
      {/* Duplicate Initiative Dialog */}
      {showDuplicateDialog && (
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
          zIndex: 2000
        }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 340, boxShadow: '0 4px 24px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <h2 style={{ margin: 0, fontSize: 20, color: 'red' }}>Strategic Initiative Exists</h2>
            <div style={{ fontSize: 16 }}>A Strategic Initiative with the name "{duplicateInitiativeName}" already exists. Do you want to continue and view the dashboard for this initiative?</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
              <button onClick={() => setShowDuplicateDialog(false)} style={{ padding: '8px 18px', borderRadius: 8, background: '#e3e8f0', color: '#333', fontWeight: 600, border: 'none', fontSize: 16, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => {
                setShowDuplicateDialog(false);
                // Store initiative details for dashboard on duplicate as well
                localStorage.setItem('initiativeDetails', JSON.stringify({
                  initiativeName: duplicateInitiativeName,
                  initiativeOwner,
                  initiativeScope,
                  initiativeFunction,
                  valueChainEntryName,
                  valueChainEntryId
                }));
                fetchCapabilitiesForInitiative(duplicateInitiativeName);
              }} style={{ padding: '8px 18px', borderRadius: 8, background: '#2b5cb8', color: '#fff', fontWeight: 600, border: 'none', fontSize: 16, cursor: 'pointer' }}>Continue</button>
            </div>
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
