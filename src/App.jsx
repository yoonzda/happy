import React, { useState, useEffect, useRef } from 'react';
import initialProjects from './data/projects.json';
import initialProfile from './data/profile.json';
import CircleIconButton from './components/ui/CircleIconButton/CircleIconButton';
import SlideView from './components/views/SlideView/SlideView';
import BentoGridView from './components/views/BentoGridView/BentoGridView';
import ProfileView from './components/views/ProfileView/ProfileView';
import AdminView from './components/views/AdminView/AdminView';
import styles from './App.module.css';

const STORAGE_KEY = 'happy_portfolio_projects_v3';
const PROFILE_STORAGE_KEY = 'happy_portfolio_profile_v4';

function loadSavedProjects() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(({ id, title, keywords, links }) => ({
          id,
          title,
          keywords: Array.isArray(keywords) ? keywords : [],
          links: Array.isArray(links) ? links : [],
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

  const [viewMode, setViewMode] = useState('slide'); // 'slide' | 'grid'
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [hasSeenProfileIntro, setHasSeenProfileIntro] = useState(false);
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
    if (isProfileOpen && !isAdmin) {
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
  }, [isProfileOpen, isAdmin]);

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

  const toggleProfileMode = () => {
    setIsProfileOpen((prev) => !prev);
  };

  const togglePortfolioViewMode = () => {
    setViewMode((prev) => (prev === 'slide' ? 'grid' : 'slide'));
  };

  return (
    <>
      <div className={styles.topLeftToggle}>
        <CircleIconButton
          icon="introMorph"
          isOpen={isProfileOpen}
          variant={isProfileOpen ? 'darkSolid' : 'circle'}
          ariaLabel={
            isProfileOpen ? '포트폴리오로 돌아가기' : '내 소개 보기'
          }
          onClick={toggleProfileMode}
        />
      </div>

      <div className={styles.topRightToggle}>
        <CircleIconButton
          icon={viewMode === 'slide' ? 'grid' : 'slide'}
          ariaLabel={
            viewMode === 'slide' ? '목록 보기로 전환' : '슬라이드 보기로 전환'
          }
          onClick={togglePortfolioViewMode}
        />
      </div>

      {viewMode === 'slide' ? (
        <SlideView
          projects={projects}
          currentIndex={currentSlideIndex}
          onChangeIndex={setCurrentSlideIndex}
          paused={isProfileOpen}
          typedSlidesRef={typedSlidesRef}
        />
      ) : (
        <BentoGridView projects={projects} />
      )}

      <ProfileView
        isOpen={isProfileOpen}
        hasSeenIntro={hasSeenProfileIntro}
        onMarkSeenIntro={() => setHasSeenProfileIntro(true)}
        profile={profile}
        projectCount={projects.length}
        onReturnToPortfolio={() => setIsProfileOpen(false)}
      />
    </>
  );
}
