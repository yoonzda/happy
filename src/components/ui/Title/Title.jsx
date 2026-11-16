import React, { useState, useEffect, useRef } from 'react';
import styles from './Title.module.css';

const CHOSEONG = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];

const COMPOUND_VOWEL_BASE = {
  9: 8,
  10: 8,
  11: 8,
  14: 13,
  15: 13,
  16: 13,
  19: 18,
};

function buildKoreanTypingSteps(text) {
  const steps = [];
  let accumulated = '';

  for (const char of Array.from(text)) {
    const code = char.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) {
      const offset = code - 0xac00;
      const cho = Math.floor(offset / 588);
      const jung = Math.floor((offset % 588) / 28);
      const jong = offset % 28;

      steps.push(accumulated + CHOSEONG[cho]);

      if (COMPOUND_VOWEL_BASE[jung] !== undefined) {
        const baseSyllable = String.fromCharCode(
          0xac00 + cho * 588 + COMPOUND_VOWEL_BASE[jung] * 28
        );
        steps.push(accumulated + baseSyllable);
      }

      const openSyllable = String.fromCharCode(0xac00 + cho * 588 + jung * 28);
      steps.push(accumulated + openSyllable);

      if (jong > 0) {
        steps.push(accumulated + char);
      }

      accumulated += char;
    } else {
      accumulated += char;
      steps.push(accumulated);
    }
  }

  return steps;
}

export default function Title({
  children,
  variant = 'hero',
  as: Tag = 'h1',
  typing = false,
  showCursor = false,
  typingSpeed = 74,
  startDelay = 0,
  onTypingComplete,
  className = '',
}) {
  const fullText = typeof children === 'string' ? children : String(children ?? '');
  const [displayedText, setDisplayedText] = useState(typing ? '' : fullText);
  const [isDone, setIsDone] = useState(!typing);
  const onCompleteRef = useRef(onTypingComplete);
  onCompleteRef.current = onTypingComplete;

  useEffect(() => {
    if (!typing) {
      setDisplayedText(fullText);
      setIsDone(true);
      return;
    }

    const steps = buildKoreanTypingSteps(fullText);
    setDisplayedText('');
    setIsDone(false);

    if (steps.length === 0) {
      setIsDone(true);
      onCompleteRef.current?.();
      return;
    }

    let stepIdx = 0;
    let interval = null;
    let completeTimer = null;

    const startTimer = setTimeout(() => {
      interval = setInterval(() => {
        setDisplayedText(steps[stepIdx]);
        stepIdx += 1;

        if (stepIdx >= steps.length) {
          clearInterval(interval);
          setIsDone(true);
          completeTimer = setTimeout(() => {
            onCompleteRef.current?.();
          }, 160);
        }
      }, typingSpeed);
    }, startDelay);

    return () => {
      clearTimeout(startTimer);
      if (interval) clearInterval(interval);
      if (completeTimer) clearTimeout(completeTimer);
    };
  }, [fullText, typing, typingSpeed, startDelay]);

  const classes = [styles.title, styles[variant] || styles.hero, className]
    .filter(Boolean)
    .join(' ');

  if (!typing && !showCursor) {
    return <Tag className={classes}>{children}</Tag>;
  }

  return (
    <Tag className={classes} aria-label={fullText}>
      <span>{displayedText}</span>
      <span
        className={[styles.cursor, isDone ? styles.cursorBlink : '']
          .filter(Boolean)
          .join(' ')}
        aria-hidden="true"
      />
    </Tag>
  );
}
