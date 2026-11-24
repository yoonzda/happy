import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Title from '../Title/Title';
import KeywordText from '../KeywordText/KeywordText';
import {
  normalizeDetailList,
  normalizeProjectImages,
} from '../../../utils/detailList';
import styles from './ProjectDetailPanel.module.css';

export default function ProjectDetailPanel({
  isOpen = false,
  plainTransition = false,
  project = null,
  projects = [],
  currentIndex = 0,
  prevProject = null,
  nextProject = null,
  prevIndex = 0,
  nextIndex = 0,
  totalCount = 0,
  onSelectIndex,
  onPrev,
  onNext,
  onClose,
}) {
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const selectWrapRef = useRef(null);
  const bodyRef = useRef(null);
  const lightboxStageRef = useRef(null);

  const projectImages = normalizeProjectImages(project?.images);
  const imageCount = projectImages.length;

  useEffect(() => {
    if (!isOpen) {
      setIsSelectOpen(false);
      setIsLightboxOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setIsSelectOpen(false);
    setIsLightboxOpen(false);
    setLightboxIndex(0);
    if (bodyRef.current) {
      bodyRef.current.scrollTop = 0;
    }
  }, [project?.id]);

  useEffect(() => {
    if (!isSelectOpen) return;
    const handlePointerDown = (e) => {
      if (selectWrapRef.current && !selectWrapRef.current.contains(e.target)) {
        setIsSelectOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isSelectOpen]);

  useEffect(() => {
    if (isLightboxOpen && lightboxStageRef.current) {
      lightboxStageRef.current.scrollTop = 0;
    }
  }, [isLightboxOpen, lightboxIndex]);

  const stepLightbox = useCallback(
    (delta) => {
      if (imageCount <= 1) return;
      setLightboxIndex((prev) => (prev + delta + imageCount) % imageCount);
    },
    [imageCount]
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (isLightboxOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setIsLightboxOpen(false);
        } else if (e.key === 'ArrowLeft' && imageCount > 1) {
          e.preventDefault();
          stepLightbox(-1);
        } else if (e.key === 'ArrowRight' && imageCount > 1) {
          e.preventDefault();
          stepLightbox(1);
        }
        return;
      }

      if (isSelectOpen && e.key === 'Escape') {
        e.preventDefault();
        setIsSelectOpen(false);
        return;
      }

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
  }, [
    isOpen,
    isLightboxOpen,
    isSelectOpen,
    imageCount,
    stepLightbox,
    onClose,
    onPrev,
    onNext,
  ]);

  const hasMeta = Boolean(project?.period || project?.role);
  const hasDescription = Boolean(project?.description?.trim());
  const detailItems = normalizeDetailList(project?.detailList);
  const hasDetailList = detailItems.length > 0;
  const projectLinks = Array.isArray(project?.links)
    ? project.links.filter((l) => l && (l.label || l.url))
    : [];
  const hasActions = imageCount > 0 || projectLinks.length > 0;

  const safeLightboxIndex =
    imageCount > 0
      ? ((lightboxIndex % imageCount) + imageCount) % imageCount
      : 0;
  const activeImage = projectImages[safeLightboxIndex] || null;

  const handleOpenLightbox = () => {
    if (imageCount === 0) return;
    setIsSelectOpen(false);
    setLightboxIndex(0);
    setIsLightboxOpen(true);
  };

  const handlePickProject = (idx) => {
    setIsSelectOpen(false);
    onSelectIndex?.(idx);
  };

  const lightboxNode =
    isOpen && isLightboxOpen && activeImage && typeof document !== 'undefined'
      ? createPortal(
          <div
            className={styles.lightbox}
            role="dialog"
            aria-modal="true"
            aria-label={`${project?.title || '프로젝트'} 화면 보기`}
          >
            <div className={styles.lightboxTop}>
              <span className={styles.lightboxCounter}>
                {String(safeLightboxIndex + 1).padStart(2, '0')} /{' '}
                {String(imageCount).padStart(2, '0')}
              </span>
              <button
                type="button"
                className={styles.lightboxClose}
                aria-label="화면 보기 닫기"
                onClick={() => setIsLightboxOpen(false)}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="square"
                  aria-hidden="true"
                >
                  <line x1="4" y1="4" x2="20" y2="20" />
                  <line x1="20" y1="4" x2="4" y2="20" />
                </svg>
              </button>
            </div>

            <div
              ref={lightboxStageRef}
              className={[
                styles.lightboxStage,
                imageCount <= 1 ? styles.lightboxStageSingle : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsLightboxOpen(false);
                }
              }}
            >
              <div
                className={styles.lightboxFrame}
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setIsLightboxOpen(false);
                  }
                }}
              >
                <img
                  src={activeImage.src}
                  alt={activeImage.caption || `${project?.title || ''} 화면`}
                  className={styles.lightboxImg}
                />
              </div>
            </div>

            {imageCount > 1 && (
              <>
                <button
                  type="button"
                  className={[styles.lightboxNav, styles.lightboxPrev].join(' ')}
                  aria-label="이전 이미지"
                  onClick={() => stepLightbox(-1)}
                >
                  <svg
                    className={styles.lightboxNavIcon}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    aria-hidden="true"
                  >
                    <polyline points="15.5 3.5 7 12 15.5 20.5" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={[styles.lightboxNav, styles.lightboxNext].join(' ')}
                  aria-label="다음 이미지"
                  onClick={() => stepLightbox(1)}
                >
                  <svg
                    className={styles.lightboxNavIcon}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    aria-hidden="true"
                  >
                    <polyline points="8.5 3.5 17 12 8.5 20.5" />
                  </svg>
                </button>
              </>
            )}

            <div className={styles.lightboxBottom}>
              {activeImage.caption || ''}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <aside
        className={[
          styles.overlay,
          plainTransition ? styles.overlayPlain : '',
          isOpen ? styles.overlayOpen : '',
        ]
          .filter(Boolean)
          .join(' ')}
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        aria-label={project ? `${project.title} 프로젝트 설명` : '프로젝트 설명'}
      >
        {/* Top Bar with unified Close (X) and paired Project List Select on the left */}
        <div className={styles.topBar}>
          <div className={styles.topBarLeftCluster}>
            <button
              type="button"
              className={styles.closeBtn}
              aria-label="프로젝트 설명 닫기"
              onClick={onClose}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="square"
                aria-hidden="true"
              >
                <line x1="4" y1="4" x2="20" y2="20" />
                <line x1="20" y1="4" x2="4" y2="20" />
              </svg>
            </button>

            {projects.length > 1 && project && (
              <>
                <span className={styles.topBarDivider} aria-hidden="true" />
                <div className={styles.projectSelectWrap} ref={selectWrapRef}>
                  <button
                    type="button"
                    className={[
                      styles.projectSelectBtn,
                      isSelectOpen ? styles.projectSelectBtnOpen : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-haspopup="listbox"
                    aria-expanded={isSelectOpen}
                    onClick={() => setIsSelectOpen((prev) => !prev)}
                  >
                    <span className={styles.projectSelectLabel}>
                      프로젝트 목록
                    </span>
                    <svg
                      className={[
                        styles.projectSelectChevron,
                        isSelectOpen ? styles.projectSelectChevronOpen : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="square"
                      aria-hidden="true"
                    >
                      <polyline points="3.5 6 8 10.5 12.5 6" />
                    </svg>
                  </button>

                  {isSelectOpen && (
                    <div
                      className={styles.projectSelectMenu}
                      role="listbox"
                      aria-label="프로젝트 목록"
                    >
                      {projects.map((item, idx) => {
                        const isSelected = idx === currentIndex;
                        return (
                          <button
                            key={item.id ?? `${item.title}-${idx}`}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            className={[
                              styles.projectSelectOption,
                              isSelected
                                ? styles.projectSelectOptionActive
                                : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            onClick={() => handlePickProject(idx)}
                          >
                            <span className={styles.projectSelectOptNum}>
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <span className={styles.projectSelectOptTitle}>
                              {item.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Scrollable Middle Area: centered when short, scrolls cleanly when tall */}
        <div className={styles.body} ref={bodyRef}>
          {project && (
            <div className={styles.bodyInner}>
              <div
                className={[
                  styles.splitGrid,
                  hasDetailList ? '' : styles.splitGridSingle,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className={styles.leftCol}>
                  <div className={styles.leftTop}>
                    <header className={styles.titleGroup}>
                      <Title
                        variant="section"
                        as="h2"
                        className={styles.panelTitle}
                      >
                        {project.title}
                      </Title>
                      {project.keywords && project.keywords.length > 0 && (
                        <KeywordText keywords={project.keywords} align="left" />
                      )}
                    </header>

                    {hasDescription ? (
                      <p className={styles.description}>{project.description}</p>
                    ) : (
                      <p className={styles.emptyDesc}>
                        아직 등록된 프로젝트 설명이 없습니다. 관리
                        페이지(/admin)에서 기간·담당 역할·설명을 입력해 주세요.
                      </p>
                    )}

                    {hasMeta && (
                      <dl className={styles.metaList}>
                        {project.period && (
                          <div className={styles.metaRow}>
                            <dt className={styles.metaLabel}>작업 기간</dt>
                            <dd className={styles.metaValue}>
                              {project.period}
                            </dd>
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
                  </div>

                  {hasActions && (
                    <div className={styles.actionBar}>
                      {imageCount > 0 && (
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={handleOpenLightbox}
                        >
                          <span className={styles.rollMask}>
                            <span className={styles.rollFaceA}>화면 보기</span>
                            <span
                              className={styles.rollFaceB}
                              aria-hidden="true"
                            >
                              화면 보기
                            </span>
                          </span>
                        </button>
                      )}

                      {projectLinks.map((lnk, idx) => {
                        const href = lnk.url || '#';
                        const isExternal =
                          href.startsWith('http://') ||
                          href.startsWith('https://');
                        const label = lnk.label || '바로가기';
                        return (
                          <a
                            key={`${label}-${idx}`}
                            href={href}
                            target={isExternal ? '_blank' : undefined}
                            rel={isExternal ? 'noopener noreferrer' : undefined}
                            className={styles.actionBtn}
                          >
                            <span className={styles.rollMask}>
                              <span className={styles.rollFaceA}>{label}</span>
                              <span
                                className={styles.rollFaceB}
                                aria-hidden="true"
                              >
                                {label}
                              </span>
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>

                {hasDetailList && (
                  <section
                    className={styles.rightCol}
                    aria-label="프로젝트 세부 내용"
                  >
                    <div className={styles.cardStack}>
                      {detailItems.map((item, idx) => (
                        <article key={idx} className={styles.pointCard}>
                          <div className={styles.pointHeader}>
                            <span className={styles.pointNum}>
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            {item.title && (
                              <h3 className={styles.pointTitle}>
                                {item.title}
                              </h3>
                            )}
                          </div>
                          {item.description && (
                            <p className={styles.pointDesc}>
                              {item.description}
                            </p>
                          )}
                        </article>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Slim Single-Line Footer: Prev / Next */}
        {totalCount > 1 && (
          <footer className={styles.footer}>
            <div className={styles.footerInner}>
              <button
                type="button"
                className={[styles.footerNavBtn, styles.footerNavPrev].join(
                  ' '
                )}
                aria-label={
                  prevProject ? `이전 프로젝트: ${prevProject.title}` : '이전 프로젝트'
                }
                onClick={onPrev}
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="square"
                  className={styles.footerChevron}
                  aria-hidden="true"
                >
                  <polyline points="10.5 3 5.5 8 10.5 13" />
                </svg>
                {prevProject && (
                  <span className={styles.footerNavTitle}>
                    {prevProject.title}
                  </span>
                )}
              </button>

              <span className={styles.footerCenterLine} aria-hidden="true" />

              <button
                type="button"
                className={[styles.footerNavBtn, styles.footerNavNext].join(
                  ' '
                )}
                aria-label={
                  nextProject ? `다음 프로젝트: ${nextProject.title}` : '다음 프로젝트'
                }
                onClick={onNext}
              >
                {nextProject && (
                  <span className={styles.footerNavTitle}>
                    {nextProject.title}
                  </span>
                )}
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="square"
                  className={styles.footerChevron}
                  aria-hidden="true"
                >
                  <polyline points="5.5 3 10.5 8 5.5 13" />
                </svg>
              </button>
            </div>
          </footer>
        )}
      </aside>

      {lightboxNode}
    </>
  );
}
