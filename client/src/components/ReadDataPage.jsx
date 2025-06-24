import React, { useState } from 'react';
import { getAllValueChainEntries, getCapabilitiesByValueChainId, getAllCapabilities } from '../utils/api';
import { getValueChainsByEntryId } from '../utils/api.valuechains';
import { getValueChainEntryById } from '../utils/api.valuechainentries';
import { getValueChainById } from '../utils/api.valuechains.mongo';
import { getAllValueChainsRaw, deleteAllValueChains } from '../utils/api.valuechains.raw';
import { deleteAllCapabilities } from '../utils/api.capabilities.raw';

function ReadDataPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [valueChains, setValueChains] = useState([]);
  const [valueChainsLoading, setValueChainsLoading] = useState(false);
  const [valueChainsError, setValueChainsError] = useState('');
  const [expandedValueChainIdx, setExpandedValueChainIdx] = useState(null);
  const [capabilities, setCapabilities] = useState([]);
  const [capabilitiesLoading, setCapabilitiesLoading] = useState(false);
  const [capabilitiesError, setCapabilitiesError] = useState('');
  const [allCapabilities, setAllCapabilities] = useState([]);
  const [allCapabilitiesLoading, setAllCapabilitiesLoading] = useState(false);
  const [allCapabilitiesError, setAllCapabilitiesError] = useState('');
  const [rawEntryModal, setRawEntryModal] = useState({ show: false, data: null });
  const [rawValueChainModal, setRawValueChainModal] = useState({ show: false, data: null });
  const [allValueChainsRaw, setAllValueChainsRaw] = useState([]);
  const [allValueChainsRawLoading, setAllValueChainsRawLoading] = useState(false);
  const [allValueChainsRawError, setAllValueChainsRawError] = useState('');

  const handleShowEntries = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllValueChainEntries();
      setEntries(data); // No deduplication, display as received
    } catch (err) {
      setError('Failed to load Value Chain Entries');
    } finally {
      setLoading(false);
    }
  };

  const handleEntryClick = async (entry, idx) => {
    if (expandedIdx === idx) {
      setExpandedIdx(null);
      setValueChains([]);
      setValueChainsError('');
      return;
    }
    setExpandedIdx(idx);
    setValueChainsLoading(true);
    setValueChainsError('');
    try {
      const vcs = await getValueChainsByEntryId(entry._id);
      setValueChains(vcs);
    } catch (err) {
      setValueChainsError('Failed to load value chains');
      setValueChains([]);
    } finally {
      setValueChainsLoading(false);
    }
  };

  const handleValueChainClick = async (valueChain, idx) => {
    if (expandedValueChainIdx === idx) {
      setExpandedValueChainIdx(null);
      setCapabilities([]);
      setCapabilitiesError('');
      return;
    }
    setExpandedValueChainIdx(idx);
    setCapabilitiesLoading(true);
    setCapabilitiesError('');
    try {
      const caps = await getCapabilitiesByValueChainId(valueChain._id);
      setCapabilities(caps);
    } catch (err) {
      setCapabilitiesError('Failed to load capabilities');
      setCapabilities([]);
    } finally {
      setCapabilitiesLoading(false);
    }
  };

  const handleShowAllCapabilities = async () => {
    setAllCapabilitiesLoading(true);
    setAllCapabilitiesError('');
    try {
      const caps = await getAllCapabilities();
      setAllCapabilities(caps);
    } catch (err) {
      setAllCapabilitiesError('Failed to load all capabilities');
      setAllCapabilities([]);
    } finally {
      setAllCapabilitiesLoading(false);
    }
  };

  const handleEntryDoubleClick = async (entry) => {
    try {
      const data = await getValueChainEntryById(entry._id);
      setRawEntryModal({ show: true, data });
    } catch (err) {
      setRawEntryModal({ show: true, data: { error: 'Failed to fetch entry', details: err?.message } });
    }
  };

  const handleValueChainDetailsClick = async (vc) => {
    console.log('[ReadDataPage] ValueChain Details button clicked', { valueChainId: vc._id });
    try {
      const data = await getValueChainById(vc._id);
      console.log('[ReadDataPage] getValueChainById result:', data);
      setRawValueChainModal({ show: true, data });
    } catch (err) {
      console.error('[ReadDataPage] getValueChainById error:', err);
      setRawValueChainModal({ show: true, data: { error: 'Failed to fetch value chain', details: err?.message } });
    }
  };

  const handleShowAllValueChainsRaw = async () => {
    setAllValueChainsRawLoading(true);
    setAllValueChainsRawError('');
    try {
      const data = await getAllValueChainsRaw();
      setAllValueChainsRaw(data);
    } catch (err) {
      setAllValueChainsRawError('Failed to load all value chains');
      setAllValueChainsRaw([]);
    } finally {
      setAllValueChainsRawLoading(false);
    }
  };

  const handleDeleteAllValueChains = async () => {
    if (!window.confirm('Are you sure you want to delete ALL value chains? This cannot be undone.')) return;
    setAllValueChainsRawLoading(true);
    setAllValueChainsRawError('');
    try {
      await deleteAllValueChains();
      setAllValueChainsRaw([]);
      alert('All value chains deleted.');
    } catch (err) {
      setAllValueChainsRawError('Failed to delete all value chains');
    } finally {
      setAllValueChainsRawLoading(false);
    }
  };

  const handleDeleteAllCapabilities = async () => {
    if (!window.confirm('Are you sure you want to delete ALL capabilities? This cannot be undone.')) return;
    setAllCapabilitiesLoading(true);
    setAllCapabilitiesError('');
    try {
      await deleteAllCapabilities();
      setAllCapabilities([]);
      alert('All capabilities deleted.');
    } catch (err) {
      setAllCapabilitiesError('Failed to delete all capabilities');
    } finally {
      setAllCapabilitiesLoading(false);
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <h2>Read Data Page</h2>
      <button
        style={{ padding: '8px 18px', fontWeight: 600, borderRadius: 6, border: '1px solid #722ed1', background: '#722ed1', color: '#fff', cursor: 'pointer', marginRight: 12 }}
        onClick={handleShowEntries}
        disabled={loading}
      >
        Show Value Chain Entries
      </button>
      <button
        style={{ padding: '8px 18px', fontWeight: 600, borderRadius: 6, border: '1px solid #1890ff', background: '#1890ff', color: '#fff', cursor: 'pointer' }}
        onClick={handleShowAllCapabilities}
        disabled={allCapabilitiesLoading}
      >
        Show All Capabilities in MongoDB
      </button>
      <button
        style={{ padding: '8px 18px', fontWeight: 600, borderRadius: 6, border: '1px solid #faad14', background: '#faad14', color: '#fff', cursor: 'pointer', marginRight: 12 }}
        onClick={handleShowAllValueChainsRaw}
        disabled={allValueChainsRawLoading}
      >
        Show All Valuechains (Raw)
      </button>
      <button
        style={{ padding: '8px 18px', fontWeight: 600, borderRadius: 6, border: '1px solid #ff4d4f', background: '#ff4d4f', color: '#fff', cursor: 'pointer' }}
        onClick={handleDeleteAllValueChains}
        disabled={allValueChainsRawLoading}
      >
        Delete All Valuechains
      </button>
      <button
        style={{ padding: '8px 18px', fontWeight: 600, borderRadius: 6, border: '1px solid #ff4d4f', background: '#ff4d4f', color: '#fff', cursor: 'pointer', marginLeft: 12 }}
        onClick={handleDeleteAllCapabilities}
        disabled={allCapabilitiesLoading}
      >
        Delete All Capabilities
      </button>
      {loading && <span style={{ marginLeft: 16 }}>Loading...</span>}
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      {entries.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h3>All Value Chain Entry Names</h3>
          <ul style={{ fontSize: 16, paddingLeft: 18 }}>
            {entries.map((entry, idx) => (
              <li key={entry._id || idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{ color: '#1890ff', textDecoration: 'underline', cursor: 'pointer' }}
                  onClick={() => handleEntryClick(entry, idx)}
                  title="Click to view value chains"
                >
                  {entry.name}
                </span>
                <button
                  style={{ marginLeft: 6, padding: '2px 10px', fontSize: 13, borderRadius: 4, border: '1px solid #aaa', background: '#f6f8fa', color: '#333', cursor: 'pointer' }}
                  onClick={() => handleEntryDoubleClick(entry)}
                  title="Show raw MongoDB data for this entry"
                >
                  Details
                </button>
                {expandedIdx === idx && (
                  <div style={{ marginTop: 8, marginLeft: 12 }}>
                    {valueChainsLoading && <div>Loading value chains...</div>}
                    {valueChainsError && <div style={{ color: 'red' }}>{valueChainsError}</div>}
                    {!valueChainsLoading && !valueChainsError && valueChains.length > 0 && (
                      <ul style={{ fontSize: 15, paddingLeft: 16 }}>
                        {valueChains.map((vc, vidx) => (
                          <li key={vc._id || vidx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span
                              style={{ color: '#52c41a', textDecoration: 'underline', cursor: 'pointer' }}
                              onClick={() => handleValueChainClick(vc, vidx)}
                              title="Click to view capabilities"
                            >
                              {vc.Name || vc.name}
                            </span>
                            <button
                              style={{ marginLeft: 6, padding: '2px 10px', fontSize: 13, borderRadius: 4, border: '1px solid #aaa', background: '#f6f8fa', color: '#333', cursor: 'pointer' }}
                              onClick={() => handleValueChainDetailsClick(vc)}
                              title="Show raw MongoDB data for this value chain"
                            >
                              Details
                            </button>
                            {expandedValueChainIdx === vidx && (
                              <div style={{ marginTop: 6, marginLeft: 10 }}>
                                {capabilitiesLoading && <div>Loading capabilities...</div>}
                                {capabilitiesError && <div style={{ color: 'red' }}>{capabilitiesError}</div>}
                                {!capabilitiesLoading && !capabilitiesError && capabilities.length > 0 && (
                                  <ul style={{ fontSize: 14, paddingLeft: 14 }}>
                                    {capabilities.map((cap, cidx) => (
                                      <li key={cap._id || cidx}>{cap.name}</li>
                                    ))}
                                  </ul>
                                )}
                                {!capabilitiesLoading && !capabilitiesError && capabilities.length === 0 && (
                                  <div style={{ fontSize: 13, color: '#888' }}>No capabilities found for this value chain.</div>
                                )}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                    {!valueChainsLoading && !valueChainsError && valueChains.length === 0 && (
                      <div style={{ fontSize: 14, color: '#888' }}>No value chains found for this entry.</div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {allCapabilitiesLoading && <span style={{ marginLeft: 16 }}>Loading all capabilities...</span>}
      {allCapabilitiesError && <div style={{ color: 'red', marginTop: 8 }}>{allCapabilitiesError}</div>}
      {allCapabilities.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h3>All Capabilities in MongoDB</h3>
          <ul style={{ fontSize: 15, paddingLeft: 18 }}>
            {allCapabilities.map((cap, idx) => (
              <li key={cap._id || idx} style={{ marginBottom: 12 }}>
                <pre style={{ background: '#f6f8fa', borderRadius: 4, padding: 8, fontSize: 13, color: '#333', overflowX: 'auto' }}>
                  {JSON.stringify(cap, null, 2)}
                </pre>
              </li>
            ))}
          </ul>
        </div>
      )}
      {allValueChainsRawLoading && <span style={{ marginLeft: 16 }}>Loading...</span>}
      {allValueChainsRawError && <div style={{ color: 'red', marginTop: 8 }}>{allValueChainsRawError}</div>}
      {allValueChainsRaw.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h3>All Value Chains (Raw from MongoDB)</h3>
          <ul style={{ fontSize: 15, paddingLeft: 18 }}>
            {allValueChainsRaw.map((vc, idx) => (
              <li key={vc._id || idx} style={{ marginBottom: 12 }}>
                <pre style={{ background: '#f6f8fa', borderRadius: 4, padding: 8, fontSize: 13, color: '#333', overflowX: 'auto' }}>
                  {JSON.stringify(vc, null, 2)}
                </pre>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Modal for raw entry data */}
      {rawEntryModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.35)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setRawEntryModal({ show: false, data: null })}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 24, minWidth: 400, maxWidth: 700, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Raw Value Chain Entry Data</h3>
            <pre style={{ background: '#f6f8fa', borderRadius: 4, padding: 12, fontSize: 13, color: '#333', overflowX: 'auto' }}>{JSON.stringify(rawEntryModal.data, null, 2)}</pre>
            <button style={{ marginTop: 16, padding: '6px 18px', borderRadius: 5, background: '#722ed1', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }} onClick={() => setRawEntryModal({ show: false, data: null })}>Close</button>
          </div>
        </div>
      )}
      {/* Modal for raw value chain data */}
      {rawValueChainModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.35)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setRawValueChainModal({ show: false, data: null })}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 24, minWidth: 400, maxWidth: 700, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Raw Value Chain Data</h3>
            <pre style={{ background: '#f6f8fa', borderRadius: 4, padding: 12, fontSize: 13, color: '#333', overflowX: 'auto' }}>{JSON.stringify(rawValueChainModal.data, null, 2)}</pre>
            <button style={{ marginTop: 16, padding: '6px 18px', borderRadius: 5, background: '#722ed1', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }} onClick={() => setRawValueChainModal({ show: false, data: null })}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReadDataPage;
