import React, { useState, useEffect, useRef } from 'react';
import initialProjects from './data/projects.json';
import initialProfile from './data/profile.json';
import CircleIconButton from './components/ui/CircleIconButton/CircleIconButton';
import ProjectDetailPanel from './components/ui/ProjectDetailPanel/ProjectDetailPanel';
import SlideView from './components/views/SlideView/SlideView';
import BentoGridView from './components/views/BentoGridView/BentoGridView';
import AdminView from './components/views/AdminView/AdminView';
import styles from './App.module.css';

const STORAGE_KEY = 'happy_portfolio_projects_v3';
const PROFILE_STORAGE_KEY = 'happy_portfolio_profile_v8';

function loadSavedProjects() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(
          ({ id, title, keywords, links, period, role, description }) => ({
            id,
            title,
            keywords: Array.isArray(keywords) ? keywords : [],
            links: Array.isArray(links) ? links : [],
            period: period || '',
            role: role || '',
            description: description || '',
          })
        );
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

  const handleSaveProjects = async (updatedList) => {
    setProjects(updatedList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    } catch {
      // ignore storage errors
    }

    try {
      const res = await fetch('/__local_api/projects', {
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

  const handleSaveProfile = async (updatedProfile) => {
    setProfile(updatedProfile);
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
    } catch {
      // ignore storage errors
    }

    try {
      const res = await fetch('/__local_api/profile', {
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

  if (isAdmin) {
    return (
      <AdminView
        projects={projects}
        profile={profile}
        onSaveProjects={handleSaveProjects}
        onSaveProfile={handleSaveProfile}
        onClose={handleCloseAdmin}
      />
    );
  }

  const safeSlideIndex =
    projects.length > 0
      ? ((currentSlideIndex % projects.length) + projects.length) %
        projects.length
      : 0;

  const safeDetailIndex =
    projects.length > 0
      ? ((detailIndex % projects.length) + projects.length) % projects.length
      : 0;

  const handleToggleTopLeftDetail = () => {
    if (isDetailOpen) {
      setIsDetailOpen(false);
    } else if (projects.length > 0) {
      setDetailIndex(safeSlideIndex);
      setIsDetailOpen(true);
    }
  };

  const handleOpenListDetail = (idx) => {
    setDetailIndex(idx);
    setIsDetailOpen(true);
  };

  const handleDetailPrev = () => {
    if (projects.length === 0) return;
    const prevIdx = (safeDetailIndex - 1 + projects.length) % projects.length;
    setDetailIndex(prevIdx);
    if (viewMode === 'slide') {
      setCurrentSlideIndex(prevIdx);
    }
  };

  const handleDetailNext = () => {
    if (projects.length === 0) return;
    const nextIdx = (safeDetailIndex + 1) % projects.length;
    setDetailIndex(nextIdx);
    if (viewMode === 'slide') {
      setCurrentSlideIndex(nextIdx);
    }
  };

  const handleToggleViewMode = () => {
    setIsDetailOpen(false);
    setViewMode((prev) => (prev === 'slide' ? 'grid' : 'slide'));
  };

  const activeDetailProject = projects[safeDetailIndex] || null;
  const prevDetailIndex =
    projects.length > 1
      ? (safeDetailIndex - 1 + projects.length) % projects.length
      : 0;
  const nextDetailIndex =
    projects.length > 1 ? (safeDetailIndex + 1) % projects.length : 0;
  const prevDetailProject =
    projects.length > 1 ? projects[prevDetailIndex] : null;
  const nextDetailProject =
    projects.length > 1 ? projects[nextDetailIndex] : null;
  const showTopLeftButton =
    projects.length > 0 && (viewMode === 'slide' || isDetailOpen);

  return (
    <>
      {showTopLeftButton && (
        <div className={styles.topLeftToggle}>
          <CircleIconButton
            icon="infoMorph"
            isOpen={isDetailOpen}
            variant={isDetailOpen ? 'darkSolid' : 'circle'}
            ariaLabel={
              isDetailOpen ? '프로젝트 설명 닫기' : '프로젝트 설명 보기'
            }
            onClick={handleToggleTopLeftDetail}
          />
        </div>
      )}

      <div className={styles.topRightToggle}>
        <CircleIconButton
          icon={viewMode === 'slide' ? 'grid' : 'slide'}
          ariaLabel={
            viewMode === 'slide' ? '목록 보기로 전환' : '슬라이드 보기로 전환'
          }
          onClick={handleToggleViewMode}
        />
      </div>

      {viewMode === 'slide' ? (
        <SlideView
          projects={projects}
          currentIndex={currentSlideIndex}
          onChangeIndex={setCurrentSlideIndex}
          paused={isDetailOpen}
          typedSlidesRef={typedSlidesRef}
        />
      ) : (
        <BentoGridView
          projects={projects}
          onOpenDetail={handleOpenListDetail}
        />
      )}

      <ProjectDetailPanel
        isOpen={isDetailOpen}
        project={activeDetailProject}
        prevProject={prevDetailProject}
        nextProject={nextDetailProject}
        prevIndex={prevDetailIndex}
        nextIndex={nextDetailIndex}
        totalCount={projects.length}
        onPrev={handleDetailPrev}
        onNext={handleDetailNext}
        onClose={() => setIsDetailOpen(false)}
      />
    </>
  );
}
