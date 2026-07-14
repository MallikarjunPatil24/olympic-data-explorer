import React from 'react';
import { useFilters } from '../../context/FilterContext';
import useFilterOptions from '../../hooks/useFilterOptions';
import styles from './YearScrubber.module.css';

export default function YearScrubber() {
  const { filters, setFilter } = useFilters();
  const { options } = useFilterOptions();
  const years = options.years || [];
  const min = years.length ? Math.min(...years) : 1896;
  const max = years.length ? Math.max(...years) : 2022;
  const value = filters.year ?? min;

  if (years.length < 2) return null;

  return (
    <div className={styles.scrubber}>
      <label htmlFor="year-scrubber" className={styles.label}>
        TIMELINE {filters.year ? `· ${filters.year}` : '· ALL YEARS'}
      </label>
      <div className={styles.track}>
        <span className={styles.minLabel}>{min}</span>
        <input
          id="year-scrubber"
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          list="year-ticks"
          className={styles.slider}
          onChange={(e) => {
            const yr = parseInt(e.target.value, 10);
            setFilter('year', yr === min && !filters.year ? null : yr);
          }}
          onDoubleClick={() => setFilter('year', null)}
          title="Double-click to show all years"
        />
        <datalist id="year-ticks">
          {years.filter((_, i) => i % Math.ceil(years.length / 8) === 0).map((y) => (
            <option key={y} value={y} />
          ))}
        </datalist>
        <span className={styles.maxLabel}>{max}</span>
      </div>
      {filters.year && (
        <button type="button" className={styles.clearBtn} onClick={() => setFilter('year', null)}>
          SHOW ALL YEARS
        </button>
      )}
    </div>
  );
}
