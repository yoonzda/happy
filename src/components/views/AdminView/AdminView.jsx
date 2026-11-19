import React, { useState, useRef } from 'react';
import Title from '../../ui/Title/Title';
import TextLinkButton from '../../ui/TextLinkButton/TextLinkButton';
import styles from './AdminView.module.css';

export default function AdminView({
  projects = [],
  profile = {},
  onSaveProjects,
  onSaveProfile,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'profile'

  // Projects state
  const [items, setItems] = useState(() =>
    projects.map((p) => ({
      ...p,
      period: p.period || '',
      role: p.role || '',
      description: p.description || '',
      keywords: Array.isArray(p.keywords) ? p.keywords : [],
      links:
        Array.isArray(p.links) && p.links.length > 0
          ? p.links
          : [{ label: '사이트 보러가기', url: 'https://' }],
    }))
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [keywordInput, setKeywordInput] = useState('');
  const dragFromRef = useRef(null);

  // Profile state
  const [profileData, setProfileData] = useState(() => ({
    headline: profile.headline || '기획부터 퍼블리싱까지, 윤지입니다',
    bio: profile.bio || '',
    phone: profile.phone || '010-8901-2559',
    email: profile.email || 'geeyounjee@gmail.com',
    keywords: Array.isArray(profile.keywords) ? profile.keywords : [],
    links: Array.isArray(profile.links) ? profile.links : [],
    sections: Array.isArray(profile.sections) ? profile.sections : [],
  }));
  const [profileSelectedIdx, setProfileSelectedIdx] = useState(-1); // -1 = Hero Intro, 0..N = sections
  const [profileKeywordInput, setProfileKeywordInput] = useState('');

  const [statusMsg, setStatusMsg] = useState('');

  const current = items[selectedIndex] || null;
  const currentSection =
    profileSelectedIdx >= 0
      ? profileData.sections[profileSelectedIdx] || null
      : null;

  const updateCurrent = (patch) => {
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === selectedIndex ? { ...item, ...patch } : item
      )
    );
  };

  const updateCurrentSection = (patch) => {
    setProfileData((prev) => ({
      ...prev,
      sections: prev.sections.map((sec, idx) =>
        idx === profileSelectedIdx ? { ...sec, ...patch } : sec
      ),
    }));
  };

  const handleSelectProject = (idx) => {
    setSelectedIndex(idx);
    setKeywordInput('');
  };

  const handleAddProject = () => {
    const newId = `proj-${Date.now()}`;
    const nextNum = String(items.length + 1).padStart(2, '0');
    const newProj = {
      id: newId,
      title: `새 프로젝트 ${nextNum}`,
      period: '',
      role: '',
      description: '',
      keywords: ['웹 디자인', '2026'],
      links: [
        { label: '웹사이트', url: 'https://github.com/yoonzda/happy' },
      ],
    };
    const nextList = [...items, newProj];
    setItems(nextList);
    setSelectedIndex(nextList.length - 1);
    setKeywordInput('');
    setStatusMsg('');
  };

  const handleDeleteCurrent = () => {
    if (!current) return;
    const nextList = items.filter((_, idx) => idx !== selectedIndex);
    setItems(nextList);
    setSelectedIndex(Math.max(0, selectedIndex - 1));
    setKeywordInput('');
    setStatusMsg('');
  };

  const handleAddKeyword = () => {
    if (!current) return;
    const raw = keywordInput.trim();
    if (!raw) return;

    const newWords = raw
      .split(',')
      .map((w) => w.trim())
      .filter(Boolean);

    if (newWords.length > 0) {
      const existing = current.keywords || [];
      const merged = [...existing];
      newWords.forEach((word) => {
        if (!merged.includes(word)) {
          merged.push(word);
        }
      });
      updateCurrent({ keywords: merged });
    }
    setKeywordInput('');
  };

  const handleKeywordKeyDown = (e) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleRemoveKeyword = (wordIndex) => {
    if (!current) return;
    const nextKeywords = (current.keywords || []).filter(
      (_, idx) => idx !== wordIndex
    );
    updateCurrent({ keywords: nextKeywords });
  };

  const handleDragStart = (index, e) => {
    dragFromRef.current = index;
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (targetIndex) => {
    const fromIndex = dragFromRef.current;
    if (fromIndex === null || fromIndex === targetIndex) return;

    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });

    if (selectedIndex === fromIndex) {
      setSelectedIndex(targetIndex);
    } else if (fromIndex < selectedIndex && targetIndex >= selectedIndex) {
      setSelectedIndex((s) => s - 1);
    } else if (fromIndex > selectedIndex && targetIndex <= selectedIndex) {
      setSelectedIndex((s) => s + 1);
    }

    dragFromRef.current = targetIndex;
    setDraggingIndex(targetIndex);
  };

  const handleDragEnd = () => {
    dragFromRef.current = null;
    setDraggingIndex(null);
  };

  const handleLinkChange = (linkIndex, field, value) => {
    if (!current) return;
    const updatedLinks = current.links.map((lnk, idx) =>
      idx === linkIndex ? { ...lnk, [field]: value } : lnk
    );
    updateCurrent({ links: updatedLinks });
  };

  const handleAddLink = () => {
    if (!current) return;
    updateCurrent({
      links: [...(current.links || []), { label: 'GitHub', url: 'https://' }],
    });
  };

  const handleRemoveLink = (linkIndex) => {
    if (!current) return;
    const updatedLinks = current.links.filter((_, idx) => idx !== linkIndex);
    updateCurrent({ links: updatedLinks });
  };

  // Profile handlers
  const handleAddProfileKeyword = () => {
    const raw = profileKeywordInput.trim();
    if (!raw) return;
    const newWords = raw
      .split(',')
      .map((w) => w.trim())
      .filter(Boolean);

    if (newWords.length > 0) {
      if (profileSelectedIdx === -1) {
        const merged = [...(profileData.keywords || [])];
        newWords.forEach((w) => {
          if (!merged.includes(w)) merged.push(w);
        });
        setProfileData((prev) => ({ ...prev, keywords: merged }));
      } else if (currentSection) {
        const merged = [...(currentSection.keywords || [])];
        newWords.forEach((w) => {
          if (!merged.includes(w)) merged.push(w);
        });
        updateCurrentSection({ keywords: merged });
      }
    }
    setProfileKeywordInput('');
  };

  const handleProfileKeywordKeyDown = (e) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddProfileKeyword();
    }
  };

  const handleRemoveProfileKeyword = (wordIdx) => {
    if (profileSelectedIdx === -1) {
      setProfileData((prev) => ({
        ...prev,
        keywords: (prev.keywords || []).filter((_, i) => i !== wordIdx),
      }));
    } else if (currentSection) {
      updateCurrentSection({
        keywords: (currentSection.keywords || []).filter(
          (_, i) => i !== wordIdx
        ),
      });
    }
  };

  const handleProfileLinkChange = (linkIndex, field, value) => {
    setProfileData((prev) => ({
      ...prev,
      links: (prev.links || []).map((lnk, idx) =>
        idx === linkIndex ? { ...lnk, [field]: value } : lnk
      ),
    }));
  };

  const handleAddProfileLink = () => {
    setProfileData((prev) => ({
      ...prev,
      links: [...(prev.links || []), { label: '링크 이름', url: 'https://' }],
    }));
  };

  const handleRemoveProfileLink = (linkIndex) => {
    setProfileData((prev) => ({
      ...prev,
      links: (prev.links || []).filter((_, idx) => idx !== linkIndex),
    }));
  };

  const handleAddProfileSection = () => {
    const nextNum = String(profileData.sections.length + 1).padStart(2, '0');
    const newSec = {
      id: `sec-${Date.now()}`,
      title: `새 소개 항목 ${nextNum}`,
      description: '항목에 대한 설명을 입력해 주세요.',
      keywords: ['키워드'],
    };
    const nextSections = [...profileData.sections, newSec];
    setProfileData((prev) => ({ ...prev, sections: nextSections }));
    setProfileSelectedIdx(nextSections.length - 1);
    setProfileKeywordInput('');
    setStatusMsg('');
  };

  const handleDeleteProfileSection = () => {
    if (profileSelectedIdx < 0) return;
    const nextSections = profileData.sections.filter(
      (_, idx) => idx !== profileSelectedIdx
    );
    setProfileData((prev) => ({ ...prev, sections: nextSections }));
    setProfileSelectedIdx(-1);
    setProfileKeywordInput('');
    setStatusMsg('');
  };

  const handleSaveAll = async () => {
    const normalizedProjects = items.map((item) => {
      const cleanLinks = (item.links || []).filter(
        (l) => l.label.trim() || l.url.trim()
      );
      return {
        id: item.id,
        title: item.title.trim() || '제목 없음',
        period: (item.period || '').trim(),
        role: (item.role || '').trim(),
        description: (item.description || '').trim(),
        keywords: Array.isArray(item.keywords) ? item.keywords : [],
        links: cleanLinks,
      };
    });

    const normalizedProfile = {
      headline: profileData.headline.trim() || '기획부터 퍼블리싱까지, 윤지입니다',
      bio: profileData.bio.trim(),
      phone: (profileData.phone || '').trim(),
      email: (profileData.email || '').trim(),
      keywords: Array.isArray(profileData.keywords) ? profileData.keywords : [],
      links: (profileData.links || []).filter(
        (l) => l.label.trim() || l.url.trim()
      ),
      sections: (profileData.sections || []).map((sec) => ({
        id: sec.id,
        title: sec.title.trim() || '항목 제목',
        description: sec.description.trim(),
        keywords: Array.isArray(sec.keywords) ? sec.keywords : [],
      })),
    };

    const resProj = await onSaveProjects(normalizedProjects);
    const resProf = onSaveProfile
      ? await onSaveProfile(normalizedProfile)
      : { savedToFile: true };

    if (resProj?.savedToFile && resProf?.savedToFile) {
      setStatusMsg('저장 완료');
    } else {
      setStatusMsg('저장됨');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <Title variant="section" as="h1">
              포트폴리오 관리
            </Title>

            <div className={styles.tabGroup}>
              <button
                type="button"
                className={[
                  styles.tabButton,
                  activeTab === 'projects' ? styles.tabButtonActive : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setActiveTab('projects')}
              >
                프로젝트 ({items.length})
              </button>
              <button
                type="button"
                className={[
                  styles.tabButton,
                  activeTab === 'profile' ? styles.tabButtonActive : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setActiveTab('profile')}
              >
                내 소개 (Profile)
              </button>
            </div>
          </div>

          <div className={styles.headerRight}>
            {statusMsg && (
              <span className={styles.statusMessage}>{statusMsg}</span>
            )}
            <button
              type="button"
              className={styles.navMainButton}
              onClick={onClose}
            >
              메인으로
            </button>
            <button
              type="button"
              className={styles.saveButton}
              onClick={handleSaveAll}
            >
              저장하기
            </button>
          </div>
        </header>

        {activeTab === 'projects' ? (
          <div className={styles.layout}>
            <aside className={styles.sidebar}>
              <div className={styles.sidebarHeader}>
                <span className={styles.sidebarTitle}>
                  전체 목록 ({items.length})
                </span>
                <TextLinkButton onClick={handleAddProject}>
                  + 프로젝트 추가
                </TextLinkButton>
              </div>

              <div className={styles.projectList}>
                {items.map((item, idx) => {
                  const isActive = idx === selectedIndex;
                  const isDragging = idx === draggingIndex;
                  return (
                    <div
                      key={item.id || idx}
                      draggable
                      onDragStart={(e) => handleDragStart(idx, e)}
                      onDragOver={(e) => e.preventDefault()}
                      onDragEnter={() => handleDragEnter(idx)}
                      onDragEnd={handleDragEnd}
                      className={[
                        styles.projectItem,
                        isActive ? styles.projectItemActive : '',
                        isDragging ? styles.projectItemDragging : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => handleSelectProject(idx)}
                    >
                      <div className={styles.projectItemInfo}>
                        <span className={styles.projectItemIndex}>
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className={styles.projectItemTitle}>
                          {item.title}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>

            <section className={styles.editor}>
              {current && (
                <>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>프로젝트 제목</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={current.title}
                      onChange={(e) =>
                        updateCurrent({ title: e.target.value })
                      }
                    />
                  </div>

                  <div className={styles.metaFieldRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>작업 기간 (선택)</label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="예: 2025.03 — 2025.05"
                        value={current.period || ''}
                        onChange={(e) =>
                          updateCurrent({ period: e.target.value })
                        }
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>담당 역할 (선택)</label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="예: 기획 · UI 디자인 · 퍼블리싱"
                        value={current.role || ''}
                        onChange={(e) =>
                          updateCurrent({ role: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>프로젝트 설명</label>
                    <textarea
                      rows={4}
                      className={styles.textarea}
                      placeholder="프로젝트 개요, 주요 기능, 작업 포인트 등을 자유롭게 적어 주세요."
                      value={current.description || ''}
                      onChange={(e) =>
                        updateCurrent({ description: e.target.value })
                      }
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>관련 키워드</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={handleKeywordKeyDown}
                    />
                    {current.keywords && current.keywords.length > 0 && (
                      <div className={styles.keywordChipList}>
                        {current.keywords.map((word, wIdx) => (
                          <span
                            key={`${word}-${wIdx}`}
                            className={styles.keywordChip}
                          >
                            <span>{word}</span>
                            <button
                              type="button"
                              className={styles.keywordChipRemove}
                              onClick={() => handleRemoveKeyword(wIdx)}
                              aria-label={`${word} 삭제`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={styles.fieldGroup}>
                    <div className={styles.sidebarHeader}>
                      <label className={styles.label}>연결 링크 목록</label>
                      <TextLinkButton onClick={handleAddLink}>
                        + 링크 추가
                      </TextLinkButton>
                    </div>

                    <div className={styles.linksList}>
                      {(current.links || []).map((lnk, lIdx) => (
                        <div key={lIdx} className={styles.linkRow}>
                          <input
                            type="text"
                            className={styles.input}
                            value={lnk.label}
                            onChange={(e) =>
                              handleLinkChange(lIdx, 'label', e.target.value)
                            }
                          />
                          <input
                            type="url"
                            className={styles.input}
                            value={lnk.url}
                            onChange={(e) =>
                              handleLinkChange(lIdx, 'url', e.target.value)
                            }
                          />
                          <button
                            type="button"
                            className={styles.removeBtn}
                            onClick={() => handleRemoveLink(lIdx)}
                          >
                            삭제
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.editorFooter}>
                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={handleDeleteCurrent}
                    >
                      이 프로젝트 삭제
                    </button>
                    <button
                      type="button"
                      className={styles.saveButton}
                      onClick={handleSaveAll}
                    >
                      변경사항 저장하기
                    </button>
                  </div>
                </>
              )}
            </section>
          </div>
        ) : (
          <div className={styles.layout}>
            <aside className={styles.sidebar}>
              <div className={styles.sidebarHeader}>
                <span className={styles.sidebarTitle}>내 소개 구성</span>
                <TextLinkButton onClick={handleAddProfileSection}>
                  + 하단 항목 추가
                </TextLinkButton>
              </div>

              <div className={styles.projectList}>
                <div
                  className={[
                    styles.projectItem,
                    profileSelectedIdx === -1 ? styles.projectItemActive : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => {
                    setProfileSelectedIdx(-1);
                    setProfileKeywordInput('');
                  }}
                >
                  <div className={styles.projectItemInfo}>
                    <span className={styles.projectItemIndex}>00</span>
                    <span className={styles.projectItemTitle}>
                      상단 인트로 (헤드라인·소개)
                    </span>
                  </div>
                </div>

                {profileData.sections.map((sec, idx) => {
                  const isActive = idx === profileSelectedIdx;
                  return (
                    <div
                      key={sec.id || idx}
                      className={[
                        styles.projectItem,
                        isActive ? styles.projectItemActive : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => {
                        setProfileSelectedIdx(idx);
                        setProfileKeywordInput('');
                      }}
                    >
                      <div className={styles.projectItemInfo}>
                        <span className={styles.projectItemIndex}>
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className={styles.projectItemTitle}>
                          {sec.title}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>

            <section className={styles.editor}>
              {profileSelectedIdx === -1 ? (
                <>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>
                      상단 타이핑 헤드라인 (Title)
                    </label>
                    <input
                      type="text"
                      className={styles.input}
                      value={profileData.headline}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          headline: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>
                      자기소개 본문 (==단어==로 감싸면 노란 형광펜 표시)
                    </label>
                    <textarea
                      rows={3}
                      className={styles.textarea}
                      value={profileData.bio}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          bio: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>연락처 (전화번호 / 이메일)</label>
                    <div className={styles.linkRow}>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="전화번호"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                      />
                      <input
                        type="email"
                        className={styles.input}
                        placeholder="이메일"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>대표 키워드</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={profileKeywordInput}
                      onChange={(e) => setProfileKeywordInput(e.target.value)}
                      onKeyDown={handleProfileKeywordKeyDown}
                    />
                    {profileData.keywords && profileData.keywords.length > 0 && (
                      <div className={styles.keywordChipList}>
                        {profileData.keywords.map((word, wIdx) => (
                          <span
                            key={`${word}-${wIdx}`}
                            className={styles.keywordChip}
                          >
                            <span>{word}</span>
                            <button
                              type="button"
                              className={styles.keywordChipRemove}
                              onClick={() => handleRemoveProfileKeyword(wIdx)}
                              aria-label={`${word} 삭제`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={styles.fieldGroup}>
                    <div className={styles.sidebarHeader}>
                      <label className={styles.label}>상단 프로필 링크</label>
                      <TextLinkButton onClick={handleAddProfileLink}>
                        + 링크 추가
                      </TextLinkButton>
                    </div>

                    <div className={styles.linksList}>
                      {(profileData.links || []).map((lnk, lIdx) => (
                        <div key={lIdx} className={styles.linkRow}>
                          <input
                            type="text"
                            className={styles.input}
                            value={lnk.label}
                            onChange={(e) =>
                              handleProfileLinkChange(
                                lIdx,
                                'label',
                                e.target.value
                              )
                            }
                          />
                          <input
                            type="url"
                            className={styles.input}
                            value={lnk.url}
                            onChange={(e) =>
                              handleProfileLinkChange(
                                lIdx,
                                'url',
                                e.target.value
                              )
                            }
                          />
                          <button
                            type="button"
                            className={styles.removeBtn}
                            onClick={() => handleRemoveProfileLink(lIdx)}
                          >
                            삭제
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.editorFooter}>
                    <span />
                    <button
                      type="button"
                      className={styles.saveButton}
                      onClick={handleSaveAll}
                    >
                      변경사항 저장하기
                    </button>
                  </div>
                </>
              ) : (
                currentSection && (
                  <>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>항목 제목</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={currentSection.title}
                        onChange={(e) =>
                          updateCurrentSection({ title: e.target.value })
                        }
                      />
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>항목 설명</label>
                      <textarea
                        rows={3}
                        className={styles.textarea}
                        value={currentSection.description}
                        onChange={(e) =>
                          updateCurrentSection({ description: e.target.value })
                        }
                      />
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>관련 키워드</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={profileKeywordInput}
                        onChange={(e) => setProfileKeywordInput(e.target.value)}
                        onKeyDown={handleProfileKeywordKeyDown}
                      />
                      {currentSection.keywords &&
                        currentSection.keywords.length > 0 && (
                          <div className={styles.keywordChipList}>
                            {currentSection.keywords.map((word, wIdx) => (
                              <span
                                key={`${word}-${wIdx}`}
                                className={styles.keywordChip}
                              >
                                <span>{word}</span>
                                <button
                                  type="button"
                                  className={styles.keywordChipRemove}
                                  onClick={() =>
                                    handleRemoveProfileKeyword(wIdx)
                                  }
                                  aria-label={`${word} 삭제`}
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                    </div>

                    <div className={styles.editorFooter}>
                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={handleDeleteProfileSection}
                      >
                        이 항목 삭제
                      </button>
                      <button
                        type="button"
                        className={styles.saveButton}
                        onClick={handleSaveAll}
                      >
                        변경사항 저장하기
                      </button>
                    </div>
                  </>
                )
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
