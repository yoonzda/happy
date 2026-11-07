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
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
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

