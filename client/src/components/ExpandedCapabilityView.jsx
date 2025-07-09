import React, { useEffect, useState } from 'react';
import { getCapabilityDetailsFromMongo } from '../utils/mongoApi';

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

const ExpandedCapabilityView = ({ valueChainName, capabilityName, description, onAssess }) => {
  const [mongoDescription, setMongoDescription] = useState(description);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    getCapabilityDetailsFromMongo(valueChainName, capabilityName).then(details => {
      if (details) {
        setDetails(details);
        if (details.Description) setMongoDescription(details.Description);
      }
    });
  }, [valueChainName, capabilityName]);

  // Helper to display comma-separated values as new lines
  const renderMultiline = val => (val || '').split(',').map((v, i) => <div key={i}>{v.trim()}</div>);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', position: 'relative' }}>
      {/* Top left: Value Chain name and Capability name */}
      <div style={{ fontWeight: 700, fontSize: '1.1em', margin: '0 0 8px 4px', color: '#2b5cb8' }}>
        {valueChainName} : {capabilityName}
      </div>
      {/* Top Frame/Row 1: Description in a card */}
      <div style={{
        ...cardStyle,
        minHeight: 60,
        margin: '8px 8px 24px 8px',
        width: 'calc(100% - 16px)',
        maxWidth: 'none',
        flex: 'unset',
        alignItems: 'flex-start',
        justifyContent: 'center',
        fontWeight: 500,
        fontSize: '1.1em',
        borderRadius: 10,
        whiteSpace: 'pre-line',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        height: 'auto',
        maxHeight: 'none',
      }}>
        {mongoDescription}
      </div>
      {/* Row 2: 3 Cards */}
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 16, marginBottom: 32 }}>
        <div style={cardStyle}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Value Impact</div>
          <div style={{ color: '#555', textAlign: 'left', width: '100%' }}>
            <div><b>Lever:</b> {details ? renderMultiline(details['Value Impact Card-Lever']) : ''}</div>
            <div><b>Objective:</b> {details ? details['Value Impact Card-Objective'] : ''}</div>
            <div><b>Input:</b> {details ? details['Value Impact Card-Input'] : ''}</div>
            <div><b>Process:</b> {details ? details['Value Impact Card-Process'] : ''}</div>
            <div><b>Output:</b> {details ? details['Value Impact Card-Output'] : ''}</div>
            <div><b>Result:</b> {details ? details['Value Impact Card-Expected Result'] : ''}</div>
            <div><b>KPIs:</b> {details ? renderMultiline(details['Value Impact Card-KPI(s) to Measure Business Value']) : ''}</div>
          </div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Operational</div>
          <div style={{ color: '#555', textAlign: 'left', width: '100%' }}>
            <div><b>Lever:</b> {details ? (details['Operational Card-Lever'] || '') : ''}</div>
            <div><b>Objective:</b> {details ? (details['Operational Card-Objective'] || '') : ''}</div>
            <div><b>Input:</b> {details ? (details['Operational Card-Input'] || '') : ''}</div>
            <div><b>Process:</b> {details ? (details['Operational Card-Process'] || '') : ''}</div>
            <div><b>Output:</b> {details ? (details['Operational Card-Output'] || '') : ''}</div>
            <div><b>Result:</b> {details ? (details['Operational Card-Expected Result'] || '') : ''}</div>
          </div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Technology</div>
          <div style={{ color: '#555', textAlign: 'left', width: '100%' }}>
            <div><b>Lever:</b> {details ? (details['Technology Card-Lever'] || '') : ''}</div>
            <div><b>Objective:</b> {details ? (details['Technology Card-Objective'] || '') : ''}</div>
            <div><b>Input:</b> {details ? (details['Technology Card-Input'] || '') : ''}</div>
            <div><b>Process:</b> {details ? (details['Technology Card-Process'] || '') : ''}</div>
            <div><b>Output:</b> {details ? (details['Technology Card-Output'] || '') : ''}</div>
            <div><b>Result:</b> {details ? (details['Technology Card-Expected Result'] || '') : ''}</div>
          </div>
        </div>
      </div>
      {/* Bottom right button - now floating inside popup */}
      <div style={{
        position: 'absolute',
        bottom: 32,
        right: 48,
        zIndex: 5000,
        display: 'flex',
        justifyContent: 'flex-end',
        width: 'auto',
        pointerEvents: 'auto'
      }}>
        <button
          style={{
            background: '#4caf50',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '12px 32px',
            fontWeight: 600,
            fontSize: 18,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            minWidth: 120
          }}
          onClick={onAssess}
        >
          ASSESS
        </button>
      </div>
    </div>
  );
};

export default ExpandedCapabilityView;
