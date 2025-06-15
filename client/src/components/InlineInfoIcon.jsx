import React from 'react';

const InlineInfoIcon = ({ onMouseEnter, onMouseLeave, style }) => (
  <sup
    style={{
      marginLeft: 4,
      color: '#2563eb',
      fontWeight: 700,
      fontSize: 14,
      cursor: 'pointer',
      textDecoration: 'underline dotted',
      ...style
    }}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    title="More info"
  >
    i
  </sup>
);

export default InlineInfoIcon;
