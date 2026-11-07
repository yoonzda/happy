import React, { useState } from 'react';
import Title from '../../ui/Title/Title';
import TextLinkButton from '../../ui/TextLinkButton/TextLinkButton';
import CircleIconButton from '../../ui/CircleIconButton/CircleIconButton';
import styles from './AdminView.module.css';

export default function AdminView({
  projects = [],
  onSaveProjects,
  onClose,
}) {
  const [items, setItems] = useState(() =>
    projects.map((p) => ({
      ...p,
      keywordsText: Array.isArray(p.keywords) ? p.keywords.join(', ') : '',
      links:
        Array.isArray(p.links) && p.links.length > 0
          ? p.links
          : [{ label: '사이트 보러가기', url: 'https://' }],
    }))
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');

  const current = items[selectedIndex] || null;

  const updateCurrent = (patch) => {
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === selectedIndex ? { ...item, ...patch } : item
      )
    );
  };

  const handleAddProject = () => {
    const newId = `proj-${Date.now()}`;
    const nextNum = String(items.length + 1).padStart(2, '0');
    const newProj = {
      id: newId,
      title: `새 프로젝트 ${nextNum}`,
      keywords: ['웹 디자인', '2026'],
      keywordsText: '웹 디자인, 2026',
      image: `/images/sample-${((items.length % 15) + 1)
        .toString()
        .padStart(2, '0')}.svg`,
      gridSpan: 'auto',
      hoverZoom: 'in',
      links: [{ label: '사이트 보러가기', url: 'https://github.com/yoonzda/happy' }],
    };
    const nextList = [...items, newProj];
    setItems(nextList);
    setSelectedIndex(nextList.length - 1);
    setStatusMsg('새 프로젝트 항목이 추가되었습니다. 내용을 수정한 뒤 저장하세요.');
  };

  const handleDeleteCurrent = () => {
    if (!current) return;
    const nextList = items.filter((_, idx) => idx !== selectedIndex);
    setItems(nextList);
    setSelectedIndex(Math.max(0, selectedIndex - 1));
    setStatusMsg('항목이 삭제되었습니다. 저장하기를 눌러 반영하세요.');
  };

  const handleMove = (index, direction, e) => {
    e.stopPropagation();
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const copy = [...items];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    setItems(copy);
    setSelectedIndex(targetIndex);
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

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      try {
        const res = await fetch('/__local_api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, dataUrl }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.ok && data.url) {
            updateCurrent({ image: data.url });
            setStatusMsg(`이미지가 업로드되었습니다 (${data.url})`);
            return;
          }
        }
      } catch {
        // Fallback to dataUrl when not running local Vite dev server
      }
      updateCurrent({ image: dataUrl });
      setStatusMsg('이미지가 적용되었습니다.');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAll = async () => {
    const normalized = items.map((item) => {
      const keywords = (item.keywordsText ?? '')
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);
      const cleanLinks = (item.links || []).filter(
        (l) => l.label.trim() || l.url.trim()
      );
      return {
        id: item.id,
        title: item.title.trim() || '제목 없음',
        keywords,
        image: item.image || '',
        gridSpan: item.gridSpan || 'auto',
        hoverZoom: item.hoverZoom || 'in',
        links: cleanLinks,
      };
    });

    const result = await onSaveProjects(normalized);
    if (result?.savedToFile) {
      setStatusMsg('저장 완료 (src/data/projects.json 파일에 즉시 반영됨)');
    } else {
      setStatusMsg('브라우저에 저장되었습니다.');
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
              className={styles.saveButton}
              onClick={handleSaveAll}
            >
              저장하기
            </button>
            <CircleIconButton
              icon="close"
              ariaLabel="관리 페이지 닫기"
              onClick={onClose}
            />
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
                return (
                  <div
                    key={item.id || idx}
                    className={[
                      styles.projectItem,
                      isActive ? styles.projectItemActive : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => setSelectedIndex(idx)}
                  >
                    <div className={styles.projectItemInfo}>
                      <span className={styles.projectItemIndex}>
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className={styles.projectItemTitle}>
                        {item.title}
                      </span>
                    </div>

                    <div className={styles.orderControls}>
                      <button
                        type="button"
                        className={styles.smallBtn}
                        onClick={(e) => handleMove(idx, -1, e)}
                        aria-label="위로 이동"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className={styles.smallBtn}
                        onClick={(e) => handleMove(idx, 1, e)}
                        aria-label="아래로 이동"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          <section className={styles.editor}>
            {current ? (
              <>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>프로젝트 제목</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={current.title}
                    onChange={(e) => updateCurrent({ title: e.target.value })}
                    placeholder="프로젝트 제목을 입력하세요"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    관련 키워드 (쉼표로 구분)
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    value={current.keywordsText}
                    onChange={(e) =>
                      updateCurrent({ keywordsText: e.target.value })
                    }
                    placeholder="예: 브랜드 아이덴티티, 웹 디자인, 2026"
                  />
                  <span className={styles.hint}>
                    슬라이드 뷰에서 캡슐 없이 순수 텍스트로 나열됩니다.
                  </span>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>그리드 타일 이미지</label>
                  <div className={styles.imageRow}>
                    <input
                      type="text"
                      className={styles.input}
                      style={{ flex: 1 }}
                      value={current.image || ''}
                      onChange={(e) => updateCurrent({ image: e.target.value })}
                      placeholder="/images/sample-01.svg 또는 이미지 URL"
                    />
                    <label className={styles.fileLabel}>
                      이미지 파일 선택
                      <input
                        type="file"
                        accept="image/*"
                        className={styles.fileInput}
                        onChange={handleImageFileUpload}
                      />
                    </label>
                  </div>
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>그리드 타일 모양</label>
                    <select
                      className={styles.select}
                      value={current.gridSpan || 'auto'}
                      onChange={(e) =>
                        updateCurrent({ gridSpan: e.target.value })
                      }
                    >
                      <option value="auto">
                        레퍼런스 패턴 자동 맞춤 (Auto)
                      </option>
                      <option value="2x1">가로형 (2×1)</option>
                      <option value="1x2">세로형 (1×2)</option>
                      <option value="1x1">기본형 (1×1)</option>
                      <option value="3x1">전체 폭 배너형 (3×1)</option>
                    </select>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>
                      그리드 호버 시 이미지 효과
                    </label>
                    <select
                      className={styles.select}
                      value={current.hoverZoom || 'in'}
                      onChange={(e) =>
                        updateCurrent({ hoverZoom: e.target.value })
                      }
                    >
                      <option value="in">영역 내 이미지 확대 (Zoom In)</option>
                      <option value="out">영역 내 이미지 축소 (Zoom Out)</option>
                    </select>
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <div className={styles.sidebarHeader}>
                    <label className={styles.label}>연결 링크 목록</label>
                    <TextLinkButton onClick={handleAddLink}>
                      + 링크 추가
                    </TextLinkButton>
                  </div>
                  <span className={styles.hint}>
                    첫 번째 링크가 그리드 타일 클릭 시 새 창으로 열리는 대표
                    링크로 사용됩니다.
                  </span>

                  <div className={styles.linksList}>
                    {(current.links || []).map((lnk, lIdx) => (
                      <React.Fragment key={lIdx}>
                        {lIdx === 0 && (
                          <span className={styles.primaryBadge}>
                            대표 링크 (그리드 타일 & 슬라이드 첫 번째 링크)
                          </span>
                        )}
                        <div className={styles.linkRow}>
                          <input
                            type="text"
                            className={styles.input}
                            value={lnk.label}
                            onChange={(e) =>
                              handleLinkChange(lIdx, 'label', e.target.value)
                            }
                            placeholder="링크 텍스트 (예: 사이트 보러가기)"
                          />
                          <input
                            type="url"
                            className={styles.input}
                            value={lnk.url}
                            onChange={(e) =>
                              handleLinkChange(lIdx, 'url', e.target.value)
                            }
                            placeholder="https://..."
                          />
                          <button
                            type="button"
                            className={styles.smallBtn}
                            onClick={() => handleRemoveLink(lIdx)}
                          >
                            삭제
                          </button>
                        </div>
                      </React.Fragment>
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
            ) : (
              <p className={styles.hint}>
                좌측 목록에서 프로젝트를 선택하거나 추가하세요.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
