import React from 'react';
import useDashboardData from '../../hooks/useDashboardData';
import { useFilters } from '../../context/FilterContext';
import styles from './ResultsCountBar.module.css';

export default function ResultsCountBar() {
  const { data, loading } = useDashboardData();
  const { filters } = useFilters();
  const hasFilters = Object.values(filters).some((v) => v !== null);

  if (loading || !data) return null;

  return (
    <div className={styles.bar} role="status">
      <span className={styles.dot} />
      {hasFilters ? (
        <span>
          Showing <strong>{data.total_athletes?.toLocaleString()}</strong> athletes across{' '}
          <strong>{data.total_countries}</strong> countries ·{' '}
          <strong>{data.total_medals?.toLocaleString()}</strong> medals ·{' '}
          <strong>{data.total_events}</strong> events
        </span>
      ) : (
        <span>
          Full dataset: <strong>{data.total_athletes?.toLocaleString()}</strong> athletes ·{' '}
          <strong>{data.total_countries}</strong> countries ·{' '}
          <strong>{data.total_games}</strong> Olympic editions
        </span>
      )}
    </div>
  );
}
