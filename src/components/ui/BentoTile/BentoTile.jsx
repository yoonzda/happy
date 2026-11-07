import React from 'react';
import Title from '../Title/Title';
import styles from './BentoTile.module.css';

const SPAN_CLASS_MAP = {
  '1x1': styles.span1x1,
  '2x1': styles.span2x1,
  '1x2': styles.span1x2,
  '3x1': styles.span3x1,
};

function createPlaceholderDataUrl(label, index = 0) {
  const tones = ['#e4e4e4', '#dedede', '#e8e8e8', '#e0e0e0', '#eaeaea'];
  const bg = tones[index % tones.length];
  const safeLabel = (label || 'Project').replace(/[<>&"']/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <rect width="800" height="600" fill="${bg}"/>
    <line x1="0" y1="0" x2="800" y2="600" stroke="#d0d0d0" stroke-width="1"/>
    <line x1="800" y1="0" x2="0" y2="600" stroke="#d0d0d0" stroke-width="1"/>
    <rect x="40" y="40" width="720" height="520" fill="none" stroke="#cccccc" stroke-width="1"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#666666" font-family="Pretendard, sans-serif" font-size="20" font-weight="400" letter-spacing="0.02em">${safeLabel}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function BentoTile({
  title,
  image,
  primaryUrl,
  span = '1x1',
  hoverZoom = 'in',
  index = 0,
}) {
  const spanClass = SPAN_CLASS_MAP[span] || styles.span1x1;
  const zoomClass = hoverZoom === 'out' ? styles.zoomOut : styles.zoomIn;
  const imgSrc = image || createPlaceholderDataUrl(title, index);

  const content = (
    <>
      <img
        src={imgSrc}
        alt={title}
        className={styles.image}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = createPlaceholderDataUrl(title, index);
        }}
      />
      <div className={styles.overlay}>
        <Title variant="tile" as="span">
          {title}
        </Title>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="square"
          strokeLinejoin="miter"
          className={styles.moveIcon}
          aria-hidden="true"
        >
          <line x1="7" y1="17" x2="17" y2="7" />
          <polyline points="8 7 17 7 17 16" />
        </svg>
      </div>
    </>
  );

  const classes = [styles.tile, spanClass, zoomClass].join(' ');

  if (primaryUrl) {
    return (
      <a
        href={primaryUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        aria-label={title}
      >
        {content}
      </a>
    );
  }

  return <div className={classes}>{content}</div>;
}
