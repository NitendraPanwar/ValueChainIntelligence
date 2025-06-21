import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { pushSheetToMongo, readSheetFromMongo, getValueChainMasterFromMongo, getAllValueChainEntriesFromMongo } from '../utils/mongoApi';
import { saveSheetRelations, loadSheetRelations } from '../utils/sheetRelationsApi';
import SheetGraph from './SheetGraph';

function LoadDataPage() {
  const navigate = useNavigate();
  const [sheetNames, setSheetNames] = useState([]);
  const [sheetData, setSheetData] = useState({});
  const [selectedSheet, setSelectedSheet] = useState('');
  const [error, setError] = useState('');
  const [maxCols, setMaxCols] = useState(0);
  const [visibleCols, setVisibleCols] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [dragCol, setDragCol] = useState(null);
  const [mongoTable, setMongoTable] = useState([]);
  const [mongoError, setMongoError] = useState('');
  const [mongoLoading, setMongoLoading] = useState(false);
  const [sheetKeys, setSheetKeys] = useState({}); // { sheetName: keyColIdx }
  const [sheetRelations, setSheetRelations] = useState([]); // [{ fromSheet, fromColIdx, toSheet, toColIdx }]
  const [fileImported, setFileImported] = useState(false);
  const [allValueChainEntries, setAllValueChainEntries] = useState([]);
  const [vcLoading, setVcLoading] = useState(false);
  const [vcError, setVcError] = useState('');
  const [allUserValueChainEntries, setAllUserValueChainEntries] = useState([]);
  const [userVcLoading, setUserVcLoading] = useState(false);
  const [userVcError, setUserVcError] = useState('');
  const [expandedUserEntryIdx, setExpandedUserEntryIdx] = useState(null);

  const handleImport = (e) => {
    setError('');
    setSheetNames([]);
    setSheetData({});
    setSelectedSheet('');
    setMaxCols(0);
    setVisibleCols([]);
    setSelectedColumns([]);
    setDragCol(null);
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: 'array' });
        setSheetNames(workbook.SheetNames);
        const allData = {};
        let globalMaxCols = 0;
        workbook.SheetNames.forEach((name) => {
          const ws = workbook.Sheets[name];
          let rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
          // Remove empty rows (no data in any column)
          rows = rows.filter(row => Array.isArray(row) && row.some(cell => cell !== undefined && cell !== null && cell.toString().trim() !== ''));
          // Find max columns for this sheet
          const localMax = rows.reduce(
            (max, row) => Math.max(max, row ? row.length : 0),
            0
          );
          if (localMax > globalMaxCols) globalMaxCols = localMax;
          allData[name] = rows;
        });
        setMaxCols(globalMaxCols);
        // Pad all rows in all sheets to globalMaxCols
        Object.keys(allData).forEach((name) => {
          allData[name] = allData[name].map((row) => {
            if (!row) row = [];
            return Array.from(
              { length: globalMaxCols },
              (_, i) => (row[i] !== undefined ? row[i] : '')
            );
          });
        });
        setSheetData(allData);
        // Compute visible columns for each sheet
        const visible = {};
        Object.keys(allData).forEach((name) => {
          const rows = allData[name];
          const cols = Array.from({ length: globalMaxCols }, (_, colIdx) =>
            rows.some(
              (row) =>
                row[colIdx] !== undefined &&
                row[colIdx] !== null &&
                row[colIdx].toString().trim() !== ''
            )
          );
          visible[name] = cols;
        });
        setVisibleCols(visible);
        setFileImported(true);
      } catch (err) {
        setError('Failed to read file.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Drag and drop handlers
  const handleDragStart = (colIdx) => setDragCol(colIdx);
  const handleDrop = (e) => {
    e.preventDefault();
    if (dragCol !== null && !selectedColumns.includes(dragCol)) {
      setSelectedColumns([...selectedColumns, dragCol]);
    }
    setDragCol(null);
  };
  const handleRemoveSelected = (colIdx) => {
    setSelectedColumns(selectedColumns.filter((idx) => idx !== colIdx));
  };

  // MongoDB Push
  const handlePush = async () => {
    setMongoError('');
    setMongoLoading(true);
    try {
      if (!selectedSheet || !sheetData[selectedSheet]) throw new Error('No sheet selected');
      if (!selectedColumns.length) throw new Error('No columns selected');
      // Prepare data for selected columns only, as array of objects
      const allRows = sheetData[selectedSheet];
      const headerRow = allRows[0];
      const filteredRows = allRows.slice(1).map(row => {
        const obj = {};
        selectedColumns.forEach(idx => {
          obj[headerRow[idx] || `Column${idx+1}`] = row[idx];
        });
        return obj;
      });

      await pushSheetToMongo(selectedSheet, filteredRows);
      setMongoError('Push successful!');
    } catch (err) {
      setMongoError(err.message || 'Push failed');
    } finally {
      setMongoLoading(false);
    }
  };

  // MongoDB Read
  const handleRead = async () => {
    setMongoError('');
    setMongoLoading(true);
    try {
      if (!selectedSheet) throw new Error('No sheet selected');
      const result = await readSheetFromMongo(selectedSheet);
      setMongoTable(result.data || []);
      setMongoError('Read successful!');
    } catch (err) {
      setMongoError(err.message || 'Read failed');
      setMongoTable([]);
    } finally {
      setMongoLoading(false);
    }
  };

  // Handler to fetch all value chain entries from MongoDB
  const handleShowAllValueChainEntries = async () => {
    setVcLoading(true);
    setVcError('');
    try {
      const entries = await getValueChainMasterFromMongo();
      setAllValueChainEntries(entries);
    } catch (err) {
      setVcError('Failed to load value chain entries');
      setAllValueChainEntries([]);
    } finally {
      setVcLoading(false);
    }
  };

  // Handler to fetch all user-created value chain entries from MongoDB
  const handleShowAllUserValueChainEntries = async () => {
    setUserVcLoading(true);
    setUserVcError('');
    try {
      const entries = await getAllValueChainEntriesFromMongo();
      setAllUserValueChainEntries(entries);
    } catch (err) {
      setUserVcError('Failed to load user value chain entries');
      setAllUserValueChainEntries([]);
    } finally {
      setUserVcLoading(false);
    }
  };

  // Delete a user value chain entry from MongoDB
  const handleDeleteUserValueChainEntry = async (entry, idx) => {
    if (!window.confirm(`Delete value chain entry: ${entry.valueChainEntryName}?`)) return;
    try {
      // Call backend API to delete by unique keys
      const res = await fetch('http://localhost:4000/api/mongo/deleteValueChainEntry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valueChainEntryName: entry.valueChainEntryName, businessType: entry.businessType, label: entry.label })
      });
      if (!res.ok) throw new Error('Failed to delete entry');
      // Remove from UI list
      setAllUserValueChainEntries(prev => prev.filter((_, i) => i !== idx));
    } catch (err) {
      alert('Delete failed: ' + (err.message || err));
    }
  };

  let colNames = [];
  if (selectedSheet && sheetData[selectedSheet] && sheetData[selectedSheet][0]) {
    colNames = sheetData[selectedSheet][0].map((name, idx) => ({ name, idx }));
  }

  // UI for creating relations between sheets
  const renderRelationCreator = () => {
    // Only allow if at least 2 sheets and keys are selected
    if (sheetNames.length < 2 || Object.keys(sheetKeys).length < 2) return null;
    // State for new relation
    const [fromSheet, setFromSheet] = React.useState('');
    const [fromColIdx, setFromColIdx] = React.useState('');
    const [toSheet, setToSheet] = React.useState('');
    // Only allow reference to a key in another sheet
    return (
      <div style={{ margin: '24px 0' }}>
        <h3>Create Sheet Relation</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={fromSheet} onChange={e => { setFromSheet(e.target.value); setFromColIdx(''); }}>
            <option value=''>From Sheet</option>
            {sheetNames.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={fromColIdx} onChange={e => setFromColIdx(e.target.value)} disabled={!fromSheet}>
            <option value=''>Reference Column</option>
            {(sheetData[fromSheet]?.[0] || []).map((col, idx) => (
              <option key={idx} value={idx}>{col || `Column ${idx+1}`}</option>
            ))}
          </select>
          <span>→</span>
          <select value={toSheet} onChange={e => setToSheet(e.target.value)}>
            <option value=''>To Sheet (Key)</option>
            {sheetNames.filter(s => s !== fromSheet).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            onClick={() => {
              if (fromSheet && fromColIdx !== '' && toSheet && sheetKeys[toSheet] !== undefined) {
                setSheetRelations([...sheetRelations, { fromSheet, fromColIdx: Number(fromColIdx), toSheet, toColIdx: sheetKeys[toSheet] }]);
              }
            }}
            disabled={!fromSheet || fromColIdx === '' || !toSheet || sheetKeys[toSheet] === undefined}
          >
            Add Relation
          </button>
        </div>
        {/* List current relations */}
        <ul style={{ marginTop: 8 }}>
          {sheetRelations.map((rel, idx) => (
            <li key={idx}>
              {rel.fromSheet} [{(sheetData[rel.fromSheet]?.[0]||[])[rel.fromColIdx]}] → {rel.toSheet} [{(sheetData[rel.toSheet]?.[0]||[])[rel.toColIdx]}]
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Prepare nodes and edges for SheetGraph
  const nodes = React.useMemo(() =>
    sheetNames.map((sheet, idx) => ({
      id: sheet,
      data: { label: sheet },
      type: 'default', // ensure default draggable node
      position: { x: 100 * idx, y: 100 }, // initial position, but user can drag
    })),
    [sheetNames]
  );
  const edges = React.useMemo(() =>
    sheetRelations.map((rel, idx) => ({
      id: `e${idx}`,
      source: rel.fromSheet,
      target: rel.toSheet,
      label: `${(sheetData[rel.fromSheet]?.[0]||[])[rel.fromColIdx]} → ${(sheetData[rel.toSheet]?.[0]||[])[rel.toColIdx]}`,
      data: { fromColIdx: rel.fromColIdx, toColIdx: rel.toColIdx },
    })),
    [sheetRelations, sheetData]
  );

  // Track node positions in state and preserve them
  // Only initialize graphNodes from nodes on mount
  const [graphNodes, setGraphNodes] = React.useState(() => nodes);
  // Only reset graphNodes when a new file is imported
  React.useEffect(() => {
    if (fileImported) {
      setGraphNodes(nodes);
      setFileImported(false);
    }
  }, [fileImported, nodes]);

  // Save node positions to localStorage when they change
  // React.useEffect(() => {
  //   if (sheetNames.length > 0 && graphNodes.length > 0) {
  //     const mainSheet = sheetNames[0];
  //     localStorage.setItem(`nodePositions_${mainSheet}`, JSON.stringify(graphNodes));
  //   }
  // }, [graphNodes, sheetNames]);

  // Load relations from MongoDB on file import
  // React.useEffect(() => {
  //   if (sheetNames.length > 0) {
  //     const mainSheet = sheetNames[0];
  //     loadSheetRelations(mainSheet)
  //       .then(res => {
  //         if (res && Array.isArray(res.relations)) setSheetRelations(res.relations);
  //       })
  //       .catch(() => {});
  //   }
  // }, [sheetNames.join(',')]);

  // Remove auto-save, add manual save button
  const [relationSaveStatus, setRelationSaveStatus] = React.useState('');
  const handleSaveRelations = async () => {
    if (sheetNames.length > 0) {
      const mainSheet = sheetNames[0];
      try {
        await saveSheetRelations(mainSheet, sheetRelations);
        setRelationSaveStatus('Relations saved!');
        setTimeout(() => setRelationSaveStatus(''), 2000);
      } catch {
        setRelationSaveStatus('Failed to save relations');
        setTimeout(() => setRelationSaveStatus(''), 2000);
      }
    }
  };

  // Handler to load relations from MongoDB
  const handleLoadRelationsFromMongo = async () => {
    if (sheetNames.length > 0) {
      const mainSheet = sheetNames[0];
      try {
        const res = await loadSheetRelations(mainSheet);
        if (res && Array.isArray(res.relations)) {
          // Only keep relations where both sheets exist in the current import
          const validRelations = res.relations.filter(rel =>
            sheetNames.includes(rel.fromSheet) && sheetNames.includes(rel.toSheet)
          );
          setSheetRelations(validRelations);
        }
      } catch (err) {
        // Optionally show error
      }
    }
  };

  // Handler to delete a relation (edge) from the graph
  const handleDeleteRelation = (edge) => {
    // Find the relation that matches this edge
    setSheetRelations(prev => prev.filter((rel, idx) => {
      // Edge id is in format e{idx} as per edges mapping
      return `e${idx}` !== edge.id;
    }));
  };

  // Validation error modal state
  const [validationModal, setValidationModal] = useState({ open: false, message: '' });

  // Handler to validate relations
  const handleValidateRelations = () => {
    const errors = [];
    sheetRelations.forEach((rel, idx) => {
      const fromSheetRows = sheetData[rel.fromSheet] || [];
      const toSheetRows = sheetData[rel.toSheet] || [];
      const fromColIdx = rel.fromColIdx;
      const toColIdx = rel.toColIdx;
      if (!fromSheetRows.length || !toSheetRows.length) return;
      const fromHeader = fromSheetRows[0] || [];
      const toHeader = toSheetRows[0] || [];
      const fromColName = fromHeader[fromColIdx] || `Column ${fromColIdx+1}`;
      const toColName = toHeader[toColIdx] || `Column ${toColIdx+1}`;
      const fromValues = new Set(fromSheetRows.slice(1).map(row => row[fromColIdx]));
      const toValues = new Set(toSheetRows.slice(1).map(row => row[toColIdx]));
      // Check that every fromValue exists in toValues
      const missing = Array.from(fromValues).filter(v => v !== undefined && v !== null && v !== '' && !toValues.has(v));
      if (missing.length > 0) {
        errors.push(`Relation ${rel.fromSheet} [${fromColName}] → ${rel.toSheet} [${toColName}]: ${missing.length} unmatched value(s) (e.g. "${missing.slice(0,3).join('", "')}")`);
      }
    });
    if (errors.length > 0) {
      setValidationModal({ open: true, message: 'Validation errors found:\n' + errors.join('\n') });
    } else {
      setValidationModal({ open: true, message: 'All relations are valid!' });
    }
  };

  // State for showing all relations
  const [relationsModal, setRelationsModal] = useState(false);

  // Helper to format all relations as text
  const getRelationsText = () => {
    return sheetRelations.map((rel, idx) => {
      const fromSheetRows = sheetData[rel.fromSheet] || [];
      const toSheetRows = sheetData[rel.toSheet] || [];
      const fromHeader = fromSheetRows[0] || [];
      const toHeader = toSheetRows[0] || [];
      const fromColName = fromHeader[rel.fromColIdx] || `Column ${rel.fromColIdx+1}`;
      const toColName = toHeader[rel.toColIdx] || `Column ${rel.toColIdx+1}`;
      return `${idx+1}. ${rel.fromSheet} [${fromColName}] → ${rel.toSheet} [${toColName}]`;
    }).join('\n');
  };

  return (
    <div style={{ padding: 32 }}>
      <button
        style={{
          marginBottom: 24,
          padding: '8px 18px',
          fontSize: '1em',
          fontWeight: 600,
          borderRadius: 6,
          border: '1px solid #b6c2d6',
          background: '#f5f8fa',
          color: '#222',
          cursor: 'pointer',
        }}
        onClick={() => navigate(-1)}
      >
        &larr; Back
      </button>
      <h2>Load Data Page</h2>
      <input
        id="xlsx-file-input"
        type="file"
        accept=".xlsx,.xls"
        style={{ display: 'none' }}
        onChange={handleImport}
      />
      <button
        style={{
          marginBottom: 16,
          padding: '8px 18px',
          fontSize: '1em',
          fontWeight: 600,
          borderRadius: 6,
          border: '1px solid #b6c2d6',
          background: '#e6f7ff',
          color: '#222',
          cursor: 'pointer',
        }}
        onClick={() => document.getElementById('xlsx-file-input').click()}
      >
        Import XLSX
      </button>
      {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      {sheetNames.length > 0 && (
        <div style={{ marginTop: 24, display: 'flex', gap: 32, alignItems: 'flex-start' }}>
          {/* Left: Sheet Names */}
          <div style={{ minWidth: 200, border: '1px solid #b6c2d6', borderRadius: 8, background: '#fafafa', padding: 16 }}>
            <h3>Sheet Names:</h3>
            <ul>
              {sheetNames.map((name, idx) => (
                <li key={idx}>
                  <button
                    style={{ background: selectedSheet === name ? '#bae7ff' : '#f5f8fa', border: '1px solid #b6c2d6', borderRadius: 4, padding: '4px 12px', margin: 2, cursor: 'pointer' }}
                    onClick={() => { setSelectedSheet(name); setSelectedColumns([]); }}
                  >
                    {name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {/* Middle: Column Selection */}
          {selectedSheet && sheetData[selectedSheet] && visibleCols[selectedSheet] && (
            <div style={{ minWidth: 300, border: '1px solid #b6c2d6', borderRadius: 8, background: '#fafafa', padding: 16 }}>
              <h3>Columns (Drag to select):</h3>
              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div style={{ minWidth: 140 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Available Columns</span>
                    <button
                      style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4, border: '1px solid #b6c2d6', background: '#e6f7ff', cursor: 'pointer' }}
                      onClick={() => {
                        // Add all visible columns not already selected
                        const allVisible = colNames.filter(col => visibleCols[selectedSheet][col.idx] && !selectedColumns.includes(col.idx)).map(col => col.idx);
                        setSelectedColumns([...selectedColumns, ...allVisible]);
                      }}
                      disabled={colNames.filter(col => visibleCols[selectedSheet][col.idx] && !selectedColumns.includes(col.idx)).length === 0}
                    >
                      Add All
                    </button>
                  </div>
                  <div style={{ border: '1px solid #b6c2d6', borderRadius: 6, minHeight: 40, padding: 8, background: '#f5f8fa' }}>
                    {colNames.filter(col => visibleCols[selectedSheet][col.idx] && !selectedColumns.includes(col.idx)).map(col => (
                      <div
                        key={col.idx}
                        draggable
                        onDragStart={() => handleDragStart(col.idx)}
                        style={{ padding: '4px 8px', margin: '4px 0', background: '#fff', border: '1px solid #b6c2d6', borderRadius: 4, cursor: 'grab' }}
                      >
                        {col.name || `Column ${col.idx + 1}`}
                      </div>
                    ))}
                  </div>
                </div>
                <div
                  style={{ minWidth: 140 }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>Selected Columns</div>
                  <div style={{ border: '1px solid #b6c2d6', borderRadius: 6, minHeight: 40, padding: 8, background: '#e6f7ff' }}>
                    {selectedColumns.map(idx => (
                      <div
                        key={idx}
                        style={{ padding: '4px 8px', margin: '4px 0', background: '#fff', border: '1px solid #b6c2d6', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      >
                        {colNames[idx]?.name || `Column ${idx + 1}`}
                        <button
                          style={{ marginLeft: 8, background: 'none', border: 'none', color: '#d4380d', cursor: 'pointer', fontWeight: 700 }}
                          onClick={() => handleRemoveSelected(idx)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Right: MongoDB Frame */}
          <div style={{ minWidth: 180, border: '1px solid #b6c2d6', borderRadius: 8, background: '#fafafa', padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ marginTop: 0 }}>MongoDB</h3>
            <button style={{ margin: '8px 0', padding: '8px 18px', fontWeight: 600, borderRadius: 6, border: '1px solid #b6c2d6', background: '#e6f7ff', color: '#222', cursor: mongoLoading ? 'wait' : 'pointer', width: '100%' }} onClick={handlePush} disabled={mongoLoading}>Push</button>
            <button style={{ margin: '8px 0', padding: '8px 18px', fontWeight: 600, borderRadius: 6, border: '1px solid #b6c2d6', background: '#e6f7ff', color: '#222', cursor: mongoLoading ? 'wait' : 'pointer', width: '100%' }} onClick={handleRead} disabled={mongoLoading}>Read</button>
            <button style={{ margin: '8px 0', padding: '8px 18px', fontWeight: 600, borderRadius: 6, border: '1px solid #b6c2d6', background: '#f6ffed', color: '#222', cursor: userVcLoading ? 'wait' : 'pointer', width: '100%' }} onClick={handleShowAllUserValueChainEntries} disabled={userVcLoading}>Show All User Value Chain Entries</button>
            {mongoError && <div style={{ color: mongoError.includes('successful') ? 'green' : 'red', marginTop: 8, fontSize: 13 }}>{mongoError}</div>}
            {userVcError && <div style={{ color: 'red', marginTop: 8, fontSize: 13 }}>{userVcError}</div>}
            {allUserValueChainEntries.length > 0 && (
              <div style={{ marginTop: 12, maxHeight: 200, overflowY: 'auto', width: '100%' }}>
                <h4 style={{ margin: '8px 0 4px 0', fontSize: 15 }}>All User Value Chain Entries</h4>
                <ul style={{ paddingLeft: 16, fontSize: 14 }}>
                  {allUserValueChainEntries.map((entry, idx) => (
                    <li key={idx} style={{ marginBottom: 4 }}>
                      <span
                        style={{ cursor: 'pointer', color: '#1890ff', textDecoration: 'underline' }}
                        onClick={() => setExpandedUserEntryIdx(expandedUserEntryIdx === idx ? null : idx)}
                        title="Click to show/hide details"
                      >
                        <b>{entry.valueChainEntryName}</b>{entry.businessType ? ' (' + entry.businessType + ')' : ''}
                      </span>
                      <button
                        style={{ marginLeft: 8, color: '#fff', background: '#d4380d', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontSize: 12 }}
                        onClick={() => handleDeleteUserValueChainEntry(entry, idx)}
                        title="Delete this entry"
                      >Delete</button>
                      {expandedUserEntryIdx === idx && (
                        <pre style={{ background: '#f4f4f4', padding: 8, borderRadius: 6, marginTop: 4, fontSize: 12, maxWidth: 320, overflowX: 'auto' }}>
                          {JSON.stringify(entry, null, 2)}
                        </pre>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      {sheetNames.length > 0 && renderRelationCreator()}
      {sheetNames.length > 0 && (
        <div style={{ margin: '16px 0', display: 'flex', gap: 16 }}>
          <button
            style={{ padding: '8px 18px', fontWeight: 600, borderRadius: 6, border: '1px solid #1890ff', background: '#1890ff', color: '#fff', cursor: 'pointer' }}
            onClick={handleSaveRelations}
          >
            Save Relations to MongoDB
          </button>
          <button
            style={{ padding: '8px 18px', fontWeight: 600, borderRadius: 6, border: '1px solid #52c41a', background: '#52c41a', color: '#fff', cursor: 'pointer' }}
            onClick={handleLoadRelationsFromMongo}
          >
            Load Relations from MongoDB
          </button>
          <button
            style={{ padding: '8px 18px', fontWeight: 600, borderRadius: 6, border: '1px solid #faad14', background: '#faad14', color: '#222', cursor: 'pointer' }}
            onClick={handleValidateRelations}
          >
            Validate Relations
          </button>
          <button
            style={{ padding: '8px 18px', fontWeight: 600, borderRadius: 6, border: '1px solid #722ed1', background: '#722ed1', color: '#fff', cursor: 'pointer' }}
            onClick={() => setRelationsModal(true)}
          >
            Show All Relations
          </button>
          <button
            style={{ padding: '8px 18px', fontWeight: 600, borderRadius: 6, border: '1px solid #13c2c2', background: '#13c2c2', color: '#fff', cursor: 'pointer' }}
            onClick={async () => {
              if (sheetNames.length > 0) {
                const mainSheet = sheetNames[0];
                try {
                  // Debug log: show data being sent
                  console.log('[DEBUG] Saving graph to MongoDB:', {
                    sheetName: mainSheet,
                    relations: sheetRelations,
                    nodePositions: graphNodes
                  });
                  await saveSheetRelations(mainSheet, sheetRelations, graphNodes);
                  setRelationSaveStatus('Graph saved!');
                  setTimeout(() => setRelationSaveStatus(''), 2000);
                } catch {
                  setRelationSaveStatus('Failed to save graph');
                  setTimeout(() => setRelationSaveStatus(''), 2000);
                }
              }
            }}
          >
            Save Graph (MongoDB)
          </button>
          <button
            style={{ padding: '8px 18px', fontWeight: 600, borderRadius: 6, border: '1px solid #eb2f96', background: '#eb2f96', color: '#fff', cursor: 'pointer' }}
            onClick={async () => {
              if (sheetNames.length > 0) {
                const mainSheet = sheetNames[0];
                try {
                  const res = await loadSheetRelations(mainSheet);
                  // Debug log: show data received
                  console.log('[DEBUG] Loaded graph from MongoDB:', res);
                  if (res && Array.isArray(res.nodePositions)) {
                    // Only keep node positions for sheets that exist in the current import
                    let validNodes = res.nodePositions.filter(node => sheetNames.includes(node.id));
                    // Add any missing sheets as nodes with default positions
                    const missingSheets = sheetNames.filter(sheet => !validNodes.some(node => node.id === sheet));
                    const defaultY = 100;
                    const defaultNodes = missingSheets.map((sheet, idx) => ({
                      id: sheet,
                      data: { label: sheet },
                      type: 'default',
                      position: { x: 100 * idx, y: defaultY }
                    }));
                    validNodes = [...validNodes, ...defaultNodes];
                    setGraphNodes(validNodes);
                  }
                  if (res && Array.isArray(res.relations)) {
                    // Only keep relations where both sheets exist in the current import
                    const validRelations = res.relations.filter(rel =>
                      sheetNames.includes(rel.fromSheet) && sheetNames.includes(rel.toSheet)
                    );
                    setSheetRelations(validRelations);
                  }
                  setRelationSaveStatus('Graph loaded!');
                  setTimeout(() => setRelationSaveStatus(''), 2000);
                } catch {
                  setRelationSaveStatus('Failed to load graph');
                  setTimeout(() => setRelationSaveStatus(''), 2000);
                }
              }
            }}
          >
            Load Graph (MongoDB)
          </button>
          {relationSaveStatus && <span style={{ marginLeft: 16, color: relationSaveStatus.includes('saved') || relationSaveStatus.includes('loaded') ? 'green' : 'red' }}>{relationSaveStatus}</span>}
        </div>
      )}
      {/* Modal for showing all relations */}
      {relationsModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(30,40,60,0.5)', zIndex: 3100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 400, boxShadow: '0 2px 16px #0002', maxWidth: 600 }}>
            <h3>All Current Relations</h3>
            <textarea
              readOnly
              value={getRelationsText()}
              style={{ width: '100%', minHeight: 120, fontFamily: 'monospace', fontSize: 14, marginBottom: 16, resize: 'vertical' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setRelationsModal(false)} style={{ padding: '6px 18px', borderRadius: 4, border: '1px solid #722ed1', background: '#722ed1', color: '#fff', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}
      {sheetNames.length > 0 && (
        <SheetGraph
          nodes={graphNodes} // <-- use graphNodes, not nodes
          edges={edges}
          sheetData={sheetData}
          onAddRelation={(fromSheet, toSheet, fromColIdx, toColIdx) => {
            setSheetRelations([
              ...sheetRelations,
              { fromSheet, toSheet, fromColIdx, toColIdx }
            ]);
          }}
          onDeleteRelation={handleDeleteRelation}
          onNodesChangeExternal={setGraphNodes}
        />
      )}
      {/* Data Table */}
      {selectedSheet && sheetData[selectedSheet] && visibleCols[selectedSheet] && (
        <div style={{ marginTop: 32 }}>
          <h3>Data for: {selectedSheet}</h3>
          <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <tbody>
                {sheetData[selectedSheet].map((row, rIdx) => (
                  <tr key={rIdx}>
                    {visibleCols[selectedSheet].map((show, cIdx) => show ? (
                      <td
                        key={cIdx}
                        style={{ border: '1px solid #b6c2d6', padding: '4px 10px', background: rIdx === 0 ? '#e6f7ff' : '#fff', fontWeight: rIdx === 0 ? 600 : 400 }}
                      >
                        {row && row[cIdx] !== undefined ? row[cIdx] : ''}
                      </td>
                    ) : null)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* MongoDB Table */}
      {mongoTable.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3>MongoDB Data for: {selectedSheet}</h3>
          <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  {/* Collect all unique column names from mongoTable */}
                  {(() => {
                    const allCols = new Set();
                    mongoTable.forEach(row => Object.keys(row).forEach(k => allCols.add(k)));
                    return Array.from(allCols).map((col, idx) => (
                      <th key={idx} style={{ border: '1px solid #b6c2d6', padding: '4px 10px', background: '#e6f7ff', fontWeight: 600 }}>{col}</th>
                    ));
                  })()}
                </tr>
              </thead>
              <tbody>
                {mongoTable.map((row, rIdx) => {
                  const allCols = Array.from(new Set(mongoTable.flatMap(r => Object.keys(r))));
                  return (
                    <tr key={rIdx}>
                      {allCols.map((col, cIdx) => (
                        <td
                          key={cIdx}
                          style={{ border: '1px solid #b6c2d6', padding: '4px 10px', background: '#fff' }}
                        >
                          {row[col] !== undefined ? row[col] : ''}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Validation error modal */}
      {validationModal.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(30,40,60,0.5)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 400, boxShadow: '0 2px 16px #0002', maxWidth: 600 }}>
            <h3>Validation Results</h3>
            <textarea
              readOnly
              value={validationModal.message}
              style={{ width: '100%', minHeight: 120, fontFamily: 'monospace', fontSize: 14, marginBottom: 16, resize: 'vertical' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setValidationModal({ open: false, message: '' })} style={{ padding: '6px 18px', borderRadius: 4, border: '1px solid #1890ff', background: '#1890ff', color: '#fff', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoadDataPage;
