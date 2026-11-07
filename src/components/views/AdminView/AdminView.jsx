import React, { useState, useRef } from 'react';
import Title from '../../ui/Title/Title';
import TextLinkButton from '../../ui/TextLinkButton/TextLinkButton';
import styles from './AdminView.module.css';

export default function AdminView({
  projects = [],
  onSaveProjects,
  onClose,
}) {
  const [items, setItems] = useState(() =>
    projects.map((p) => ({
      ...p,
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
  const [statusMsg, setStatusMsg] = useState('');
  const dragFromRef = useRef(null);

  const current = items[selectedIndex] || null;

  const updateCurrent = (patch) => {
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === selectedIndex ? { ...item, ...patch } : item
      )
    );
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
      keywords: ['웹 디자인', '2026'],
      links: [
        { label: '사이트 보러가기', url: 'https://github.com/yoonzda/happy' },
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

  const handleSaveAll = async () => {
    const normalized = items.map((item) => {
      const cleanLinks = (item.links || []).filter(
        (l) => l.label.trim() || l.url.trim()
      );
      return {
        id: item.id,
        title: item.title.trim() || '제목 없음',
        keywords: Array.isArray(item.keywords) ? item.keywords : [],
        links: cleanLinks,
      };
    });

    const result = await onSaveProjects(normalized);
    if (result?.savedToFile) {
      setStatusMsg('저장 완료');
    } else {
      setStatusMsg('저장됨');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <Title variant="section" as="h1">
            포트폴리오 관리
          </Title>

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
                    onChange={(e) => updateCurrent({ title: e.target.value })}
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
      </div>
    </div>
  );
}
