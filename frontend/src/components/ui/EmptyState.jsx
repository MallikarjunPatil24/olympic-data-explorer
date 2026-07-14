import React from 'react';
import { useFilters } from '../../context/FilterContext';
import styles from './EmptyState.module.css';

export default function EmptyState({
  title = 'NO DATA FOUND',
  message = 'No records match your current filters.',
  hint = 'Try removing one or more filters to broaden your search.',
  icon = '📊',
  onReset,
  compact = false,
}) {
  const { resetFilters } = useFilters();

  return (
    <div className={`${styles.container} ${compact ? styles.compact : ''}`} role="status">
      <span className={styles.icon} aria-hidden="true">{icon}</span>
      <h4 className={styles.title}>{title}</h4>
      <p className={styles.message}>{message}</p>
      {hint && <p className={styles.hint}>{hint}</p>}
      <button
        className={styles.resetBtn}
        onClick={onReset || resetFilters}
        type="button"
      >
        RESET ALL FILTERS
      </button>
    </div>
  );
}
