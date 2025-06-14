import React from 'react';

function StarRating({ maxStars = 4 }) {
  const [rating, setRating] = React.useState(0);
  return (
    <div className="star-rating">
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

export default StarRating;
