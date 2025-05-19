import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import './App.css';
import { mutuallyExclusiveHeaders } from './config';

function ValueChain({ selected, frames, headers, onBack }) {
  const [vcName, setVcName] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  // Find selected Business Type value
  let businessType = '';
  Object.keys(selected).forEach(key => {
    if (selected[key]) {
      const [frameIdx, btnIdx] = key.split('-').map(Number);
      if (headers[frameIdx] && headers[frameIdx].trim().toLowerCase() === 'business type') {
        businessType = frames[frameIdx]?.[btnIdx] || '';
      }
    }
  });

  React.useEffect(() => {
    if (!businessType) {
      setVcName([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    fetch('/VC_Capability_Master.xlsx')
      .then(res => res.arrayBuffer())
      .then(data => {
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets['Value Chain Master'];
        if (!sheet) {
          setError('Value Chain Master sheet not found.');
          setLoading(false);
          return;
        }
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        // Find columns
        const headerRow = json[0] || [];
        // Log the actual header row for debugging
        console.log('Value Chain Master header row:', headerRow);
        const valueChainCol = headerRow.findIndex(h => h && h.toString().trim().toLowerCase() === 'value chain');
        const nameCol = headerRow.findIndex(h => h && h.toString().trim().toLowerCase() === 'name');
        // Fix typo: 'Decription' instead of 'Description'
        const descCol = headerRow.findIndex(h => h && h.toString().trim().toLowerCase() === 'description');
        if (valueChainCol === -1 || nameCol === -1 || descCol === -1) {
          setError('Required columns not found in Value Chain Master. Columns found: ' + JSON.stringify(headerRow));
          setLoading(false);
          return;
        }
        // Find all rows where Value chain matches businessType
        const found = [];
        for (let i = 1; i < json.length; i++) {
          if (json[i][valueChainCol] && json[i][valueChainCol].toString().trim() === businessType) {
            found.push({
              name: json[i][nameCol] || '',
              description: json[i][descCol] || ''
            });
          }
        }
        console.log('Matching rows count:', found.length, 'Rows:', found);
        setVcName(found);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load Value Chain Master sheet.');
        setLoading(false);
      });
  }, [businessType]);

  return (
    <div className="container">
      <header style={{ textAlign: 'right', width: '100%', boxSizing: 'border-box', marginBottom: 0 }}>
        <h1>Value Chain Intelligence</h1>
        <h2>Powered by Beyond Axis</h2>
      </header>
      <div className="top-frame">
        {`Value Chain${businessType ? ' - ' + businessType : ''}`}
      </div>
      <button className="lets-go-btn" onClick={onBack}>Back</button>
      {/* Display frames in a single horizontal row */}
      <div className="frames horizontal-scroll" style={{ marginBottom: 24, paddingLeft: 0, marginLeft: 0, justifyContent: 'flex-start' }}>
        {Array.isArray(vcName) && vcName.length > 0 &&
          vcName.map((item, idx) => (
            <div key={idx} className="frame horizontal-frame" style={{ marginLeft: idx === 0 ? 0 : undefined }}>
              <div style={{ fontWeight: 700, fontSize: '1.2em', marginBottom: 8, color: '#111' }}>{item.name}</div>
              <div style={{ fontSize: '0.98em', color: '#444', marginTop: 12 }}>{item.description}</div>
              {/* Star rating selection */}
              <StarRating maxStars={4} />
            </div>
          ))
        }
      </div>
      {/* Star rating definitions (no header, now in columns, no background) */}
      <div style={{
        margin: '32px auto 0',
        maxWidth: 900,
        borderRadius: 8,
        padding: '0',
        fontSize: '1em',
        color: '#222',
        boxShadow: 'none'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div>{[0,1,2,3].map(i => (
              <span key={i} style={{ fontWeight: 700, color: i < 1 ? '#fbbf24' : '#e5e7eb', fontSize: '1.4em' }}>★</span>
            ))}</div>
            <div style={{ marginTop: 8 }}>Foundational</div>
          </div>
          <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div>{[0,1,2,3].map(i => (
              <span key={i} style={{ fontWeight: 700, color: i < 2 ? '#fbbf24' : '#e5e7eb', fontSize: '1.4em' }}>★</span>
            ))}</div>
            <div style={{ marginTop: 8 }}>Functional Excellence</div>
          </div>
          <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div>{[0,1,2,3].map(i => (
              <span key={i} style={{ fontWeight: 700, color: i < 3 ? '#fbbf24' : '#e5e7eb', fontSize: '1.4em' }}>★</span>
            ))}</div>
            <div style={{ marginTop: 8 }}>Integrated Value Chain</div>
          </div>
          <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div>{[0,1,2,3].map(i => (
              <span key={i} style={{ fontWeight: 700, color: i < 4 ? '#fbbf24' : '#e5e7eb', fontSize: '1.4em' }}>★</span>
            ))}</div>
            <div style={{ marginTop: 8 }}>Ecosystem-Driven</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [frames, setFrames] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState({}); // { 'frameIdx-btnIdx': true }
  const [showValueChain, setShowValueChain] = useState(false);

  useEffect(() => {
    fetch('/VC_Capability_Master.xlsx')
      .then((res) => res.arrayBuffer())
      .then((data) => {
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets['Homepage'];
        if (!sheet) {
          setError('Homepage sheet not found.');
          return;
        }
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const columns = json[0]?.length || 0;
        const headers = json[0] || [];
        const framesArr = [];
        for (let col = 0; col < columns; col++) {
          const frame = [];
          for (let row = 1; row < json.length; row++) {
            if (json[row][col]) frame.push(json[row][col]);
          }
          framesArr.push(frame);
        }
        setFrames(framesArr);
        setHeaders(headers);
        setError('');
      })
      .catch(() => setError('Failed to load Excel file.'));
  }, []);

  // Add a console log to verify if handleButtonClick is triggered
  const handleButtonClick = (frameIdx, btnIdx) => {
    console.log('handleButtonClick called', { frameIdx, btnIdx, headers });
    const key = `${frameIdx}-${btnIdx}`;
    // Check if this frame is mutually exclusive using config
    const isMutuallyExclusive = mutuallyExclusiveHeaders.some(header =>
      headers[frameIdx] && headers[frameIdx].trim().toLowerCase() === header.trim().toLowerCase()
    );
    console.log('isMutuallyExclusive:', isMutuallyExclusive, 'frameIdx:', frameIdx, 'header at idx:', headers[frameIdx]);
    if (isMutuallyExclusive) {
      console.log('Inside mutually exclusive frame logic');
      setSelected((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach(k => {
          if (k.startsWith(`${frameIdx}-`)) {
            delete updated[k];
          }
        });
        if (!prev[key]) {
          updated[key] = true;
        }
        return updated;
      });
    } else {
      setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  if (showValueChain) {
    return <ValueChain selected={selected} frames={frames} headers={headers} onBack={() => setShowValueChain(false)} />;
  }

  return (
    <div className="container">
      <header>
        <h1>Value Chain Intelligence</h1>
        <h2>Powered by Beyond Axis</h2>
      </header>
      <div className="top-frame">
        Let’s build your future ready value chain!
      </div>
      {error && <div style={{ color: 'red', margin: '20px 0' }}>{error}</div>}
      <div className="frames">
        {/* First column: frames 0 and 1 */}
        <div className="column">
          {frames.slice(0, 2).map((frame, frameIdx) => (
            <div className="frame" key={frameIdx}>
              <h3>{headers[frameIdx] || ''}</h3>
              {frame.map((val, btnIdx) => {
                const key = `${frameIdx}-${btnIdx}`;
                const isSelected = selected[key];
                return (
                  <button
                    key={btnIdx}
                    className={`frame-btn${isSelected ? ' selected' : ''}`}
                    onClick={() => handleButtonClick(frameIdx, btnIdx)}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        {/* Second column: frames 2 and 3 */}
        <div className="column">
          {frames.slice(2, 4).map((frame, idx) => {
            const frameIdx = idx + 2;
            return (
              <div className="frame" key={frameIdx}>
                <h3>{headers[frameIdx] || ''}</h3>
                {frame.map((val, btnIdx) => {
                  const key = `${frameIdx}-${btnIdx}`;
                  const isSelected = selected[key];
                  return (
                    <button
                      key={btnIdx}
                      className={`frame-btn${isSelected ? ' selected' : ''}`}
                      onClick={() => handleButtonClick(frameIdx, btnIdx)}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
        {/* Third column: frame 4 */}
        <div className="column">
          {frames.slice(4, 5).map((frame, idx) => {
            const frameIdx = idx + 4;
            return (
              <div className="frame" key={frameIdx}>
                <h3>{headers[frameIdx] || ''}</h3>
                {frame.map((val, btnIdx) => {
                  const key = `${frameIdx}-${btnIdx}`;
                  const isSelected = selected[key];
                  return (
                    <button
                      key={btnIdx}
                      className={`frame-btn${isSelected ? ' selected' : ''}`}
                      onClick={() => handleButtonClick(frameIdx, btnIdx)}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      <button className="lets-go-btn" onClick={() => setShowValueChain(true)}>Let's GO !</button>
    </div>
  );
}

// Add StarRating component at the bottom of the file
function StarRating({ maxStars = 4 }) {
  const [rating, setRating] = React.useState(0);
  return (
    <div style={{ marginTop: 16, display: 'flex', gap: 4, justifyContent: 'center' }}>
      {Array.from({ length: maxStars }).map((_, i) => (
        <span
          key={i}
          style={{
            cursor: 'pointer',
            fontSize: '1.5em',
            color: i < rating ? '#fbbf24' : '#e5e7eb',
            transition: 'color 0.2s',
            userSelect: 'none',
          }}
          onClick={() => setRating(i + 1)}
          onMouseEnter={() => setRating(i + 1)}
          onMouseLeave={() => setRating(rating)}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default App;
