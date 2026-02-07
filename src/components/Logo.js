import React, { useState } from 'react';

export default function Logo({ size = 32, src = '/logo.png', className = '' }) {
  const [loaded, setLoaded] = useState(true);

  return loaded ? (
    <img
      src={src}
      alt="CommuniTree logo"
      width={size}
      height={size}
      onError={() => {
        console.warn(`Logo failed to load from ${src}`);
        setLoaded(false);
      }}
      style={{
        borderRadius: size < 24 ? 4 : 8,
        objectFit: 'contain',
        display: 'block',
      }}
      className={className}
    />
  ) : (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        display: 'grid',
        placeItems: 'center',
        background: 'linear-gradient(135deg,#16A34A,#7C3AED)',
        color: '#fff',
        fontWeight: 800,
        fontSize: Math.max(12, Math.floor(size / 2.5)),
      }}
    >
      CT
    </div>
  );
}
