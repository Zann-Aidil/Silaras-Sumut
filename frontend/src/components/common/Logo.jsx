import React from 'react';

/**
 * SILARAS Official Brand Logo Component
 * Renders the user's authentic SILARAS logo image with 100% transparent background
 */
export default function Logo({
  size = 'md',        // 'sm' (48px), 'md' (60px), 'lg' (90px), 'xl' (140px), or number
  variant = 'dark',   // 'dark', 'light', 'hero'
  className = '',
  style = {},
  fill = false
}) {
  let imgHeight = 90;

  if (typeof size === 'number') {
    imgHeight = size;
  } else if (size === 'sm') {
    imgHeight = 68;
  } else if (size === 'md') {
    imgHeight = 60;
  } else if (size === 'lg') {
    imgHeight = 100;
  } else if (size === 'xl') {
    imgHeight = 140;
  }

  // Filter adjustment for dark vs light backgrounds
  const filterStyle = variant === 'light' || variant === 'hero'
    ? 'brightness(1.1) drop-shadow(0 2px 8px rgba(255,255,255,0.15))'
    : 'none';

  // image style: if fill is true, let CSS control width and set height:auto
  const imgStyle = fill ? {
    width: '100%',
    height: 'auto',
    objectFit: 'contain',
    filter: filterStyle,
    display: 'block'
  } : {
    height: imgHeight,
    width: 'auto',
    maxHeight: '100%',
    objectFit: 'contain',
    filter: filterStyle,
    display: 'block'
  };

  return (
    <div
      className={`silaras-logo-wrapper ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        width: fill ? '100%' : undefined,
        ...style
      }}
    >
      <img
        src="/logo.png"
        alt="SILARAS — Diskominfo Sumut"
        style={imgStyle}
      />
    </div>
  );
}
