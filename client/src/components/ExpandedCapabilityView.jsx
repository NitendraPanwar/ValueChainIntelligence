import React from 'react';

const cardStyle = {
  background: '#f7f8fa',
  border: '1px solid #b6c2d6',
  borderRadius: 10,
  padding: '18px 16px',
  minWidth: 180,
  minHeight: 120,
  margin: 8,
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
};

const ExpandedCapabilityView = ({ description, onAssess }) => (
  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
    {/* Top Frame/Row 1: Description in a card */}
    <div style={{ ...cardStyle, minHeight: 60, margin: '8px 8px 24px 8px', width: 'calc(100% - 16px)', maxWidth: 'none', flex: 'unset', alignItems: 'flex-start', justifyContent: 'center', fontWeight: 500, fontSize: '1.1em', borderRadius: 10 }}>
      {description}
    </div>
    {/* Row 2: 3 Cards */}
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 16, marginBottom: 32 }}>
      <div style={cardStyle}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Value Impact</div>
        <div style={{ color: '#555' }}>[Value Impact content here]</div>
      </div>
      <div style={cardStyle}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Operational</div>
        <div style={{ color: '#555' }}>[Operational content here]</div>
      </div>
      <div style={cardStyle}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Technology</div>
        <div style={{ color: '#555' }}>[Technology content here]</div>
      </div>
    </div>
    {/* Bottom right button */}
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <button
        style={{
          background: '#4caf50',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '10px 28px',
          fontWeight: 600,
          fontSize: 16,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}
        onClick={onAssess}
      >
        ASSESS
      </button>
    </div>
  </div>
);

export default ExpandedCapabilityView;
