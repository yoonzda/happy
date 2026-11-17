import React from 'react';
import styles from './TextLinkButton.module.css';

export default function TextLinkButton({
  href,
  children,
  onClick,
  className = '',
}) {
  const classes = [styles.link, className].filter(Boolean).join(' ');

  if (href) {
    const isExternalWeb =
      href.startsWith('http://') || href.startsWith('https://');
    return (
      <a
        href={href}
        target={isExternalWeb ? '_blank' : undefined}
        rel={isExternalWeb ? 'noopener noreferrer' : undefined}
        className={classes}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={classes} onClick={onClick}>
      {children}
    </button>
  );
}
