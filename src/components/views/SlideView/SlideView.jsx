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
}) {
  const total = projects.length;
  const [flipDirection, setFlipDirection] = useState('next');
  const [isTitleDone, setIsTitleDone] = useState(false);
  const wheelLockRef = useRef(false);
  const touchStartRef = useRef(null);

  const safeIndex = total > 0 ? ((currentIndex % total) + total) % total : 0;

  useEffect(() => {
    setIsTitleDone(false);
  }, [safeIndex]);

  const goPrev = useCallback(() => {
    if (total === 0) return;
    setFlipDirection('prev');
    onChangeIndex((prev) => (prev - 1 + total) % total);
  }, [total, onChangeIndex]);

  const goNext = useCallback(() => {
    if (total === 0) return;
    setFlipDirection('next');
    onChangeIndex((prev) => (prev + 1) % total);
  }, [total, onChangeIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        goPrev();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        goNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goPrev, goNext]);

  const handleWheel = (e) => {
    if (wheelLockRef.current || total <= 1) return;
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

  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current || !e.changedTouches?.[0]) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(deltaY) >= Math.abs(deltaX) && Math.abs(deltaY) > 40) {
      if (deltaY < 0) {
        goNext();
      } else {
        goPrev();
      }
    } else if (Math.abs(deltaX) > 45) {
      if (deltaX < 0) {
        goNext();
      } else {
        goPrev();
      }
    }
  };

  if (total === 0) {
    return (
      <main className={styles.container}>
        <p className={styles.emptyState}>등록된 프로젝트가 없습니다.</p>
      </main>
    );
  }

  const currentProject = projects[safeIndex];
  const formattedCurrent = String(safeIndex + 1).padStart(2, '0');
  const formattedTotal = String(total).padStart(2, '0');

  return (
    <main
      className={styles.container}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div key={currentProject.id || safeIndex} className={styles.centerContent}>
        <Title
          variant="hero"
          as="h1"
          typing
          typingSpeed={74}
          onTypingComplete={() => setIsTitleDone(true)}
        >
          {currentProject.title}
        </Title>

        <div
          className={[
            styles.subReveal,
            isTitleDone ? styles.subRevealVisible : '',
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
              isTitleDone ? styles.subRevealVisible : '',
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
