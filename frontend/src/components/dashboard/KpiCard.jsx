import React from 'react';
import styles from './KpiCard.module.css';
import ScoreboardNumber from '../ui/ScoreboardNumber';

export default function KpiCard({ label, value, accentColor }) {
  const getAccentColor = () => {
    switch (accentColor) {
      case 'blue':
        return 'var(--accent-blue)';
      case 'yellow':
        return 'var(--accent-gold)';
      case 'black':
        return 'var(--text-primary)';
      case 'green':
        return 'var(--accent-green)';
      case 'red':
        return 'var(--accent-red)';
      default:
        return 'var(--border-subtle)';
    }
  };

  return (
    <div className={styles.card}>
      <div 
        className={styles.accentBar} 
        style={{ backgroundColor: getAccentColor() }} 
      />
      <div>
        <div className={styles.label}>{label}</div>
        <div className={styles.value}>
          {value !== undefined && value !== null ? (
            <ScoreboardNumber value={value} />
          ) : (
            '—'
          )}
        </div>
      </div>
    </div>
  );
}
