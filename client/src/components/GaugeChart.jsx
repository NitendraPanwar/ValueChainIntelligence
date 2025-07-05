import React, { useEffect, useState } from 'react';
import { getMaturityLevelsFromMongo } from '../utils/mongoApi';

// Enhanced SVG semicircle gauge chart with concentric arcs
export default function GaugeChart({ value = 0, min = 0, max = 5, label, width = 220, height = 130, type = 'business', businessOwner, technologyOwner, valueChainEntryId, valueChainEntryName }) {
  // Clamp value
  const v = Math.max(min, Math.min(max, Number(value)));
  // Arc paths for colored backgrounds (green to red)
  // Make outer arc much thicker and inner arc thinner and smaller
  const outerArcWidth = 40; // keep thick arc
  const innerArcWidth = 6;  // thinner inner arc
  const outerRadius = width / 2 - 20; // leave more space for thick arc
  const innerRadius = width / 2 - 60; // keep inner arc inside
  const centerX = (width + 40) / 2;
  const centerY = height;
  // Draw arcs from -90 (left/top) to +90 (right/top) in SVG coordinates
  const arcOuter = describeArc(centerX, centerY, outerRadius, -90, 90, true);
  // Inner arc: start from center (width/2, height) to right edge (90deg)
  const arcInner = describeArc(centerX, centerY, innerRadius, -90, 90, true);
  // Pointer coordinates (on outer arc)
  // Map value: min -> -90deg (left/top), max -> +90deg (right/top)
  const pointerAngleDeg = -90 + ((v - min) / (max - min)) * 180;
  const pointerAngleRad = (pointerAngleDeg - 90) * Math.PI / 180.0;
  const pointerLen = outerRadius - 8;
  const pointerX = centerX + pointerLen * Math.cos(pointerAngleRad);
  const pointerY = centerY + pointerLen * Math.sin(pointerAngleRad);

  // State for label and description
  const [maturityLabel, setMaturityLabel] = useState('');
  const [maturityDescription, setMaturityDescription] = useState('');

  // Map gauge value to business/technology level string
  useEffect(() => {
    async function fetchLabelAndDescription() {
      const levels = await getMaturityLevelsFromMongo();
      const mapping = levels.mapping || levels.rows || [];
      let found = null;
      let desc = '';
      let label = '';
      if (type === 'business') {
        found = mapping.find(row => {
          const businessNum = Number(row['Business Maturity Number'] ?? row['business maturity number']);
          const techNum = Number(row['Technology Maturity Number'] ?? row['technology maturity number']);
          return businessNum === v && techNum !== v;
        });
        desc = found && (found['Business Maturity Description'] || found['business maturity description']) ? (found['Business Maturity Description'] || found['business maturity description']) : '';
        label = found && found['Business Maturity Levels'] !== undefined
          ? found['Business Maturity Levels']
          : 'NA';
      } else if (type === 'technology') {
        found = mapping.find(row => {
          const techNum = Number(row['Technology Maturity Number'] ?? row['technology maturity number']);
          const businessNum = Number(row['Business Maturity Number'] ?? row['business maturity number']);
          return techNum === v && businessNum !== v;
        });
        desc = found && (found['Technology Maturity Description'] || found['technology maturity description']) ? (found['Technology Maturity Description'] || found['technology maturity description']) : '';
        label = found && found['Technology Maturity Levels'] !== undefined
          ? found['Technology Maturity Levels']
          : 'NA';
      }
      setMaturityLabel(label);
      setMaturityDescription(desc);
    }
    fetchLabelAndDescription();
  }, [v, type, businessOwner, technologyOwner, valueChainEntryId, valueChainEntryName]);

  // Adjust the layout to ensure labels under the gauge chart fit properly.
  // Increase SVG height to accommodate longer descriptions
  const descriptionHeight = 60; // Increased from 48 to 140 for longer text
  const svgHeight = height + 80 + (descriptionHeight - 48); // adjust SVG height accordingly
  return (
    <svg width={width + 40} height={svgHeight} viewBox={`0 0 ${width + 40} ${svgHeight}`}>
      {/* Optional label above gauge */}
      {label && <text x={centerX} y={12} textAnchor="middle" fontSize="15" fontWeight="bold" fill="#444">{label}</text>}
      {/* Outer background arc */}
      <defs>
        <linearGradient id="gaugeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff4136" />
          <stop offset="50%" stopColor="#ffe21c" />
          <stop offset="100%" stopColor="#2ecc40" />
        </linearGradient>
      </defs>
      <path d={arcOuter} fill="none" stroke="url(#gaugeGradient)" strokeWidth={outerArcWidth} />
      {/* Inner filled semicircle */}
      <path d={arcInner + ` L${centerX},${centerY} Z`} fill="url(#gaugeGradient)" opacity="0.25" />
      {/* Pointer */}
      <line x1={centerX} y1={centerY} x2={pointerX} y2={pointerY} stroke="#222" strokeWidth="6" strokeLinecap="round" />
      {/* Center circle */}
      <circle cx={centerX} cy={centerY} r="13" fill="#222" />
      {/* Maturity label */}
      <text x={centerX} y={height + 40} textAnchor="middle" fontSize="22" fontWeight="bold" fill="#222">{maturityLabel}</text>
      {/* Maturity description under label */}
      {maturityDescription && (
        <foreignObject x={(width + 40) * 0.1} y={height + 50} width={(width + 40) * 0.8} height={descriptionHeight}>
          <div style={{
            color: '#444',
            fontSize: 14,
            textAlign: 'center',
            wordBreak: 'break-word',
            width: '100%',
            height: '100%',
            overflowY: 'auto',
            whiteSpace: 'pre-line',
            padding: 0,
            boxSizing: 'border-box',
          }}>{maturityDescription}</div>
        </foreignObject>
      )}
    </svg>
  );
}

// Helper to describe SVG arc
function describeArc(cx, cy, r, startAngle, endAngle, semicircle = false) {
  // Always draw the large arc for 180deg
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArcFlag = semicircle ? "1" : (Math.abs(endAngle - startAngle) <= 180 ? "0" : "1");
  return [
    "M", start.x, start.y,
    "A", r, r, 0, largeArcFlag, 1, end.x, end.y
  ].join(" ");
}
function polarToCartesian(cx, cy, r, angle) {
  const rad = (angle - 90) * Math.PI / 180.0;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad)
  };
}
