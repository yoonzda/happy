import React, { useEffect } from 'react';
import Title from '../Title/Title';
import KeywordText from '../KeywordText/KeywordText';
import styles from './ProjectDetailPanel.module.css';

export default function ProjectDetailPanel({
  isOpen = false,
  project = null,
  prevProject = null,
  nextProject = null,
  prevIndex = 0,
  nextIndex = 0,
  totalCount = 0,
  onPrev,
  onNext,
  onClose,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      } else if (e.key === 'ArrowLeft') {
        onPrev?.();
      } else if (e.key === 'ArrowRight') {
        onNext?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onPrev, onNext]);

  const hasMeta = Boolean(project?.period || project?.role);
  const hasDescription = Boolean(project?.description?.trim());

  const formattedPrevNum = String(prevIndex + 1).padStart(2, '0');
  const formattedNextNum = String(nextIndex + 1).padStart(2, '0');

  return (
    <aside
      className={[styles.overlay, isOpen ? styles.overlayOpen : '']
        .filter(Boolean)
        .join(' ')}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
      aria-label={project ? `${project.title} 프로젝트 설명` : '프로젝트 설명'}
    >
      {/* Top Safe Spacer for fixed top-left X button */}
      <div className={styles.headerSpacerBar} aria-hidden="true" />

      {/* Scrollable Middle Area: centered when short, scrolls cleanly when tall */}
      <div className={styles.body}>
        {project && (
          <div className={styles.bodyInner}>
            <div className={styles.titleBlock}>
              <Title variant="section" as="h2" className={styles.panelTitle}>
                {project.title}
              </Title>
              {project.keywords && project.keywords.length > 0 && (
                <KeywordText keywords={project.keywords} align="left" />
              )}
            </div>

            {hasMeta && (
              <dl className={styles.metaList}>
                {project.period && (
                  <div className={styles.metaRow}>
                    <dt className={styles.metaLabel}>작업 기간</dt>
                    <dd className={styles.metaValue}>{project.period}</dd>
                  </div>
                )}
                {project.role && (
                  <div className={styles.metaRow}>
                    <dt className={styles.metaLabel}>담당 역할</dt>
                    <dd className={styles.metaValue}>{project.role}</dd>
                  </div>
                )}
              </dl>
            )}

            <section className={styles.descSection}>
              <span className={styles.shortDivider} aria-hidden="true" />
              {hasDescription ? (
                <p className={styles.description}>{project.description}</p>
              ) : (
                <p className={styles.emptyDesc}>
                  아직 등록된 프로젝트 설명이 없습니다. 관리 페이지(/admin)에서
                  기간·담당 역할·설명을 입력해 주세요.
                </p>
              )}
            </section>
          </div>
        )}
      </div>

      {/* Fixed Editorial Split Footer: Prev / Next */}
      {totalCount > 1 && (
        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <button
              type="button"
              className={[styles.footerNavBtn, styles.footerNavPrev].join(' ')}
              onClick={onPrev}
            >
              <span className={styles.footerMetaRow}>
                <svg
                  viewBox="0 0 28 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="square"
                  className={styles.longArrow}
                  aria-hidden="true"
                >
                  <line x1="26" y1="7" x2="3" y2="7" />
                  <polyline points="8.5 1.5 2.5 7 8.5 12.5" />
                </svg>
                <span className={styles.footerNavNum}>{formattedPrevNum}</span>
              </span>
              {prevProject && (
                <span className={styles.footerNavTitle}>
                  {prevProject.title}
                </span>
              )}
            </button>

            <span className={styles.footerCenterLine} aria-hidden="true" />

            <button
              type="button"
              className={[styles.footerNavBtn, styles.footerNavNext].join(' ')}
              onClick={onNext}
            >
              <span className={styles.footerMetaRow}>
                <span className={styles.footerNavNum}>{formattedNextNum}</span>
                <svg
                  viewBox="0 0 28 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="square"
                  className={styles.longArrow}
                  aria-hidden="true"
                >
                  <line x1="2" y1="7" x2="25" y2="7" />
                  <polyline points="19.5 1.5 25.5 7 19.5 12.5" />
                </svg>
              </span>
              {nextProject && (
                <span className={styles.footerNavTitle}>
                  {nextProject.title}
                </span>
              )}
            </button>
          </div>
        </footer>
      )}
    </aside>
  );
}
