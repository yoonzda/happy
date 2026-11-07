import React from 'react';
import styles from './CircleIconButton.module.css';

const ICONS = {
  grid: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={styles.icon}
    >
      <rect x="3.5" y="5" width="2" height="2" fill="currentColor" stroke="none" />
      <line x1="9" y1="6" x2="20.5" y2="6" />
      <rect x="3.5" y="11" width="2" height="2" fill="currentColor" stroke="none" />
      <line x1="9" y1="12" x2="20.5" y2="12" />
      <rect x="3.5" y="17" width="2" height="2" fill="currentColor" stroke="none" />
      <line x1="9" y1="18" x2="20.5" y2="18" />
    </svg>
  ),
  slide: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={styles.icon}
    >
      <rect x="3" y="4" width="14" height="12" />
      <polyline points="7 19.5 20.5 19.5 20.5 8" />
    </svg>
  ),
  prev: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={styles.icon}
    >
      <polyline points="15 6 9 12 15 18" />
    </svg>
  ),
  next: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={styles.icon}
    >
      <polyline points="9 6 15 12 9 18" />
    </svg>
  ),
  up: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={styles.icon}
    >
      <polyline points="6 15 12 9 18 15" />
    </svg>
  ),
  down: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={styles.icon}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
};

export default function CircleIconButton({
  icon = 'grid',
  variant = 'circle',
  ariaLabel,
  onClick,
  className = '',
}) {
  const classes = [
    styles.button,
    variant === 'plainLarge' ? styles.plainLarge : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      aria-label={ariaLabel || icon}
      onClick={onClick}
    >
      {ICONS[icon] || ICONS.grid}
    </button>
  );
}
