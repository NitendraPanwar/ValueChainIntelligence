import React from 'react';

function StarRating({ maxStars = 4, rating = 0, onChange }) {
  const [internalRating, setInternalRating] = React.useState(rating);
  React.useEffect(() => { setInternalRating(rating); }, [rating]);
  const handleClick = (r) => {
    // If clicking the same rating, reset to zero
    const newRating = (internalRating === r) ? 0 : r;
    setInternalRating(newRating);
    if (onChange) onChange(newRating);
  };
  return (
    <div className="star-rating">
      {Array.from({ length: maxStars }).map((_, i) => (
        <span
          key={i}
          style={{
            cursor: 'pointer',
            fontSize: '1.5em',
            color: i < internalRating ? '#fbbf24' : '#e5e7eb',
            transition: 'color 0.2s',
            userSelect: 'none',
          }}
          onClick={() => handleClick(i + 1)}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default StarRating;
