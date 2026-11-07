import React from 'react';
import styles from './Title.module.css';

export default function Title({
  children,
  variant = 'hero',
  as: Tag = 'h1',
  className = '',
}) {
  const classes = [styles.title, styles[variant] || styles.hero, className]
    .filter(Boolean)
    .join(' ');

  return <Tag className={classes}>{children}</Tag>;
}
