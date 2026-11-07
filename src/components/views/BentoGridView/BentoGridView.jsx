import React from 'react';
import BentoTile from '../../ui/BentoTile/BentoTile';
import styles from './BentoGridView.module.css';

// Matches the 15-tile asymmetric Bento mosaic pattern from the reference image
const REFERENCE_BENTO_PATTERN = [
  '2x1',
  '1x2',
  '1x1',
  '1x1',
  '1x2',
  '2x1',
  '1x1',
  '1x1',
  '3x1',
  '1x1',
  '1x2',
  '1x1',
  '1x1',
  '1x2',
  '2x1',
];

export default function BentoGridView({ projects = [] }) {
  return (
    <main className={styles.page}>
      <div className={styles.wrapper}>
        <section className={styles.grid} aria-label="포트폴리오 그리드 목록">
          {projects.map((project, index) => {
            const resolvedSpan =
              !project.gridSpan || project.gridSpan === 'auto'
                ? REFERENCE_BENTO_PATTERN[index % REFERENCE_BENTO_PATTERN.length]
                : project.gridSpan;

            const primaryUrl = project.links?.[0]?.url || '';

            return (
              <BentoTile
                key={project.id || index}
                index={index}
                title={project.title}
                image={project.image}
                primaryUrl={primaryUrl}
                span={resolvedSpan}
                hoverZoom={project.hoverZoom || 'in'}
              />
            );
          })}
        </section>
      </div>
    </main>
  );
}
