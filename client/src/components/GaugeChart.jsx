import React from 'react';

// Enhanced SVG semicircle gauge chart with concentric arcs
export default function GaugeChart({ value = 0, min = 0, max = 5, label, width = 220, height = 130 }) {
  // Clamp value
  const v = Math.max(min, Math.min(max, Number(value)));
  // Arc paths for colored backgrounds (green to red)
  // Make outer arc much thicker and inner arc thinner and smaller
  const outerArcWidth = 40; // keep thick arc
  const innerArcWidth = 6;  // thinner inner arc
  const outerRadius = width / 2 - 20; // leave more space for thick arc
  const innerRadius = width / 2 - 60; // keep inner arc inside
  // Draw arcs from -90 (left/top) to +90 (right/top) in SVG coordinates
  const arcOuter = describeArc(width / 2, height, outerRadius, -90, 90, true);
  // Inner arc: start from center (width/2, height) to right edge (90deg)
  const arcInner = describeArc(width / 2, height, innerRadius, -90, 90, true);
  // Pointer coordinates (on outer arc)
  // Map value: min -> -90deg (left/top), max -> +90deg (right/top)
  const pointerAngleDeg = -90 + ((v - min) / (max - min)) * 180;
  const pointerAngleRad = (pointerAngleDeg - 90) * Math.PI / 180.0;
  const pointerLen = outerRadius - 8;
  const pointerX = width / 2 + pointerLen * Math.cos(pointerAngleRad);
  const pointerY = height + pointerLen * Math.sin(pointerAngleRad);
  return (
    <svg width={width} height={height + 32} viewBox={`0 0 ${width} ${height + 32}`}>
      {/* Optional label above gauge */}
      {label && <text x={width / 2} y={12} textAnchor="middle" fontSize="15" fontWeight="bold" fill="#444">{label}</text>}
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
      <path d={describeArc(width / 2, height, innerRadius, -90, 90, true) + ` L${width / 2},${height} Z`} fill="url(#gaugeGradient)" opacity="0.25" />
      {/* Pointer */}
      <line x1={width / 2} y1={height} x2={pointerX} y2={pointerY} stroke="#222" strokeWidth="6" strokeLinecap="round" />
      {/* Center circle */}
      <circle cx={width / 2} cy={height} r="13" fill="#222" />
      {/* Value label */}
      <text x={width / 2} y={height + 28} textAnchor="middle" fontSize="22" fontWeight="bold" fill="#222">{v}</text>
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
