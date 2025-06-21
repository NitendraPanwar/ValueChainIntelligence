import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, { MiniMap, Controls, useNodesState, useEdgesState, addEdge } from 'react-flow-renderer';

// Define nodeTypes and edgeTypes outside the component to ensure stable references
const nodeTypes = {};
const edgeTypes = {};

export default function SheetGraph({ nodes: initialNodes, edges, onAddRelation, onDeleteRelation, sheetData, onNodesChangeExternal }) {
  // Use React Flow's state hooks to allow node dragging and persist positions
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(initialNodes);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(edges);
  const [fullscreen, setFullscreen] = useState(false);
  const [pendingConnect, setPendingConnect] = useState(null); // { source, target }
  const [fromColIdx, setFromColIdx] = useState('');
  const [toColIdx, setToColIdx] = useState('');
  const [pendingExternalUpdate, setPendingExternalUpdate] = useState(false);

  // State for editing an edge (relation)
  const [editingEdge, setEditingEdge] = useState(null);
  const [editFromColIdx, setEditFromColIdx] = useState('');
  const [editToColIdx, setEditToColIdx] = useState('');

  // Update nodes/edges if props change (but preserve positions)
  useEffect(() => {
    setRfEdges(edges);
    // Only add new nodes if they don't exist, preserve positions
    setRfNodes(oldNodes => {
      const oldMap = Object.fromEntries(oldNodes.map(n => [n.id, n]));
      return initialNodes.map(n => oldMap[n.id] ? { ...n, ...oldMap[n.id] } : n);
    });
  }, [edges, initialNodes, setRfEdges, setRfNodes]);

  // Expose node position changes to parent only when user interacts
  const handleNodesChange = useCallback((changes) => {
    onNodesChange(changes);
    setRfNodes(currentNodes => {
      const updated = currentNodes.map(node => {
        const change = changes.find(c => c.id === node.id);
        return change && change.position ? { ...node, position: change.position } : node;
      });
      setPendingExternalUpdate(true);
      return updated;
    });
  }, [onNodesChange, setRfNodes]);

  useEffect(() => {
    if (pendingExternalUpdate && onNodesChangeExternal) {
      onNodesChangeExternal(rfNodes);
      setPendingExternalUpdate(false);
    }
  }, [pendingExternalUpdate, rfNodes, onNodesChangeExternal]);

  // Handle interactive edge creation
  const onConnect = useCallback((params) => {
    if (params.source && params.target) {
      setPendingConnect(params);
    }
  }, []);

  // Handle modal confirm
  const handleConfirm = () => {
    if (pendingConnect && fromColIdx !== '' && toColIdx !== '') {
      if (onAddRelation) {
        onAddRelation(pendingConnect.source, pendingConnect.target, Number(fromColIdx), Number(toColIdx));
      }
      setRfEdges(eds => addEdge({ ...pendingConnect, label: `${(sheetData[pendingConnect.source]?.[0]||[])[fromColIdx]} → ${(sheetData[pendingConnect.target]?.[0]||[])[toColIdx]}` }, eds));
      setPendingConnect(null);
      setFromColIdx('');
      setToColIdx('');
    }
  };

  const handleCancel = () => {
    setPendingConnect(null);
    setFromColIdx('');
    setToColIdx('');
  };

  // Edge double-click handler for editing/deleting
  const handleEdgeDoubleClick = useCallback((event, edge) => {
    event.stopPropagation();
    setEditingEdge(edge);
    // Parse column indices from edge label if possible
    // Example label: "ColA → ColB"
    const rel = edges.find(e => e.id === edge.id);
    if (rel) {
      setEditFromColIdx(rel.data?.fromColIdx?.toString() ?? '');
      setEditToColIdx(rel.data?.toColIdx?.toString() ?? '');
    } else {
      setEditFromColIdx('');
      setEditToColIdx('');
    }
  }, [edges]);

  const graph = (
    <div style={{ width: '100%', height: '100%', background: '#f5f8fa', borderRadius: 8, border: '1px solid #b6c2d6' }}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeDoubleClick={handleEdgeDoubleClick}
        fitView
      >
        <MiniMap />
        <Controls showFullscreen={false} />
      </ReactFlow>
    </div>
  );

  return (
    <>
      <div style={{ width: 600, height: 350, margin: '32px auto', position: 'relative' }}>
        <button
          style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, padding: '4px 12px', borderRadius: 4, border: '1px solid #b6c2d6', background: '#fff', cursor: 'pointer' }}
          onClick={() => setFullscreen(true)}
        >
          Fullscreen
        </button>
        {graph}
      </div>
      {fullscreen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(30,40,60,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '90vw', height: '90vh', background: '#f5f8fa', borderRadius: 8, border: '2px solid #b6c2d6', position: 'relative' }}>
            <button
              style={{ position: 'absolute', top: 12, right: 20, zIndex: 10, padding: '4px 12px', borderRadius: 4, border: '1px solid #b6c2d6', background: '#fff', cursor: 'pointer', fontWeight: 700 }}
              onClick={() => setFullscreen(false)}
            >
              Close
            </button>
            <div style={{ width: '100%', height: '100%' }}>
              <ReactFlow
                nodes={rfNodes}
                edges={rfEdges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodesChange={handleNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onEdgeDoubleClick={handleEdgeDoubleClick}
                fitView
              >
                <MiniMap />
                <Controls showFullscreen={false} />
              </ReactFlow>
            </div>
          </div>
        </div>
      )}
      {/* Modal for selecting columns after connect */}
      {pendingConnect && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(30,40,60,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 320, boxShadow: '0 2px 16px #0002' }}>
            <h3>Select Reference and Key Columns</h3>
            <div style={{ marginBottom: 16 }}>
              <b>Reference (from):</b> {pendingConnect.source}
              <select value={fromColIdx} onChange={e => setFromColIdx(e.target.value)} style={{ marginLeft: 8 }}>
                <option value=''>Select column</option>
                {(sheetData[pendingConnect.source]?.[0] || []).map((col, idx) => (
                  <option key={idx} value={idx}>{col || `Column ${idx+1}`}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <b>Key (to):</b> {pendingConnect.target}
              <select value={toColIdx} onChange={e => setToColIdx(e.target.value)} style={{ marginLeft: 8 }}>
                <option value=''>Select column</option>
                {(sheetData[pendingConnect.target]?.[0] || []).map((col, idx) => (
                  <option key={idx} value={idx}>{col || `Column ${idx+1}`}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
              <button onClick={handleCancel} style={{ padding: '6px 18px', borderRadius: 4, border: '1px solid #b6c2d6', background: '#eee', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleConfirm} style={{ padding: '6px 18px', borderRadius: 4, border: '1px solid #1890ff', background: '#1890ff', color: '#fff', cursor: 'pointer' }} disabled={fromColIdx === '' || toColIdx === ''}>Confirm</button>
            </div>
          </div>
        </div>
      )}
      {/* Modal for editing/deleting an edge (relation) */}
      {editingEdge && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(30,40,60,0.5)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 340, boxShadow: '0 2px 16px #0002' }}>
            <h3>Edit or Delete Relation</h3>
            <div style={{ marginBottom: 16 }}>
              <b>Reference (from):</b> {editingEdge.source}
              {editFromColIdx !== '' && (
                <span style={{ marginLeft: 8, color: '#1890ff' }}>
                  [Current: {(sheetData[editingEdge.source]?.[0]?.[editFromColIdx]) || `Column ${Number(editFromColIdx)+1}` }]
                </span>
              )}
              <select value={editFromColIdx} onChange={e => setEditFromColIdx(e.target.value)} style={{ marginLeft: 8 }}>
                <option value=''>Select column</option>
                {(sheetData[editingEdge.source]?.[0] || []).map((col, idx) => (
                  <option key={idx} value={idx}>{col || `Column ${idx+1}`}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <b>Key (to):</b> {editingEdge.target}
              {editToColIdx !== '' && (
                <span style={{ marginLeft: 8, color: '#1890ff' }}>
                  [Current: {(sheetData[editingEdge.target]?.[0]?.[editToColIdx]) || `Column ${Number(editToColIdx)+1}` }]
                </span>
              )}
              <select value={editToColIdx} onChange={e => setEditToColIdx(e.target.value)} style={{ marginLeft: 8 }}>
                <option value=''>Select column</option>
                {(sheetData[editingEdge.target]?.[0] || []).map((col, idx) => (
                  <option key={idx} value={idx}>{col || `Column ${idx+1}`}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
              <button onClick={() => setEditingEdge(null)} style={{ padding: '6px 18px', borderRadius: 4, border: '1px solid #b6c2d6', background: '#eee', cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={() => {
                  // Update the edge (relation)
                  setRfEdges(eds => eds.map(e => e.id === editingEdge.id ? {
                    ...e,
                    label: `${(sheetData[editingEdge.source]?.[0]||[])[editFromColIdx]} → ${(sheetData[editingEdge.target]?.[0]||[])[editToColIdx]}`,
                    data: { ...e.data, fromColIdx: Number(editFromColIdx), toColIdx: Number(editToColIdx) }
                  } : e));
                  if (onAddRelation) {
                    // Remove the old relation and add the new one
                    onDeleteRelation && onDeleteRelation(editingEdge);
                    onAddRelation(editingEdge.source, editingEdge.target, Number(editFromColIdx), Number(editToColIdx));
                  }
                  setEditingEdge(null);
                }}
                style={{ padding: '6px 18px', borderRadius: 4, border: '1px solid #1890ff', background: '#1890ff', color: '#fff', cursor: 'pointer' }}
                disabled={editFromColIdx === '' || editToColIdx === ''}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setRfEdges(eds => eds.filter(e => e.id !== editingEdge.id));
                  onDeleteRelation && onDeleteRelation(editingEdge);
                  setEditingEdge(null);
                }}
                style={{ padding: '6px 18px', borderRadius: 4, border: '1px solid #d4380d', background: '#d4380d', color: '#fff', cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
