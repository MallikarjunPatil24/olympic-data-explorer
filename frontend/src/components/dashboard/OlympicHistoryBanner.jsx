import React from 'react';
import useOlympicHistory from '../../hooks/useOlympicHistory';
import styles from './OlympicHistoryBanner.module.css';

export default function OlympicHistoryBanner() {
  const { data, loading } = useOlympicHistory();
  if (loading || !data) return null;

  return (
    <div className={styles.banner}>
      <span className={styles.icon}>🏛</span>
      <div>
        <p className={styles.title}>ON THIS DAY IN OLYMPIC HISTORY</p>
        <p className={styles.text}>{data.message}</p>
        {data.host && (
          <p className={styles.meta}>
            Host: <strong>{data.host}</strong>
            {data.year && <> · {data.year}</>}
            {data.city && <> · {data.city}</>}
          </p>
        )}
      </div>
    </div>
  );
}
