import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

function HomePage({ onOk }) {
  const [showAdd, setShowAdd] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [selectedBusinessType, setSelectedBusinessType] = useState('');
  const [valueChainName, setValueChainName] = useState('');

  useEffect(() => {
    fetch('/VC_Capability_Master.xlsx')
      .then(res => res.arrayBuffer())
      .then(data => {
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets['Homepage'];
        if (!sheet) return;
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const headerRow = json[0] || [];
        const businessTypeCol = headerRow.findIndex(h => h && h.toString().trim().toLowerCase() === 'business type');
        if (businessTypeCol === -1) return;
        const types = [];
        for (let i = 1; i < json.length; i++) {
          const val = json[i][businessTypeCol];
          if (val && !types.includes(val)) types.push(val);
        }
        setBusinessTypes(types);
      });
  }, []);

  return (
    <div className="container" style={{ marginTop: 120 }}>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 24 }}>
        <button className="frame-btn" onClick={() => setShowAdd(true)}>Value chain</button>
        <button className="frame-btn" disabled>Strategic Initiative</button>
        <button className="frame-btn" disabled>Management Score Card</button>
        <button className="frame-btn" disabled>Strategic Office</button>
      </div>
      {showAdd && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <button className="frame-btn" onClick={() => setShowPopup(true)}>Add</button>
        </div>
      )}
      {showPopup && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add Value Chain</h2>
            <div style={{ marginBottom: 16 }}>
              <label>Business Type:&nbsp;</label>
              <select value={selectedBusinessType} onChange={e => setSelectedBusinessType(e.target.value)}>
                <option value="">Select...</option>
                {businessTypes.map((type, idx) => (
                  <option key={idx} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>Value Chain Name:&nbsp;</label>
              <input type="text" value={valueChainName} onChange={e => setValueChainName(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="frame-btn" onClick={() => { setShowPopup(false); setShowAdd(false); onOk(selectedBusinessType); }}>OK</button>
              <button className="frame-btn" onClick={() => setShowPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
