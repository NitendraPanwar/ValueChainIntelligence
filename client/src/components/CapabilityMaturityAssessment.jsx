import React, { useState, useEffect } from 'react';
import { persistCapability, updateCapabilityMaturity } from '../utils/api';
import { getMaturityLevelsFromMongo, lookupMaturityLevelLabel, getAllMaturityDescriptionsFromMongo } from '../utils/mongoApi';

const cardStyle = {
  background: '#f7f8fa',
  border: '1px solid #b6c2d6',
  borderRadius: 10,
  padding: '18px 16px',
  minWidth: 220,
  minHeight: 120,
  margin: 8,
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
};

const CapabilityMaturityAssessment = ({ valueChainName, capabilityName, valueChainId, capabilityId, user, onSaveSuccess, valueChainEntryId, valueChainEntryName, entryId, entryName }) => {
  const [businessOwner, setBusinessOwner] = useState('');
  const [techOwner, setTechOwner] = useState('');
  const [businessMaturity, setBusinessMaturity] = useState('');
  const [techMaturity, setTechMaturity] = useState('');
  const [status, setStatus] = useState('');
  const [businessMaturityLevels, setBusinessMaturityLevels] = useState([]);
  const [technologyMaturityLevels, setTechnologyMaturityLevels] = useState([]);
  const [mapping, setMapping] = useState([]);
  const [maturityLevel, setMaturityLevel] = useState('');
  const [businessMaturityDescription, setBusinessMaturityDescription] = useState('');
  const [technologyMaturityDescription, setTechnologyMaturityDescription] = useState('');
  const [maturityDescriptions, setMaturityDescriptions] = useState({ business: {}, technology: {} });

  useEffect(() => {
    getMaturityLevelsFromMongo().then(levels => {
      setBusinessMaturityLevels(levels.business);
      setTechnologyMaturityLevels(levels.technology);
      // Use levels.rows for robust lookups (backward compatible: if mapping exists, use it, else fallback to rows)
      setMapping(levels.mapping || levels.rows || []);
    });
    getAllMaturityDescriptionsFromMongo().then(setMaturityDescriptions);
  }, []);

  useEffect(() => {
    const level = lookupMaturityLevelLabel(mapping, businessMaturity, techMaturity);
    setMaturityLevel(level);
  }, [businessMaturity, techMaturity, mapping]);

  useEffect(() => {
    if (businessMaturity && maturityDescriptions.business) {
      setBusinessMaturityDescription(maturityDescriptions.business[businessMaturity] || '');
    } else {
      setBusinessMaturityDescription('');
    }
  }, [businessMaturity, maturityDescriptions]);

  useEffect(() => {
    if (techMaturity && maturityDescriptions.technology) {
      setTechnologyMaturityDescription(maturityDescriptions.technology[techMaturity] || '');
    } else {
      setTechnologyMaturityDescription('');
    }
  }, [techMaturity, maturityDescriptions]);

  const handleSave = async () => {
    if (!valueChainId || !capabilityName) {
      setStatus('Missing valueChainId or capabilityName.');
      return;
    }
    if (!businessMaturity || !techMaturity) {
      setStatus('Please select both maturity levels.');
      return;
    }
    const payload = {
      valueChainId,
      valueChainName,
      valueChainEntryId: valueChainEntryId || entryId || valueChainId,
      valueChainEntryName: valueChainEntryName || entryName || valueChainName,
      entryId: valueChainEntryId || entryId || valueChainId,
      entryName: valueChainEntryName || entryName || valueChainName,
      name: capabilityName,
      businessMaturity,
      technologyMaturity: techMaturity,
      maturityLevel,
      businessOwner,
      techOwner,
    };
    console.log('Persisting maturity assessment with payload:', payload);
    try {
      const res = await updateCapabilityMaturity(payload);
      if (res.ok || res.status === 200 || res.success) {
        setStatus('Saved!');
        if (onSaveSuccess) onSaveSuccess();
      } else {
        setStatus('Save failed.');
      }
    } catch (e) {
      setStatus('Save failed.');
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', padding: 24 }}>
      {/* Top left: Value Chain name and Capability name */}
      <div style={{ fontWeight: 700, fontSize: '1.1em', margin: '0 0 8px 4px', color: '#2b5cb8' }}>
        {valueChainName} : {capabilityName}
      </div>
      {/* Row 1: Heading */}
      <div style={{ fontWeight: 700, fontSize: '1.5em', marginBottom: 24 }}>
        Capability Maturity Assessment
      </div>
      {/* Row 2: Two Cards with dropdowns */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: 16, marginBottom: 32 }}>
        <div style={cardStyle}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Business Maturity</div>
          <select
            value={businessMaturity}
            onChange={e => setBusinessMaturity(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #b6c2d6', fontSize: 16, minWidth: 180 }}
          >
            <option value="">Select...</option>
            {businessMaturityLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
          {businessMaturityDescription && (
            <div style={{ color: '#555', fontSize: 14, marginTop: 4 }}>{businessMaturityDescription}</div>
          )}
        </div>
        <div style={cardStyle}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Technology Maturity</div>
          <select
            value={techMaturity}
            onChange={e => setTechMaturity(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #b6c2d6', fontSize: 16, minWidth: 180 }}
          >
            <option value="">Select...</option>
            {technologyMaturityLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
          {technologyMaturityDescription && (
            <div style={{ color: '#555', fontSize: 14, marginTop: 4 }}>{technologyMaturityDescription}</div>
          )}
        </div>
      </div>
      {/* Row 3: Capability Ownership */}
      <div style={{ marginTop: 16, position: 'relative', minWidth: 480 }}>
        <div style={{
          background: '#f7f8fa',
          border: '1px solid #b6c2d6',
          borderRadius: 10,
          padding: '18px 16px',
          minWidth: 220,
          marginTop: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          <div style={{ fontWeight: 600, fontSize: '1.1em', marginBottom: 8 }}>
            Capability Ownership
          </div>
          <div>
            <label style={{ fontWeight: 500, marginRight: 8 }}>Business:</label>
            <input
              type="text"
              value={businessOwner}
              onChange={e => setBusinessOwner(e.target.value)}
              placeholder="Business Owner"
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #b6c2d6',
                fontSize: 16,
                minWidth: 220
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ fontWeight: 500, marginRight: 8 }}>Technology:</label>
            <input
              type="text"
              value={techOwner}
              onChange={e => setTechOwner(e.target.value)}
              placeholder="Technology Owner"
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #b6c2d6',
                fontSize: 16,
                minWidth: 220
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
            <label style={{ fontWeight: 500, marginRight: 8 }}>Maturity Level:</label>
            <input
              type="text"
              value={maturityLevel}
              readOnly
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #b6c2d6',
                fontSize: 16,
                minWidth: 220,
                background: '#e9ecef',
                color: '#333'
              }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -44 }}>
          <button
            style={{
              padding: '8px 24px',
              background: '#2b5cb8',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              marginLeft: 24,
            }}
            onClick={handleSave}
          >
            Save
          </button>
        </div>
        {status && <div style={{ marginTop: 12, color: status === 'Saved!' ? 'green' : 'red', fontWeight: 500 }}>{status}</div>}
      </div>
    </div>
  );
};

export default CapabilityMaturityAssessment;
