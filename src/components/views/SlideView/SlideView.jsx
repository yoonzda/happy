import React, { useState, useEffect, useRef, useCallback } from 'react';
import Title from '../../ui/Title/Title';
import KeywordText from '../../ui/KeywordText/KeywordText';
import TextLinkButton from '../../ui/TextLinkButton/TextLinkButton';
import CircleIconButton from '../../ui/CircleIconButton/CircleIconButton';
import FlipCounter from '../../ui/FlipCounter/FlipCounter';
import styles from './SlideView.module.css';

export default function SlideView({
  projects = [],
  currentIndex = 0,
  onChangeIndex,
  paused = false,
  typedSlidesRef,
}) {
  const total = projects.length;
  const [flipDirection, setFlipDirection] = useState('next');
  const safeIndex = total > 0 ? ((currentIndex % total) + total) % total : 0;
  const currentProject = projects[safeIndex] || null;
  const slideKey = currentProject ? currentProject.id || safeIndex : safeIndex;

  const [skipAnim, setSkipAnim] = useState(() =>
    Boolean(typedSlidesRef?.current?.has(slideKey))
  );
  const [isTitleDone, setIsTitleDone] = useState(() =>
    Boolean(typedSlidesRef?.current?.has(slideKey))
  );
  const wheelLockRef = useRef(false);

  useEffect(() => {
    const doneBefore = Boolean(typedSlidesRef?.current?.has(slideKey));
    setSkipAnim(doneBefore);
    setIsTitleDone(doneBefore);
  }, [slideKey, typedSlidesRef]);

  const handleTypingComplete = () => {
    if (typedSlidesRef?.current) {
      typedSlidesRef.current.add(slideKey);
    }
    setIsTitleDone(true);
  };

  const goPrev = useCallback(() => {
    if (total === 0 || paused) return;
    setFlipDirection('prev');
    onChangeIndex((prev) => (prev - 1 + total) % total);
  }, [total, paused, onChangeIndex]);

  const goNext = useCallback(() => {
    if (total === 0 || paused) return;
    setFlipDirection('next');
    onChangeIndex((prev) => (prev + 1) % total);
  }, [total, paused, onChangeIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (paused) return;
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        goPrev();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        goNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goPrev, goNext, paused]);

  const handleWheel = (e) => {
    if (paused || wheelLockRef.current || total <= 1) return;

    // 화면 높이가 낮아 세로 스크롤바가 생긴 상태에서는 마우스 휠로 슬라이드를 넘기지 않음
    const hasVerticalScrollbar =
      document.documentElement.scrollHeight > window.innerHeight + 2;
    if (hasVerticalScrollbar) return;

    if (Math.abs(e.deltaY) < 25 && Math.abs(e.deltaX) < 25) return;

    wheelLockRef.current = true;
    if (e.deltaY > 0 || e.deltaX > 0) {
      goNext();
    } else {
      goPrev();
    }

    setTimeout(() => {
      wheelLockRef.current = false;
    }, 550);
  };

  if (total === 0) {
    return (
      <main className={styles.container}>
        <p className={styles.emptyState}>등록된 프로젝트가 없습니다.</p>
      </main>
    );
  }

  const formattedCurrent = String(safeIndex + 1).padStart(2, '0');
  const formattedTotal = String(total).padStart(2, '0');

  return (
    <main
      className={styles.container}
      onWheel={handleWheel}
    >
      <div key={slideKey} className={styles.centerContent}>
        <Title
          variant="hero"
          as="h1"
          typing={!skipAnim}
          showCursor
          typingSpeed={74}
          onTypingComplete={handleTypingComplete}
        >
          {currentProject.title}
        </Title>

        <div
          className={[
            styles.subReveal,
            skipAnim
              ? styles.subRevealInstant
              : isTitleDone
              ? styles.subRevealVisible
              : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <KeywordText keywords={currentProject.keywords} />
        </div>

        {currentProject.links && currentProject.links.length > 0 && (
          <nav
            className={[
              styles.linksGroup,
              styles.subReveal,
              skipAnim
                ? styles.subRevealInstant
                : isTitleDone
                ? styles.subRevealVisible
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-label="프로젝트 관련 링크"
          >
            {currentProject.links.map((link, idx) => (
              <TextLinkButton key={`${link.label}-${idx}`} href={link.url}>
                {link.label}
              </TextLinkButton>
            ))}
          </nav>
        )}
      </div>

      <div className={styles.navStack}>
        {total > 1 && (
          <CircleIconButton
            icon="up"
            variant="plainLarge"
            ariaLabel="이전 프로젝트"
            onClick={goPrev}
          />
        )}

        <FlipCounter
          current={formattedCurrent}
          total={formattedTotal}
          direction={flipDirection}
        />

        {total > 1 && (
          <CircleIconButton
            icon="down"
            variant="plainLarge"
            ariaLabel="다음 프로젝트"
            onClick={goNext}
          />
        )}
      </div>
    </main>
  );
}
