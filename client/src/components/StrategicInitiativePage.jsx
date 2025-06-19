import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BusinessCapabilities from './BusinessCapabilities';
import { stragtegicfocus } from '../config';
import { fetchAIChatResponse } from '../utils/aiChatApi';

function StrategicInitiativePage({ valueChain, businessType, label }) {
  const [search, setSearch] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterMaturityOnly, setFilterMaturityOnly] = useState(false);
  const [selectedCapabilities, setSelectedCapabilities] = useState([]); // [{frame, name}]
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    if (e.key === 'Enter' && search.trim()) {
      setLoading(true);
      setError('');
      setAiResponse('');
      try {
        const resp = await fetchAIChatResponse(search);
        setAiResponse(resp);
      } catch (err) {
        setError('AI service error.');
      } finally {
        setLoading(false);
      }
    }
  };

  function cleanAIResponse(text) {
    return text
      .replace(/\[INST\]/g, '')
      .replace(/\[ASS\]/g, '')
      .replace(/\[\/INST\]/g, '')
      .replace(/\[\/ASS\]/g, '')
      .trim();
  }

  // Handlers for BusinessCapabilities next/back
  const handleNext = (capabilitiesList) => {
    if (filterMaturityOnly) {
      // On filtered view, go to new page with selected capabilities
      navigate('/strategic-initiative/selected-capabilities', { state: { selectedCapabilities, businessType, valueChainEntryName: valueChain } });
    } else {
      setFilterMaturityOnly(true);
    }
  };
  const handleBack = () => setFilterMaturityOnly(false);

  // Handler to update selected capabilities from BusinessCapabilities
  const handleCapabilitySelect = (cap, checked, frame) => {
    setSelectedCapabilities(prev => {
      if (checked) {
        // Add if not already present
        if (!prev.some(c => c.name === cap.name && c.frame === frame)) {
          return [...prev, { name: cap.name, frame }];
        }
        return prev;
      } else {
        // Remove
        return prev.filter(c => !(c.name === cap.name && c.frame === frame));
      }
    });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      {/* Left column (30%) */}
      <div style={{ width: '30%', minWidth: 280, background: '#f7f8fa', display: 'flex', flexDirection: 'column', borderRight: '1px solid #e3e8f0', height: '100vh', position: 'relative' }}>
        {/* Header row for Strategy AI Agent */}
        <div style={{ fontWeight: 700, fontSize: 20, padding: '36px 0 6px 0', marginTop: 50, textAlign: 'center', borderBottom: '1px solid #e3e8f0', background: '#f7f8fa' }}>
          Strategy AI Agent
        </div>
        {/* Strategic Focus buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '6px 24px 6px 24px' }}>
          {stragtegicfocus.map((label, idx) => (
            <button
              key={idx}
              style={{
                padding: '4px 12px',
                borderRadius: 8,
                border: '1px solid #b6c2d6',
                background: '#fff',
                color: '#2b5cb8',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
              }}
            >
              {label}
            </button>
          ))}
        </div>
        {/* AI Response area (scrollable, above search bar) */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 24px' }}>
          {aiResponse && !loading && (
            <div style={{
              background: '#fff',
              borderRadius: 8,
              padding: 12,
              fontSize: 15,
              color: '#222',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              maxHeight: 180,
              overflowY: 'auto',
              minHeight: 40,
              whiteSpace: 'pre-line',
              marginBottom: 16
            }}>
              {cleanAIResponse(aiResponse)}
            </div>
          )}
        </div>
        {/* Search bar row fixed at the bottom */}
        <div style={{ padding: 24, alignSelf: 'stretch', position: 'sticky', bottom: 0, background: '#f7f8fa', zIndex: 2 }}>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            style={{ width: '90%', padding: 10, fontSize: 16, borderRadius: 6, border: '1px solid #b6c2d6' }}
          />
          {loading && <div style={{ fontSize: 13, color: '#888', marginTop: 8 }}>Thinking...</div>}
          {error && <div style={{ color: 'red', fontSize: 13, marginTop: 8 }}>{error}</div>}
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
            filterMaturityOnly={filterMaturityOnly}
            onNext={handleNext}
            onBack={handleBack}
            showCheckboxInFilteredView={filterMaturityOnly}
            onCapabilitySelect={handleCapabilitySelect}
            selectedCapabilities={selectedCapabilities}
          />
        </div>
      </div>
    </div>
  );
}

export default StrategicInitiativePage;
