import React, { useState, useEffect, useRef } from 'react';
import styles from './FlipCounter.module.css';

export default function FlipCounter({
  current = '01',
  total = '15',
  direction = 'next',
}) {
  const [prevValue, setPrevValue] = useState(current);
  const [isFlipping, setIsFlipping] = useState(false);
  const [activeDir, setActiveDir] = useState('next');
  const [flipKey, setFlipKey] = useState(0);
  const lastCurrentRef = useRef(current);

  useEffect(() => {
    if (current !== lastCurrentRef.current) {
      setPrevValue(lastCurrentRef.current);
      lastCurrentRef.current = current;
      setActiveDir(direction);
      setIsFlipping(true);
      setFlipKey((k) => k + 1);

      const timer = setTimeout(() => {
        setIsFlipping(false);
        setPrevValue(current);
      }, 420);

      return () => clearTimeout(timer);
    }
  }, [current, direction]);

  const isReverse = activeDir === 'prev';

  return (
    <div
      className={styles.wrapper}
      aria-live="polite"
      aria-label={`현재 ${current}, 전체 ${total}`}
    >
      <div className={styles.flipUnit}>
        {/* Static Top Half */}
        <div className={styles.halfTop}>
          <span className={styles.digitText}>
            {isFlipping && isReverse ? prevValue : current}
          </span>
        </div>

        {/* Static Bottom Half */}
        <div className={styles.halfBottom}>
          <span className={styles.digitText}>
            {isFlipping && !isReverse ? prevValue : current}
          </span>
        </div>

        {/* Animated 3D Flaps */}
        {isFlipping && !isReverse && (
          <React.Fragment key={flipKey}>
            <div className={styles.flapTopDown}>
              <span className={styles.digitText}>{prevValue}</span>
            </div>
            <div className={styles.flapBottomDown}>
              <span className={styles.digitText}>{current}</span>
            </div>
          </React.Fragment>
        )}

        {isFlipping && isReverse && (
          <React.Fragment key={flipKey}>
            <div className={styles.flapBottomUp}>
              <span className={styles.digitText}>{prevValue}</span>
            </div>
            <div className={styles.flapTopUp}>
              <span className={styles.digitText}>{current}</span>
            </div>
          </React.Fragment>
        )}

        <div className={styles.crease} />
      </div>

      <span className={styles.slash} aria-hidden="true">
        /
      </span>

      <div className={styles.totalUnit}>
        <span>{total}</span>
        <div className={styles.crease} />
      </div>
    </div>
  );
}
