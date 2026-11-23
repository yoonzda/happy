import React, { useState, useEffect, useMemo } from 'react';
import Title from '../../ui/Title/Title';
import TextLinkButton from '../../ui/TextLinkButton/TextLinkButton';
import {
  filterProjects,
  countActiveFilters,
} from '../../../utils/filterProjects';
import styles from './BentoGridView.module.css';

function toggleFilterOption(map, groupId, option) {
  const prevVals = Array.isArray(map[groupId]) ? map[groupId] : [];
  const exists = prevVals.includes(option);
  const nextVals = exists
    ? prevVals.filter((v) => v !== option)
    : [...prevVals, option];
  const nextMap = { ...map };
  if (nextVals.length > 0) {
    nextMap[groupId] = nextVals;
  } else {
    delete nextMap[groupId];
  }
  return nextMap;
}

export default function BentoGridView({
  projects = [],
  filteredProjects,
  filterGroups = [],
  selectedFilters = {},
  onChangeFilters,
  onOpenDetail,
}) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState({});

  const visibleFilterGroups = useMemo(
    () =>
      (filterGroups || []).filter(
        (g) => g && Array.isArray(g.options) && g.options.length > 0
      ),
    [filterGroups]
  );

  const displayProjects = Array.isArray(filteredProjects)
    ? filteredProjects
    : projects;
  const activeFilterCount = countActiveFilters(selectedFilters);

  const draftMatchCount = useMemo(
    () => filterProjects(projects, draftFilters).length,
    [projects, draftFilters]
  );

  useEffect(() => {
    if (!isSheetOpen) return;

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSheetOpen(false);
      }
    };

    const mq = window.matchMedia('(min-width: 769px)');
    const handleMediaChange = (e) => {
      if (e.matches) {
        setIsSheetOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    mq.addEventListener('change', handleMediaChange);

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      mq.removeEventListener('change', handleMediaChange);
    };
  }, [isSheetOpen]);

  const handleToggleDesktopFilter = (groupId, option) => {
    onChangeFilters?.(toggleFilterOption(selectedFilters, groupId, option));
  };

  const handleResetFilters = () => {
    onChangeFilters?.({});
  };

  const handleOpenSheet = () => {
    const cloned = {};
    Object.entries(selectedFilters).forEach(([key, vals]) => {
      if (Array.isArray(vals) && vals.length > 0) {
        cloned[key] = [...vals];
      }
    });
    setDraftFilters(cloned);
    setIsSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
  };

  const handleToggleDraftFilter = (groupId, option) => {
    setDraftFilters((prev) => toggleFilterOption(prev, groupId, option));
  };

  const handleResetDraft = () => {
    setDraftFilters({});
  };

  const handleApplyDraft = () => {
    onChangeFilters?.(draftFilters);
    setIsSheetOpen(false);
  };

  return (
    <main className={styles.page}>
      <div className={styles.wrapper}>
        {visibleFilterGroups.length > 0 && (
          <>
            {/* Desktop Pill Filter Rows */}
            <section
              className={styles.desktopFilterBar}
              aria-label="프로젝트 필터"
            >
              {visibleFilterGroups.map((group) => {
                const selectedVals = Array.isArray(selectedFilters[group.id])
                  ? selectedFilters[group.id]
                  : [];
                return (
                  <div key={group.id} className={styles.filterRow}>
                    <span className={styles.filterGroupLabel}>
                      {group.label}
                    </span>
                    <div className={styles.filterPillGroup}>
                      {group.options.map((option) => {
                        const isActive = selectedVals.includes(option);
                        return (
                          <button
                            key={option}
                            type="button"
                            className={[
                              styles.filterPill,
                              isActive ? styles.filterPillActive : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            onClick={() =>
                              handleToggleDesktopFilter(group.id, option)
                            }
                            aria-pressed={isActive}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Mobile Fixed Top-Left Filter Square Button (matching top-right view button) */}
            <div className={styles.mobileFilterFabWrap}>
              <button
                type="button"
                className={styles.mobileFilterFab}
                onClick={handleOpenSheet}
                aria-label="프로젝트 필터 열기"
                aria-expanded={isSheetOpen}
                aria-haspopup="dialog"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  className={styles.mobileFilterFabIcon}
                  aria-hidden="true"
                >
                  <line x1="3.5" y1="6.5" x2="20.5" y2="6.5" />
                  <line x1="6.5" y1="12" x2="17.5" y2="12" />
                  <line x1="9.5" y1="17.5" x2="14.5" y2="17.5" />
                </svg>
              </button>
            </div>
          </>
        )}

        {displayProjects.length > 0 ? (
          <ul className={styles.list} aria-label="포트폴리오 목록">
            {displayProjects.map((project, index) => {
              const num = String(index + 1).padStart(2, '0');

              return (
                <li key={project.id || index} className={styles.row}>
                  <div className={styles.left}>
                    <span className={styles.index}>{num}</span>

                    <button
                      type="button"
                      className={styles.titleTrigger}
                      onClick={() => onOpenDetail?.(index)}
                      aria-label={`${project.title} 상세 설명 보기`}
                    >
                      <Title
                        variant="list"
                        as="span"
                        className={styles.listTitle}
                      >
                        {project.title}
                      </Title>
                    </button>
                  </div>

                  {project.links && project.links.length > 0 && (
                    <div className={styles.right}>
                      <div className={styles.linksGroup}>
                        {project.links.map((link, lIdx) => (
                          <TextLinkButton
                            key={`${link.label}-${lIdx}`}
                            href={link.url}
                            className={styles.rowLink}
                          >
                            {link.label}
                          </TextLinkButton>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className={styles.emptyState}>
            {activeFilterCount > 0 ? (
              <button
                type="button"
                className={styles.emptyCrossBtn}
                onClick={handleResetFilters}
                aria-label="해당하는 프로젝트 없음 — 필터 초기화"
              >
                <svg
                  viewBox="0 0 64 64"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="square"
                  className={styles.emptyCrossIcon}
                  aria-hidden="true"
                >
                  <line x1="10" y1="10" x2="54" y2="54" />
                  <line x1="54" y1="10" x2="10" y2="54" />
                </svg>
                <span className={styles.emptyCrossLabel}>필터 초기화</span>
              </button>
            ) : (
              <span
                className={styles.emptyCrossStatic}
                aria-label="등록된 프로젝트 없음"
              >
                <svg
                  viewBox="0 0 64 64"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="square"
                  className={styles.emptyCrossIcon}
                  aria-hidden="true"
                >
                  <line x1="10" y1="10" x2="54" y2="54" />
                  <line x1="54" y1="10" x2="10" y2="54" />
                </svg>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Mobile Bottom Sheet Filter */}
      {visibleFilterGroups.length > 0 && (
        <>
          <div
            className={[
              styles.sheetBackdrop,
              isSheetOpen ? styles.sheetBackdropOpen : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={handleCloseSheet}
            aria-hidden="true"
          />

          <div
            className={[
              styles.bottomSheet,
              isSheetOpen ? styles.bottomSheetOpen : '',
            ]
              .filter(Boolean)
              .join(' ')}
            role="dialog"
            aria-modal="true"
            aria-hidden={!isSheetOpen}
            aria-label="프로젝트 필터 선택"
          >
            <div className={styles.sheetHandleArea} aria-hidden="true">
              <span className={styles.sheetHandle} />
            </div>

            <div className={styles.sheetHeader}>
              <h2 className={styles.sheetTitle}>필터</h2>
              <button
                type="button"
                className={styles.sheetCloseBtn}
                onClick={handleCloseSheet}
                aria-label="필터 닫기"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </button>
            </div>

            <div className={styles.sheetBody}>
              {visibleFilterGroups.map((group) => {
                const draftVals = Array.isArray(draftFilters[group.id])
                  ? draftFilters[group.id]
                  : [];
                return (
                  <div key={group.id} className={styles.sheetGroup}>
                    <span className={styles.sheetGroupTitle}>
                      {group.label}
                    </span>
                    <div className={styles.sheetPillWrap}>
                      {group.options.map((option) => {
                        const isActive = draftVals.includes(option);
                        return (
                          <button
                            key={option}
                            type="button"
                            className={[
                              styles.filterPill,
                              styles.sheetPill,
                              isActive ? styles.filterPillActive : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            onClick={() =>
                              handleToggleDraftFilter(group.id, option)
                            }
                            aria-pressed={isActive}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.sheetFooter}>
              <button
                type="button"
                className={styles.sheetApplyBtn}
                onClick={handleApplyDraft}
              >
                적용하기 ({draftMatchCount})
              </button>
              <button
                type="button"
                className={styles.sheetResetBtn}
                onClick={handleResetDraft}
              >
                초기화
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
