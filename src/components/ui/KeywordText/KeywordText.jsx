import React from 'react';
import styles from './KeywordText.module.css';

export default function KeywordText({ keywords = [], className = '' }) {
  if (!keywords || keywords.length === 0) return null;

  return (
    <ul className={[styles.list, className].filter(Boolean).join(' ')}>
      {keywords.map((word, index) => (
        <li key={`${word}-${index}`} className={styles.item}>
          {word}
        </li>
      ))}
    </ul>
  );
}
