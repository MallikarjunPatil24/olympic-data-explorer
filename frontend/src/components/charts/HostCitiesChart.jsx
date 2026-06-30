import React from 'react';
import useOlympicYears from '../../hooks/useOlympicYears';
import ChartCard from './ChartCard';
import styles from './HostCitiesChart.module.css';

export default function HostCitiesChart() {
  const { data, loading, error } = useOlympicYears();

  // Reverse data back to descending order (latest editions first) for tabular timeline listing
  const tableData = [...data].reverse();

  return (
    <ChartCard
      title="HISTORICAL HOST CITIES TIMELINE"
      subtitle="Comprehensive chronicle of Olympic host cities, seasons, and participant headcounts"
      loading={loading}
      error={error}
    >
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>YEAR</th>
              <th className={styles.th}>SEASON</th>
              <th className={styles.th}>HOST CITY</th>
              <th className={styles.th} style={{ textAlign: 'right' }}>ATHLETES</th>
              <th className={styles.th} style={{ textAlign: 'right' }}>NATIONS</th>
              <th className={styles.th} style={{ textAlign: 'right' }}>SPORTS</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row) => (
              <tr key={`${row.year}-${row.season}`} className={styles.tr}>
                <td className={`${styles.td} ${styles.yearCol}`}>{row.year}</td>
                <td className={styles.td}>
                  <span className={`${styles.seasonBadge} ${
                    row.season.toLowerCase() === 'summer' ? styles.summer : styles.winter
                  }`}>
                    {row.season}
                  </span>
                </td>
                <td className={styles.td} style={{ fontWeight: 600 }}>{row.city}</td>
                <td className={styles.td} style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {row.athlete_count.toLocaleString()}
                </td>
                <td className={styles.td} style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {row.country_count.toLocaleString()}
                </td>
                <td className={styles.td} style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {row.sport_count.toLocaleString()}
                </td>
              </tr>
            ))}
            {tableData.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-24)', color: 'var(--text-muted)' }}>
                  NO DATA AVAILABLE
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}
