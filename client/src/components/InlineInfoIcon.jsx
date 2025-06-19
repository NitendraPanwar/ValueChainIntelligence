import React from 'react';

const InlineInfoIcon = ({ onMouseEnter, onMouseLeave, onClick, style }) => {
  // Calculate size
  const fontSize = style?.fontSize || style?.height || 14;
  const size = style?.width || style?.height || fontSize;
  return (
    <span
      style={{
        marginLeft: 4,
        color: '#fff', // white i
        backgroundColor: '#111', // black circle
        borderRadius: '50%',
        fontWeight: 700,
        fontSize,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        lineHeight: size + 'px',
        textAlign: 'center',
        verticalAlign: 'middle',
        position: 'relative',
        ...style
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      title="More info"
    >
      <span style={{ position: 'relative', top: '-1px' }}>ⓘ</span>
    </span>
  );
};

export default InlineInfoIcon;
