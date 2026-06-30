import React from 'react';
import styles from './Skeleton.module.css';

export function Skeleton({ className, ...props }) {
  return <div className={`${styles.skeleton} ${className || ''}`} {...props} />;
}

export function KpiCardSkeleton() {
  return (
    <div className={styles.kpiCard}>
      <Skeleton className={styles.kpiAccent} />
      <Skeleton className={styles.kpiLabel} />
      <Skeleton className={styles.kpiValue} />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div className={styles.chartTitleGroup}>
          <Skeleton className={styles.chartTitle} />
          <Skeleton className={styles.chartSubtitle} />
        </div>
      </div>
      <div className={styles.chartBody}>
        <Skeleton className={styles.chartBar} style={{ height: '70%' }} />
        <Skeleton className={styles.chartBar} style={{ height: '50%' }} />
        <Skeleton className={styles.chartBar} style={{ height: '90%' }} />
        <Skeleton className={styles.chartBar} style={{ height: '40%' }} />
        <Skeleton className={styles.chartBar} style={{ height: '80%' }} />
        <Skeleton className={styles.chartBar} style={{ height: '60%' }} />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr className={styles.tr}>
      {Array.from({ length: cols }).map((_, idx) => (
        <td key={idx} className={styles.td}>
          <Skeleton className={styles.tableText} />
        </td>
      ))}
    </tr>
  );
}
