import React, { useState } from 'react';
import { capabilityStatus } from '../config';

function TransformationDashboard() {
  // Always fetch initiative details from backend using initiativeName from localStorage
  const [selectedCapabilities, setSelectedCapabilities] = useState([]);
  const [initiativeDetails, setInitiativeDetails] = useState(null);
  const [flippedIdx, setFlippedIdx] = useState(null); // which card is flipped
  const [editFields, setEditFields] = useState({}); // { idx: { contactPerson, status } }
  const [savingIdx, setSavingIdx] = useState(null);
  React.useEffect(() => {
    const initiativeName = localStorage.getItem('initiativeName') || '';
    if (!initiativeName) return;
    async function fetchInitiative() {
      try {
        const res = await fetch(`/api/initiative/by-name?initiativeName=${encodeURIComponent(initiativeName)}`);
        if (res.ok) {
          const details = await res.json();
          setInitiativeDetails(details);
          // Try all possible capability fields
          let selectedSuggestions = [];
          if (Array.isArray(details.selectedSuggestions)) {
            selectedSuggestions = details.selectedSuggestions;
          } else if (Array.isArray(details.selectedCapabilities)) {
            selectedSuggestions = details.selectedCapabilities;
          } else if (Array.isArray(details.capabilities)) {
            selectedSuggestions = details.capabilities;
          }
          setSelectedCapabilities(selectedSuggestions);
          console.log('[TransformationDashboard] Loaded initiative details from backend:', details);
          console.log('[TransformationDashboard] Capabilities to display:', selectedSuggestions);
        } else {
          setInitiativeDetails(null);
          setSelectedCapabilities([]);
        }
      } catch (err) {
        setInitiativeDetails(null);
        setSelectedCapabilities([]);
        console.error('[TransformationDashboard] Error fetching initiative details:', err);
      }
    }
    fetchInitiative();
  }, []);

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
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: 32,
        minHeight: 400,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        marginTop: 24
      }}>
        <h2>Transformation Dashboard</h2>
        {/* Initiative details removed as requested */}
        <p>Your selected capabilities:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          {selectedCapabilities.length === 0 ? (
            <div style={{ color: '#888', fontSize: 18 }}>No capabilities selected.</div>
          ) : (
            selectedCapabilities.map((cap, idx) => {
              const isFlipped = flippedIdx === idx;
              const contactPerson = (editFields[idx]?.contactPerson) ?? cap.contactPerson ?? '';
              const status = (editFields[idx]?.status) ?? cap.status ?? '';
              return (
                <div
                  key={idx}
                  style={{
                    perspective: 1000,
                    minWidth: 220,
                    maxWidth: 320,
                    flex: '1 0 220px',
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: 220,
                      transition: 'transform 0.6s',
                      transformStyle: 'preserve-3d',
                      transform: isFlipped ? 'rotateY(180deg)' : 'none',
                    }}
                  >
                    {/* Front Side */}
                    <div
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        background: '#f7f8fa',
                        borderRadius: 10,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                        padding: 24,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        cursor: 'pointer',
                      }}
                      onClick={() => setFlippedIdx(idx)}
                    >
                      <div style={{ fontWeight: 700, fontSize: 18 }}>{cap.capabilityName || cap.name}</div>
                      {(cap.frameName || cap.frame) && (
                        <div style={{ color: '#555', fontSize: 15 }}>
                          ({cap.frameName || cap.frame})
                        </div>
                      )}
                      {cap.suggestion && (
                        <div style={{ color: '#555', fontSize: 15 }}>{cap.suggestion}</div>
                      )}
                      {((cap.contactPerson && cap.contactPerson !== '') || (editFields[idx]?.contactPerson && editFields[idx].contactPerson !== '')) && (
                        <div style={{ color: '#2b5cb8', fontSize: 14, marginTop: 6 }}>
                          Contact: {cap.contactPerson || editFields[idx]?.contactPerson}
                        </div>
                      )}
                      {((cap.status && cap.status !== '') || (editFields[idx]?.status && editFields[idx].status !== '')) && (
                        <div style={{ color: '#2b5cb8', fontSize: 14 }}>
                          Status: {cap.status || editFields[idx]?.status}
                        </div>
                      )}
                      <div style={{ color: '#888', fontSize: 13, marginTop: 8 }}>
                        Click to edit contact & status
                      </div>
                    </div>
                    {/* Back Side */}
                    <div
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        background: '#eaf1fb',
                        borderRadius: 10,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
                        padding: 24,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        transform: 'rotateY(180deg)',
                      }}
                    >
                      <label style={{ fontWeight: 600, fontSize: 15 }}>Contact Person:
                        <input
                          type="text"
                          value={contactPerson}
                          onChange={e => setEditFields(f => ({ ...f, [idx]: { ...f[idx], contactPerson: e.target.value } }))}
                          style={{ marginLeft: 8, padding: 6, borderRadius: 6, border: '1px solid #b6c2d6', fontSize: 15 }}
                        />
                      </label>
                      <label style={{ fontWeight: 600, fontSize: 15 }}>Status:
                        <select
                          value={status}
                          onChange={e => setEditFields(f => ({ ...f, [idx]: { ...f[idx], status: e.target.value } }))}
                          style={{ marginLeft: 8, padding: 6, borderRadius: 6, border: '1px solid #b6c2d6', fontSize: 15 }}
                        >
                          <option value="">Select...</option>
                          {capabilityStatus.map((s, i) => (
                            <option key={i} value={s}>{s}</option>
                          ))}
                        </select>
                      </label>
                      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                        <button
                          style={{ padding: '6px 18px', borderRadius: 6, background: '#2b5cb8', color: '#fff', fontWeight: 600, border: 'none', fontSize: 15, cursor: 'pointer' }}
                          disabled={savingIdx === idx}
                          onClick={async () => {
                            setSavingIdx(idx);
                            // Save to backend
                            try {
                              const initiativeName = initiativeDetails.initiativeName || initiativeDetails.InitiativeName;
                              const capabilityName = cap.capabilityName || cap.name;
                              const payload = {
                                initiativeName,
                                capabilityName,
                                contactPerson,
                                status
                              };
                              const res = await fetch('/api/initiative/capability/update', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(payload)
                              });
                              if (res.ok) {
                                // Optionally update local state
                                setSelectedCapabilities(prev => prev.map((c, i) => i === idx ? { ...c, contactPerson, status } : c));
                                setFlippedIdx(null);
                              } else {
                                alert('Failed to save.');
                              }
                            } catch (e) {
                              alert('Error saving.');
                            } finally {
                              setSavingIdx(null);
                            }
                          }}
                        >Save</button>
                        <button
                          style={{ padding: '6px 18px', borderRadius: 6, background: '#e3e8f0', color: '#333', fontWeight: 600, border: 'none', fontSize: 15, cursor: 'pointer' }}
                          onClick={() => setFlippedIdx(null)}
                        >Cancel</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default TransformationDashboard;
