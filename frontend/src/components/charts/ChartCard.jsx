import React from 'react';
import { Skeleton } from '../ui/Skeleton';
import LaneDivider from '../ui/LaneDivider';
import styles from './ChartCard.module.css';

export const GLOW_FILTER_DEF = (
  <defs>
    <filter id="ledGlow" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="2" result="blur" />
      <feComponentTransfer in="blur" result="boost">
        <feFuncA type="linear" slope="0.5"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode in="boost" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
);

export default function ChartCard({ title, subtitle, loading, error, legend, accentColor = 'var(--border-subtle)', children }) {
  return (
    <div className={styles.card}>
      <div 
        className={styles.accentBar} 
        style={{ backgroundColor: accentColor }} 
      />
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h3 className={styles.title}>{title}</h3>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {legend && <div className={styles.legendSlot}>{legend}</div>}
      </div>
      <LaneDivider tick={false} style={{ marginBottom: 'var(--space-12)' }} />
      <div className={styles.content}>
        {loading ? (
          <div className={styles.shimmerBody}>
            <Skeleton className={styles.shimmerBar} style={{ height: '70%' }} />
            <Skeleton className={styles.shimmerBar} style={{ height: '50%' }} />
            <Skeleton className={styles.shimmerBar} style={{ height: '90%' }} />
            <Skeleton className={styles.shimmerBar} style={{ height: '40%' }} />
            <Skeleton className={styles.shimmerBar} style={{ height: '80%' }} />
            <Skeleton className={styles.shimmerBar} style={{ height: '60%' }} />
          </div>
        ) : error ? (
          <div className={`${styles.overlay} ${styles.errorOverlay}`}>
            <span className={styles.errorTitle}>CHART RETRIEVAL ERROR</span>
            <span className={styles.errorText}>{error}</span>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
