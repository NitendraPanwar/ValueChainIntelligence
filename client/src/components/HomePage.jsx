import React, { useState, useEffect } from 'react';
import InlineInfoIcon from './InlineInfoIcon';
import { saveSubmission, getSubmissions, fetchAllStrategicInitiatives } from '../utils/api';
import { getHomepageIndustriesFromMongo, getHomepageBusinessComplexityFromMongo } from '../utils/mongoApi';
import { getAllValueChainEntries } from '../utils/api.valuechainentries';
import { useNavigate } from 'react-router-dom';

function HomePage({ onOk }) {
  const [showAdd, setShowAdd] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [selectedBusinessType, setSelectedBusinessType] = useState('');
  const [valueChainName, setValueChainName] = useState('');
  const [currentButtonLabel, setCurrentButtonLabel] = useState('');
  const [existingNames, setExistingNames] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [valueChains, setValueChains] = useState([]); // For Strategic Initiative dropdown
  const [selectedValueChain, setSelectedValueChain] = useState('');
  const [valueChainEntries, setValueChainEntries] = useState([]); // For Strategic Initiative dropdown
  const [selectedValueChainEntry, setSelectedValueChainEntry] = useState('');
  const [businessComplexityOptions, setBusinessComplexityOptions] = useState([]);
  const [valueChainMasterEntries, setValueChainMasterEntries] = useState([]); // For Strategic Initiative dropdown (from MongoDB)
  const [allValueChainEntries, setAllValueChainEntries] = useState([]); // For Value Chain button
  // Info tooltip state
  const [hoverInfo, setHoverInfo] = useState({ show: false, text: '', x: 0, y: 0 });
  // Strategic Initiatives from MongoDB
  const [strategicInitiatives, setStrategicInitiatives] = useState([]);
  // Fetch all Strategic Initiative Entries from MongoDB when Strategic Initiative button is clicked
  useEffect(() => {
    if (showAdd && currentButtonLabel === 'Strategic Initiative') {
      fetchAllStrategicInitiatives().then((entries) => {
        setStrategicInitiatives(entries || []);
      });
    } else {
      setStrategicInitiatives([]);
    }
  }, [showAdd, currentButtonLabel]);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch unique industries from MongoDB Homepage sheet
    getHomepageIndustriesFromMongo().then(types => {
      setBusinessTypes(types);
    });
    // Fetch unique Business Complexity options from MongoDB
    getHomepageBusinessComplexityFromMongo().then(setBusinessComplexityOptions);
  }, []);

  useEffect(() => {
    if (showAdd && currentButtonLabel) {
      getSubmissions().then(subs => {
        setExistingNames(subs.filter(s => s.label === currentButtonLabel));
      });
    } else {
      setExistingNames([]);
    }
  }, [showAdd, currentButtonLabel]);

  // Fetch value chain entries for Strategic Initiative from the same endpoint as ReadDataPage
  useEffect(() => {
    if (showPopup && currentButtonLabel === 'Strategic Initiative') {
      getAllValueChainEntries().then(entries => {
        setValueChainMasterEntries(entries);
      });
    }
  }, [showPopup, currentButtonLabel]);

  useEffect(() => {
    // Fetch all value chain entries when 'Value chain' button is clicked
    if (showAdd && currentButtonLabel === 'Value chain') {
      getAllValueChainEntries().then(entries => {
        setAllValueChainEntries(entries);
      });
    }
  }, [showAdd, currentButtonLabel]);

  const showLoadDataButton = import.meta.env.VITE_LOAD_MONGO_DB === 'true' || import.meta.env.VITE_LOAD_MONGO_DB === true;

  return (
    <div className="container">
      {showLoadDataButton && (
        <button
          style={{ position: 'fixed', top: 16, left: 16, zIndex: 2000, padding: '8px 18px', fontSize: '1em', fontWeight: 600, borderRadius: 6, border: '1px solid #b6c2d6', background: '#f5f8fa', color: '#222', cursor: 'pointer' }}
          onClick={() => navigate('/load-data')}
        >
          Load Data
        </button>
      )}
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
        <h1 style={{ display: 'inline', margin: 0, fontSize: '2em', verticalAlign: 'middle' }}>Boardroom Operating System</h1>
        <div style={{ marginTop: 4 }}>
          <img src="/images/Logo.png" alt="Logo" style={{ height: 36, marginRight: 8, verticalAlign: 'middle' }} />
          <span style={{ fontSize: '1.1em', fontWeight: 400, verticalAlign: 'middle' }}>Powered by Beyond Axis</span>
        </div>
      </div>
      <div style={{ height: 90 }} />
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 24 }}>
        {[{
          label: 'Value chain',
          info: 'A value chain is a systematic framework that maps all activities involved in creating and delivering a product or services.'
        }, {
          label: 'Strategic Initiative',
          info: 'This button will allow you to manage strategic initiatives. (Example description)'
        }, {
          label: 'Management Score Card',
          info: 'This button will show your management score card. (Example description)'
        }, {
          label: 'Strategic Office',
          info: 'This button will help you manage your strategic office. (Example description)'
        }].map((btn, idx) => (
          <div key={idx} style={{ position: 'relative', width: 240, height: 200 }}>
            <button
              className="frame-btn"
              style={{ width: '100%', height: '100%' }}
              onClick={() => { setShowAdd(true); setCurrentButtonLabel(btn.label); }}
            >
              <span style={{ fontSize: 28, fontWeight: 600, display: 'block', marginBottom: 8 }}>
                {btn.label}
              </span>
              <span style={{ position: 'absolute', right: 16, top: 12, fontSize: 22, color: '#fff', fontWeight: 700, pointerEvents: 'none', userSelect: 'none' }}>
                &rarr;
              </span>
              <span style={{ position: 'absolute', right: 2, bottom: -6 }}>
                <InlineInfoIcon
                  onMouseEnter={e => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoverInfo({ show: true, text: btn.info, x: rect.right, y: rect.bottom });
                  }}
                  onMouseLeave={() => setHoverInfo({ show: false, text: '', x: 0, y: 0 })}
                  style={{ fontSize: 18 }}
                />
              </span>
            </button>
          </div>
        ))}
      </div>
      {hoverInfo.show && (
        <div
          style={{
            position: 'fixed',
            left: hoverInfo.x + 8,
            top: hoverInfo.y - 40,
            background: '#fff',
            color: '#222',
            border: '1px solid #b6c2d6',
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.13)',
            padding: '12px 18px',
            fontSize: '1em',
            zIndex: 2000,
            minWidth: 220,
            maxWidth: 320,
            pointerEvents: 'none',
            whiteSpace: 'normal',
          }}
        >
          {hoverInfo.text}
        </div>
      )}
      {showAdd && (() => {
        // Map for sublabels
        const subLabelMap = {
          'Value chain': 'New Value Chain',
          'Strategic Initiative': 'New Strategic Initiative',
          'Management Score Card': 'New Management Score Card',
          'Strategic Office': 'New Strategic Office'
        };
        // Always render Add button first, then entry buttons
        let allButtons = [
          <button
            key="add"
            className="frame-btn"
            style={{ width: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setShowPopup(true)}
          >
            Add
            <span style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
              ({subLabelMap[currentButtonLabel] || 'New Entry'})
            </span>
          </button>
        ];
        // Show Strategic Initiative Entries from MongoDB if Strategic Initiative button is clicked
        if (currentButtonLabel === 'Strategic Initiative' && strategicInitiatives.length > 0) {
          allButtons = allButtons.concat(
            strategicInitiatives.map((entry, idx) => {
              // Always fetch by name to avoid stale/wrong data
              return (
                <button
                  key={entry._id || idx}
                  className="frame-btn"
                  style={{ width: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                  onClick={async () => {
                    setSelectedEntry(null);
                    let details = entry;
                    const queryName = entry.InitiativeName || entry.initiativeName || '';
                    console.log('Fetching initiative by name:', queryName);
                    try {
                      const res = await fetch(`/api/initiative/by-name?initiativeName=${encodeURIComponent(queryName)}`);
                      if (res.ok) {
                        details = await res.json();
                        console.log('Fetched initiative details:', details);
                      } else {
                        console.log('Failed to fetch initiative details, status:', res.status);
                      }
                    } catch (e) {
                      console.error('Error fetching initiative details:', e);
                    }
                    // Store in localStorage for TransformationDashboard
                    localStorage.setItem('initiativeName', details.initiativeName || details.InitiativeName || '');
                    localStorage.setItem('initiativeOwner', details.initiativeOwner || details.InitiativeOwner || '');
                    localStorage.setItem('initiativeScope', details.initiativeScope || details.InitiativeScope || '');
                    localStorage.setItem('initiativeFunction', details.initiativeFunction || details.InitiativeFunction || details.Function || '');
                    localStorage.setItem('valueChainEntryName', details.valueChainEntryName || details.ValueChainEntryName || '');
                    localStorage.setItem('valueChainEntryId', details.valueChainEntryId || details.ValueChainEntryID || '');

                    // Save full initiativeDetails object (including selectedSuggestions/capabilities if present)
                    let selectedSuggestions = [];
                    if (Array.isArray(details.selectedSuggestions)) {
                      selectedSuggestions = details.selectedSuggestions;
                    } else if (Array.isArray(details.selectedCapabilities)) {
                      selectedSuggestions = details.selectedCapabilities;
                    } else if (Array.isArray(details.capabilities)) {
                      selectedSuggestions = details.capabilities;
                    }
                    const initiativeDetailsObj = {
                      initiativeName: details.initiativeName || details.InitiativeName || '',
                      initiativeOwner: details.initiativeOwner || details.InitiativeOwner || '',
                      initiativeScope: details.initiativeScope || details.InitiativeScope || '',
                      initiativeFunction: details.initiativeFunction || details.InitiativeFunction || details.Function || '',
                      valueChainEntryName: details.valueChainEntryName || details.ValueChainEntryName || '',
                      valueChainEntryId: details.valueChainEntryId || details.ValueChainEntryID || '',
                      selectedSuggestions
                    };
                    localStorage.setItem('initiativeDetails', JSON.stringify(initiativeDetailsObj));
                    // For backward compatibility, also set selectedCapabilities
                    localStorage.setItem('selectedCapabilities', JSON.stringify(selectedSuggestions));

                    // Navigate to TransformationDashboard
                    navigate('/transformation-dashboard');
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{entry.InitiativeName}</span>
                  <span style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
                    ({entry.ValueChainEntryName || entry.Function || ''})
                  </span>
                </button>
              );
            })
          );
        } else {
          // Fallback to existingNames for other labels
          allButtons = allButtons.concat(
            existingNames.map((entry, idx) => (
              <button key={idx} className="frame-btn" style={{ width: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => {
                  setSelectedEntry(null);
                  onOk(entry.businessType, entry.valueChainEntryName, entry.label, true);
                }}>
                <span>{entry.valueChainEntryName}</span>
                <span style={{ fontSize: 14, color: '#666', marginTop: 4 }}>({entry.businessType})</span>
              </button>
            ))
          );
        }
        // Show all ValueChainEntries as buttons when 'Value chain' is clicked
        if (currentButtonLabel === 'Value chain') {
          allButtons = allButtons.concat(
            allValueChainEntries.filter(e => e.name).map((entry, idx) => (
              <button
                key={entry._id || idx}
                className="frame-btn"
                style={{ width: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => {
                  setSelectedEntry(null);
                  onOk(entry.businessType, entry.name, 'Value chain', true, entry._id);
                }}
              >
                <span>{entry.name}</span>
                <span style={{ fontSize: 14, color: '#666', marginTop: 4 }}>({entry.businessType})</span>
              </button>
            ))
          );
        }
// --- API utility to fetch all Strategic Initiative Entries ---
// Add this to client/src/utils/api.js:
// export async function fetchAllStrategicInitiatives() {
//   const res = await fetch('/api/initiative/all');
//   if (!res.ok) return [];
//   return res.json();
// }
        // Pad with empty columns if fewer than 4
        while (allButtons.length < 4) {
          allButtons.push(<div key={`spacer-${allButtons.length}`} style={{ width: 240 }} />);
        }
        // Chunk into rows of 4
        const rows = [];
        for (let i = 0; i < allButtons.length; i += 4) {
          rows.push(
            <div key={i} style={{ display: 'flex', justifyContent: 'center', flexWrap: 'nowrap', gap: 16, marginBottom: 24 }}>
              {allButtons.slice(i, i + 4)}
            </div>
          );
        }
        return rows;
      })()}
      {selectedEntry && (
        <pre style={{ background: '#f4f4f4', padding: 16, borderRadius: 8, maxWidth: 600, margin: '0 auto', fontSize: 16 }}>
          {JSON.stringify(selectedEntry, null, 2)}
        </pre>
      )}
      {showPopup && (
        <div className="modal-overlay">
          <div className="modal-content">
            {currentButtonLabel === 'Strategic Initiative' ? (
              <>
                <h2>Select Value Chain Entry</h2>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                  <label style={{ minWidth: 140, textAlign: 'right', marginRight: 12 }}>Value Chain:&nbsp;</label>
                  <select value={selectedValueChainEntry} onChange={e => setSelectedValueChainEntry(e.target.value)} style={{ flex: 1 }}>
                    <option value="">Select...</option>
                    {valueChainMasterEntries.map((entry, idx) => {
                      // Use entry.name if available, fallback to valueChainEntryName or _id
                      const displayName = entry.name || entry.valueChainEntryName || entry._id || '';
                      if (!displayName) return null;
                      return (
                        <option key={entry._id || idx} value={displayName}>
                          {displayName}{entry.description ? ` - ${entry.description}` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <button
                    className="frame-btn"
                    onClick={() => {
                      const entry = valueChainMasterEntries.find(e => {
                        // Match by name, valueChainEntryName, or _id
                        return (
                          e.name === selectedValueChainEntry ||
                          e.valueChainEntryName === selectedValueChainEntry ||
                          e._id === selectedValueChainEntry
                        );
                      });
                      setShowPopup(false);
                      setShowAdd(false);
                      if (entry) {
                        // Pass entry details to onOk for navigation
                        onOk(entry.businessType || '', entry.name || entry.valueChainEntryName || '', 'Strategic Initiative', true, entry._id);
                      }
                    }}
                    disabled={!selectedValueChainEntry}
                  >
                    OK
                  </button>
                  <button className="frame-btn" onClick={() => setShowPopup(false)}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <h2>Add Value Chain</h2>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                  <label style={{ minWidth: 140, textAlign: 'right', marginRight: 12 }}>Value Chain Name:&nbsp;</label>
                  <input type="text" value={valueChainName} onChange={e => {
                    setValueChainName(e.target.value);
                    localStorage.setItem('valueChainName', e.target.value);
                  }} style={{ flex: 1 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                  <label style={{ minWidth: 140, textAlign: 'right', marginRight: 12 }}>Industry:&nbsp;</label>
                  <select value={selectedBusinessType} onChange={e => setSelectedBusinessType(e.target.value)} style={{ flex: 1 }}>
                    <option value="">Select...</option>
                    {businessTypes.map((type, idx) => (
                      <option key={idx} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <button
                    className="frame-btn"
                    onClick={async () => {
                      // await saveSubmission({ name: valueChainName, businessType: selectedBusinessType, label: currentButtonLabel });
                      setShowPopup(false);
                      setShowAdd(false);
                      onOk(selectedBusinessType, valueChainName, currentButtonLabel);
                    }}
                  >
                    OK
                  </button>
                  <button className="frame-btn" onClick={() => setShowPopup(false)}>Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
