import React from 'react';
import styles from './KeywordText.module.css';

export default function KeywordText({
  keywords = [],
  align = 'center',
  className = '',
}) {
  if (!keywords || keywords.length === 0) return null;

  const classes = [
    styles.list,
    align === 'left' ? styles.alignLeft : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <ul className={classes}>
      {keywords.map((word, index) => {
        const formatted = String(word).startsWith('#') ? word : `#${word}`;
        return (
          <li key={`${word}-${index}`} className={styles.item}>
            {formatted}
          </li>
        );
      })}
    </ul>
  );
}
