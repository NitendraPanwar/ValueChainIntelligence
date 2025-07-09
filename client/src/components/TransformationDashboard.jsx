import React from 'react';

function TransformationDashboard() {
  // Always fetch initiative details from backend using initiativeName from localStorage
  const [selectedCapabilities, setSelectedCapabilities] = React.useState([]);
  const [initiativeDetails, setInitiativeDetails] = React.useState(null);
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
        {initiativeDetails && (
          <div style={{ marginBottom: 24, background: '#f7f8fa', borderRadius: 10, padding: 18, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Initiative: {initiativeDetails.initiativeName || initiativeDetails.InitiativeName}</div>
            <div style={{ color: '#555', fontSize: 15 }}>Owner: {initiativeDetails.initiativeOwner || initiativeDetails.InitiativeOwner}</div>
            <div style={{ color: '#555', fontSize: 15 }}>Scope: {initiativeDetails.initiativeScope || initiativeDetails.InitiativeScope}</div>
            <div style={{ color: '#555', fontSize: 15 }}>Function: {initiativeDetails.initiativeFunction || initiativeDetails.InitiativeFunction || initiativeDetails.Function}</div>
            <div style={{ color: '#555', fontSize: 15 }}>Value Chain Entry: {initiativeDetails.valueChainEntryName || initiativeDetails.ValueChainEntryName}</div>
            <div style={{ color: '#555', fontSize: 15 }}>Value Chain Entry ID: {initiativeDetails.valueChainEntryId || initiativeDetails.ValueChainEntryID}</div>
          </div>
        )}
        <p>Your selected capabilities:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          {selectedCapabilities.length === 0 ? (
            <div style={{ color: '#888', fontSize: 18 }}>No capabilities selected.</div>
          ) : (
            selectedCapabilities.map((cap, idx) => (
              <div key={idx} style={{
                background: '#f7f8fa',
                borderRadius: 10,
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                padding: 24,
                minWidth: 220,
                maxWidth: 320,
                flex: '1 0 220px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10
              }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{cap.capabilityName || cap.name}</div>
                <div style={{ color: '#555', fontSize: 15 }}>Frame: {cap.frameName || cap.frame}</div>
                {cap.suggestion && (
                  <div style={{ color: '#555', fontSize: 15 }}>Suggestion: {cap.suggestion}</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default TransformationDashboard;
