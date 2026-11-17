import React, { useState, useEffect, useRef } from 'react';
import Title from '../../ui/Title/Title';
import KeywordText from '../../ui/KeywordText/KeywordText';
import TextLinkButton from '../../ui/TextLinkButton/TextLinkButton';
import styles from './ProfileView.module.css';

function renderWithHighlight(text) {
  if (!text || typeof text !== 'string') return text;
  const parts = text.split(/(==[^=]+==)/g);
  return parts.map((part, index) => {
    if (part.startsWith('==') && part.endsWith('==') && part.length > 4) {
      const clean = part.slice(2, -2);
      return (
        <mark key={index} className={styles.highlight} data-text={clean}>
          {clean}
        </mark>
      );
    }
    return part;
  });
}

export default function ProfileView({
  isOpen = false,
  profile = {},
  onReturnToPortfolio,
}) {
  const [openCount, setOpenCount] = useState(0);
  const [isTitleDone, setIsTitleDone] = useState(false);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      setOpenCount((prev) => {
        const next = prev + 1;
        if (next > 1) {
          setIsTitleDone(true);
        } else {
          setIsTitleDone(false);
        }
        return next;
      });
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  const handleTypingComplete = () => {
    setIsTitleDone(true);
  };

  const headline = profile.headline || '기획부터 퍼블리싱까지, 윤지입니다';
  const bio = profile.bio || '';
  const phone = profile.phone || '010-8901-2559';
  const email = profile.email || 'geeyounjee@gmail.com';
  const keywords = Array.isArray(profile.keywords) ? profile.keywords : [];
  const links = Array.isArray(profile.links) ? profile.links : [];
  const sections = Array.isArray(profile.sections) ? profile.sections : [];

  const isFirstOpen = openCount === 1;
  const isSubsequentOpen = openCount > 1;
  const highlightActive = isSubsequentOpen || isTitleDone;

  return (
    <aside
      className={[
        styles.overlay,
        isOpen ? styles.overlayOpen : '',
        highlightActive ? styles.highlightActive : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden={!isOpen}
    >
      <div className={styles.page}>
        <div className={styles.wrapper}>
          <section className={styles.heroSection}>
            <span className={styles.eyebrow}>ABOUT / ARCHIVE</span>

            {openCount > 0 && (
              <Title
                variant="section"
                as="h1"
                typing={isFirstOpen}
                showCursor
                typingSpeed={68}
                startDelay={isFirstOpen ? 340 : 0}
                onTypingComplete={handleTypingComplete}
                className={styles.heroTitle}
              >
                {headline}
              </Title>
            )}

            <div
              className={[
                styles.heroBody,
                styles.subReveal,
                isSubsequentOpen
                  ? styles.subRevealInstant
                  : isTitleDone
                  ? styles.subRevealVisible
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {bio && (
                <p className={styles.bioText}>{renderWithHighlight(bio)}</p>
              )}

              {keywords.length > 0 && (
                <div className={styles.heroKeywords}>
                  <KeywordText keywords={keywords} align="left" />
                </div>
              )}

              <nav className={styles.linksRow} aria-label="프로필 및 연락처 링크">
                {links.map((link, idx) => (
                  <TextLinkButton key={`${link.label}-${idx}`} href={link.url}>
                    {link.label}
                  </TextLinkButton>
                ))}
                {phone && (
                  <TextLinkButton href={`tel:${phone.replace(/[^0-9+]/g, '')}`}>
                    {phone}
                  </TextLinkButton>
                )}
                {email && (
                  <TextLinkButton href={`mailto:${email}`}>
                    {email}
                  </TextLinkButton>
                )}
                {onReturnToPortfolio && (
                  <TextLinkButton onClick={onReturnToPortfolio}>
                    포트폴리오 보기
                  </TextLinkButton>
                )}
              </nav>
            </div>
          </section>

          {sections.length > 0 && (
            <section
              className={[
                styles.listSection,
                styles.subRevealDelay,
                isSubsequentOpen
                  ? styles.subRevealInstant
                  : isTitleDone
                  ? styles.subRevealVisible
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-label="주요 역량 및 소개 목록"
            >
              <ul className={styles.list}>
                {sections.map((sec, idx) => {
                  const num = String(idx + 1).padStart(2, '0');
                  return (
                    <li key={sec.id || idx} className={styles.row}>
                      <div className={styles.left}>
                        <span className={styles.index}>{num}</span>
                        <Title variant="list" as="h2">
                          {sec.title}
                        </Title>
                      </div>

                      <div className={styles.right}>
                        {sec.description && (
                          <p className={styles.rowDesc}>
                            {renderWithHighlight(sec.description)}
                          </p>
                        )}
                        {sec.keywords && sec.keywords.length > 0 && (
                          <KeywordText keywords={sec.keywords} align="left" />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      </div>
    </aside>
  );
}
