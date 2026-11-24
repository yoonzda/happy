import React, { useState, useEffect, useRef, useMemo } from 'react';
import initialProjects from './data/projects.json';
import initialProfile from './data/profile.json';
import initialFilters from './data/filters.json';
import { filterProjects } from './utils/filterProjects';
import ProjectDetailPanel from './components/ui/ProjectDetailPanel/ProjectDetailPanel';
import SlideView from './components/views/SlideView/SlideView';
import BentoGridView from './components/views/BentoGridView/BentoGridView';
import AdminView from './components/views/AdminView/AdminView';
import styles from './App.module.css';

const STORAGE_KEY = 'happy_portfolio_projects_v4';
const PROFILE_STORAGE_KEY = 'happy_portfolio_profile_v8';
const FILTERS_STORAGE_KEY = 'happy_portfolio_filters_v2';

function loadSavedProjects() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(
          ({
            id,
            title,
            keywords,
            links,
            period,
            role,
            description,
            detailListTitle,
            detailList,
            images,
            filters,
            hidden,
          }) => ({
            id,
            title,
            keywords: Array.isArray(keywords) ? keywords : [],
            links: Array.isArray(links) ? links : [],
            period: period || '',
            role: role || '',
            description: description || '',
            detailListTitle: detailListTitle || '',
            detailList: Array.isArray(detailList) ? detailList : [],
            images: Array.isArray(images) ? images : [],
            filters:
              filters && typeof filters === 'object' && !Array.isArray(filters)
                ? filters
                : {},
            hidden: Boolean(hidden),
          })
        );
      }
    }
  } catch {
    // ignore storage errors
  }
  return null;
}

function loadSavedFilters() {
  try {
    const saved = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((g) => g && typeof g === 'object' && g.id)
          .map((g) => ({
            id: String(g.id),
            label: String(g.label || ''),
            options: Array.isArray(g.options)
              ? g.options.map((o) => String(o)).filter(Boolean)
              : [],
          }));
      }
    }
  } catch {
    // ignore storage errors
  }
  return null;
}

function loadSavedProfile() {
  try {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && parsed.headline) {
        return parsed;
      }
    }
  } catch {
    // ignore storage errors
  }
  return null;
}

function checkIsAdminRoute() {
  return (
    window.location.pathname === '/admin' ||
    window.location.pathname.endsWith('/admin') ||
    window.location.hash === '#admin'
  );
}

export default function App() {
  const [projects, setProjects] = useState(
    () => loadSavedProjects() || initialProjects
  );
  const [profile, setProfile] = useState(
    () => loadSavedProfile() || initialProfile
  );
  const [filterGroups, setFilterGroups] = useState(
    () => loadSavedFilters() || initialFilters
  );
  const [selectedFilters, setSelectedFilters] = useState({});

  const [viewMode, setViewMode] = useState('slide'); // 'slide' | 'grid'
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailIndex, setDetailIndex] = useState(0);
  const typedSlidesRef = useRef(new Set());

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAdmin, setIsAdmin] = useState(checkIsAdminRoute);

  useEffect(() => {
    const syncRoute = () => {
      setIsAdmin(checkIsAdminRoute());
    };
    window.addEventListener('hashchange', syncRoute);
    window.addEventListener('popstate', syncRoute);
    return () => {
      window.removeEventListener('hashchange', syncRoute);
      window.removeEventListener('popstate', syncRoute);
    };
  }, []);

  useEffect(() => {
    if (isDetailOpen && !isAdmin) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isDetailOpen, isAdmin]);

  const handleSaveProjects = async (updatedList, { skipBuild = false } = {}) => {
    setProjects(updatedList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    } catch {
      // ignore storage errors
    }

    try {
      const url = skipBuild
        ? '/__local_api/projects?skipBuild=1'
        : '/__local_api/projects';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedList),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          return { savedToFile: true };
        }
      }
    } catch {
      // Fallback when not running Vite dev server
    }
    return { savedToFile: false };
  };

  const handleSaveFilters = async (
    updatedFilters,
    { skipBuild = false } = {}
  ) => {
    setFilterGroups(updatedFilters);
    setSelectedFilters((prev) => {
      const next = {};
      updatedFilters.forEach((group) => {
        const prevVals = Array.isArray(prev[group.id]) ? prev[group.id] : [];
        const valid = prevVals.filter((val) => group.options.includes(val));
        if (valid.length > 0) {
          next[group.id] = valid;
        }
      });
      return next;
    });
    try {
      localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(updatedFilters));
    } catch {
      // ignore storage errors
    }

    try {
      const url = skipBuild
        ? '/__local_api/filters?skipBuild=1'
        : '/__local_api/filters';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFilters),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          return { savedToFile: true };
        }
      }
    } catch {
      // Fallback when not running Vite dev server
    }
    return { savedToFile: false };
  };

  const handleSaveProfile = async (
    updatedProfile,
    { skipBuild = false } = {}
  ) => {
    setProfile(updatedProfile);
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
    } catch {
      // ignore storage errors
    }

    try {
      const url = skipBuild
        ? '/__local_api/profile?skipBuild=1'
        : '/__local_api/profile';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          return { savedToFile: true };
        }
      }
    } catch {
      // Fallback when not running Vite dev server
    }
    return { savedToFile: false };
  };

  const handleCloseAdmin = () => {
    if (window.location.hash === '#admin') {
      window.history.pushState('', document.title, window.location.pathname);
    } else if (window.location.pathname.endsWith('/admin')) {
      const basePath = window.location.pathname.replace(/\/admin$/, '') || '/';
      window.history.pushState({}, '', basePath);
    }
    setIsAdmin(false);
  };

  const visibleProjects = useMemo(
    () => projects.filter((p) => !p.hidden),
    [projects]
  );

  const filteredGridProjects = useMemo(
    () => filterProjects(visibleProjects, selectedFilters),
    [visibleProjects, selectedFilters]
  );

  if (isAdmin) {
    return (
      <AdminView
        projects={projects}
        profile={profile}
        filterGroups={filterGroups}
        onSaveProjects={handleSaveProjects}
        onSaveProfile={handleSaveProfile}
        onSaveFilters={handleSaveFilters}
        onClose={handleCloseAdmin}
      />
    );
  }

  const safeSlideIndex =
    visibleProjects.length > 0
      ? ((currentSlideIndex % visibleProjects.length) +
          visibleProjects.length) %
        visibleProjects.length
      : 0;

  const detailProjects =
    viewMode === 'grid' ? filteredGridProjects : visibleProjects;

  const safeDetailIndex =
    detailProjects.length > 0
      ? ((detailIndex % detailProjects.length) + detailProjects.length) %
        detailProjects.length
      : 0;

  const handleToggleTopLeftDetail = () => {
    if (isDetailOpen) {
      setIsDetailOpen(false);
    } else if (detailProjects.length > 0) {
      setDetailIndex(viewMode === 'grid' ? 0 : safeSlideIndex);
      setIsDetailOpen(true);
    }
  };

  const handleOpenListDetail = (idx) => {
    setDetailIndex(idx);
    setIsDetailOpen(true);
  };

  const handleDetailPrev = () => {
    if (detailProjects.length === 0) return;
    const prevIdx =
      (safeDetailIndex - 1 + detailProjects.length) % detailProjects.length;
    setDetailIndex(prevIdx);
    if (viewMode === 'slide') {
      setCurrentSlideIndex(prevIdx);
    }
  };

  const handleDetailNext = () => {
    if (detailProjects.length === 0) return;
    const nextIdx = (safeDetailIndex + 1) % detailProjects.length;
    setDetailIndex(nextIdx);
    if (viewMode === 'slide') {
      setCurrentSlideIndex(nextIdx);
    }
  };

  const handleSelectDetailIndex = (targetIdx) => {
    if (detailProjects.length === 0) return;
    const clamped =
      ((targetIdx % detailProjects.length) + detailProjects.length) %
      detailProjects.length;
    setDetailIndex(clamped);
    if (viewMode === 'slide') {
      setCurrentSlideIndex(clamped);
    }
  };

  const handleToggleViewMode = () => {
    setIsDetailOpen(false);
    setViewMode((prev) => (prev === 'slide' ? 'grid' : 'slide'));
  };

  const activeDetailProject = detailProjects[safeDetailIndex] || null;
  const prevDetailIndex =
    detailProjects.length > 1
      ? (safeDetailIndex - 1 + detailProjects.length) % detailProjects.length
      : 0;
  const nextDetailIndex =
    detailProjects.length > 1
      ? (safeDetailIndex + 1) % detailProjects.length
      : 0;
  const prevDetailProject =
    detailProjects.length > 1 ? detailProjects[prevDetailIndex] : null;
  const nextDetailProject =
    detailProjects.length > 1 ? detailProjects[nextDetailIndex] : null;
  const hasFilterGroups = filterGroups.some(
    (g) => Array.isArray(g.options) && g.options.length > 0
  );
  const showTopLeftButton = detailProjects.length > 0;
  const shiftTopLeftForMobileFilter = viewMode === 'grid' && hasFilterGroups;
  const viewSwitchLabel = viewMode === 'slide' ? '목록보기' : '슬라이드';

  return (
    <>
      {showTopLeftButton && (
        <div
          className={[
            styles.topLeftToggle,
            shiftTopLeftForMobileFilter ? styles.topLeftWithFilter : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <button
            type="button"
            className={styles.topActionBtn}
            onClick={handleToggleTopLeftDetail}
          >
            <span className={styles.topActionRoll}>
              <span className={styles.topActionFaceA}>설명보기</span>
              <span className={styles.topActionFaceB} aria-hidden="true">
                설명보기
              </span>
            </span>
          </button>
        </div>
      )}

      <div className={styles.topRightToggle}>
        <button
          type="button"
          className={styles.topActionBtn}
          onClick={handleToggleViewMode}
        >
          <span className={styles.topActionRoll}>
            <span className={styles.topActionFaceA}>{viewSwitchLabel}</span>
            <span className={styles.topActionFaceB} aria-hidden="true">
              {viewSwitchLabel}
            </span>
          </span>
        </button>
      </div>

      {viewMode === 'slide' ? (
        <div className={styles.slideStageOuter}>
          <div
            className={[
              styles.slideStage,
              isDetailOpen ? styles.slideStageShifted : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <SlideView
              projects={visibleProjects}
              currentIndex={currentSlideIndex}
              onChangeIndex={setCurrentSlideIndex}
              paused={isDetailOpen}
              typedSlidesRef={typedSlidesRef}
            />
          </div>
        </div>
      ) : (
        <BentoGridView
          projects={visibleProjects}
          filteredProjects={filteredGridProjects}
          filterGroups={filterGroups}
          selectedFilters={selectedFilters}
          onChangeFilters={setSelectedFilters}
          onOpenDetail={handleOpenListDetail}
        />
      )}

      <ProjectDetailPanel
        isOpen={isDetailOpen}
        plainTransition={viewMode === 'grid'}
        project={activeDetailProject}
        projects={detailProjects}
        currentIndex={safeDetailIndex}
        prevProject={prevDetailProject}
        nextProject={nextDetailProject}
        prevIndex={prevDetailIndex}
        nextIndex={nextDetailIndex}
        totalCount={detailProjects.length}
        onSelectIndex={handleSelectDetailIndex}
        onPrev={handleDetailPrev}
        onNext={handleDetailNext}
        onClose={() => setIsDetailOpen(false)}
      />
    </>
  );
}
