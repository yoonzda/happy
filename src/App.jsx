import React, { useState, useEffect } from 'react';
import initialProjects from './data/projects.json';
import CircleIconButton from './components/ui/CircleIconButton/CircleIconButton';
import SlideView from './components/views/SlideView/SlideView';
import BentoGridView from './components/views/BentoGridView/BentoGridView';
import AdminView from './components/views/AdminView/AdminView';
import styles from './App.module.css';

const STORAGE_KEY = 'happy_portfolio_projects_v3';
const LEGACY_KEYS = [
  'happy_portfolio_projects_v3',
  'happy_portfolio_projects_v2',
  'happy_portfolio_projects_v1',
];

function loadSavedProjects() {
  try {
    for (const key of LEGACY_KEYS) {
      const saved = localStorage.getItem(key);
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
  const [projects, setProjects] = useState(() => {
    return loadSavedProjects() || initialProjects;
  });

  const [viewMode, setViewMode] = useState('slide'); // 'slide' | 'grid'
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
        onSaveProjects={handleSaveProjects}
        onClose={handleCloseAdmin}
      />
    );
  }

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'slide' ? 'grid' : 'slide'));
  };

  return (
    <>
      <div className={styles.topRightToggle}>
        <CircleIconButton
          icon={viewMode === 'slide' ? 'grid' : 'slide'}
          ariaLabel={
            viewMode === 'slide' ? '목록 보기로 전환' : '슬라이드 보기로 전환'
          }
          onClick={toggleViewMode}
        />
      </div>

      {viewMode === 'slide' ? (
        <SlideView
          projects={projects}
          currentIndex={currentSlideIndex}
          onChangeIndex={setCurrentSlideIndex}
        />
      ) : (
        <BentoGridView projects={projects} />
      )}
    </>
  );
}
