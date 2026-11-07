import React, { useEffect, useRef, useCallback } from 'react';
import Title from '../../ui/Title/Title';
import KeywordText from '../../ui/KeywordText/KeywordText';
import TextLinkButton from '../../ui/TextLinkButton/TextLinkButton';
import CircleIconButton from '../../ui/CircleIconButton/CircleIconButton';
import styles from './SlideView.module.css';

export default function SlideView({
  projects = [],
  currentIndex = 0,
  onChangeIndex,
}) {
  const total = projects.length;
  const wheelLockRef = useRef(false);
  const touchStartXRef = useRef(null);

  const goPrev = useCallback(() => {
    if (total === 0) return;
    onChangeIndex((prev) => (prev - 1 + total) % total);
  }, [total, onChangeIndex]);

  const goNext = useCallback(() => {
    if (total === 0) return;
    onChangeIndex((prev) => (prev + 1) % total);
  }, [total, onChangeIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        goPrev();
      } else if (e.key === 'ArrowRight') {
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
      touchStartXRef.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null || !e.changedTouches?.[0]) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    touchStartXRef.current = null;

    if (Math.abs(deltaX) > 45) {
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

  const safeIndex = ((currentIndex % total) + total) % total;
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
      {total > 1 && (
        <div className={styles.navPrev}>
          <CircleIconButton
            icon="prev"
            ariaLabel="이전 프로젝트"
            onClick={goPrev}
          />
        </div>
      )}

      <div key={currentProject.id || safeIndex} className={styles.centerContent}>
        <Title variant="hero" as="h1">
          {currentProject.title}
        </Title>

        <KeywordText keywords={currentProject.keywords} />

        {currentProject.links && currentProject.links.length > 0 && (
          <nav className={styles.linksGroup} aria-label="프로젝트 관련 링크">
            {currentProject.links.map((link, idx) => (
              <TextLinkButton key={`${link.label}-${idx}`} href={link.url}>
                {link.label}
              </TextLinkButton>
            ))}
          </nav>
        )}
      </div>

      {total > 1 && (
        <div className={styles.navNext}>
          <CircleIconButton
            icon="next"
            ariaLabel="다음 프로젝트"
            onClick={goNext}
          />
        </div>
      )}

      <div className={styles.indexCounter} aria-live="polite">
        {formattedCurrent} / {formattedTotal}
      </div>
    </main>
  );
}
