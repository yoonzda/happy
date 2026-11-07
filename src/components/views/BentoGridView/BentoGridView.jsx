import React from 'react';
import Title from '../../ui/Title/Title';
import KeywordText from '../../ui/KeywordText/KeywordText';
import TextLinkButton from '../../ui/TextLinkButton/TextLinkButton';
import styles from './BentoGridView.module.css';

export default function BentoGridView({ projects = [] }) {
  return (
    <main className={styles.page}>
      <div className={styles.wrapper}>
        <ul className={styles.list} aria-label="포트폴리오 목록">
          {projects.map((project, index) => {
            const num = String(index + 1).padStart(2, '0');
            const primaryUrl = project.links?.[0]?.url || '';

            const titleNode = (
              <Title variant="list" as="span">
                {project.title}
              </Title>
            );

            return (
              <li key={project.id || index} className={styles.row}>
                <div className={styles.left}>
                  <span className={styles.index}>{num}</span>
                  {primaryUrl ? (
                    <a
                      href={primaryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.titleLink}
                    >
                      {titleNode}
                    </a>
                  ) : (
                    titleNode
                  )}
                </div>

                <div className={styles.right}>
                  <KeywordText keywords={project.keywords} />

                  {project.links && project.links.length > 0 && (
                    <div className={styles.linksGroup}>
                      {project.links.map((link, lIdx) => (
                        <TextLinkButton
                          key={`${link.label}-${lIdx}`}
                          href={link.url}
                        >
                          {link.label}
                        </TextLinkButton>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
