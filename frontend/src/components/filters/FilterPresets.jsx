import React from 'react';
import { useFilters } from '../../context/FilterContext';
import styles from './FilterPresets.module.css';

const PRESETS = [
  { id: 'modern', label: 'Modern Era', filters: { year: 2000 } },
  { id: 'gold', label: 'Gold Only', filters: { medal: 'Gold' } },
  { id: 'women', label: "Women's Sports", filters: { gender: 'F' } },
  { id: 'summer', label: 'Summer Games', filters: { season: 'Summer' } },
  { id: 'winter', label: 'Winter Games', filters: { season: 'Winter' } },
  { id: 'beijing', label: 'Beijing 2008', filters: { year: 2008, season: 'Summer' } },
];

export default function FilterPresets() {
  const { setFilter, resetFilters } = useFilters();

  const applyPreset = (preset) => {
    resetFilters();
    Object.entries(preset.filters).forEach(([key, value]) => {
      setFilter(key, value);
    });
  };

  return (
    <div className={styles.presets}>
      <span className={styles.label}>QUICK PRESETS:</span>
      <div className={styles.list}>
        {PRESETS.map((p) => (
          <button key={p.id} type="button" className={styles.presetBtn} onClick={() => applyPreset(p)}>
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
