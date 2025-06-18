import React from 'react';
import BusinessCapabilities from './BusinessCapabilities';

function StrategicInitiativePage({ valueChain, businessType, label }) {
  // Pass the correct businessType and name to BusinessCapabilities
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      {/* Left column (30%) */}
      <div style={{ width: '30%', minWidth: 280, background: '#f7f8fa', display: 'flex', flexDirection: 'column', borderRight: '1px solid #e3e8f0', height: '100vh' }}>
        {/* Header row for Strategy AI Agent */}
        <div style={{ fontWeight: 700, fontSize: 20, padding: '48px 0 24px 0', marginTop: 50, textAlign: 'center', borderBottom: '1px solid #e3e8f0', background: '#f7f8fa' }}>
          Strategy AI Agent
        </div>
        {/* Spacer to push search bar to bottom */}
        <div style={{ flex: 1 }} />
        {/* Search bar row aligned to bottom */}
        <div style={{ padding: 24, alignSelf: 'stretch' }}>
          <input
            type="text"
            placeholder="Search..."
            style={{ width: '90%', padding: 10, fontSize: 16, borderRadius: 6, border: '1px solid #b6c2d6' }}
          />
        </div>
      </div>
      {/* Right column (70%) */}
      <div style={{ width: '70%', padding: 32, overflowY: 'auto' }}>
        {/* Header row for Business Capabilities */}
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>
            Building Blocks (Business) Capabilities – {businessType}
          </span>
        </div>
        {/* Add extra margin to ensure toggle button is visible */}
        <div style={{ marginTop: 8 }}>
          <BusinessCapabilities
            businessType={businessType}
            userFlow={{ name: valueChain, businessType, label: 'Value chain' }}
            filterMaturityOnly={false}
          />
        </div>
      </div>
    </div>
  );
}

export default StrategicInitiativePage;
