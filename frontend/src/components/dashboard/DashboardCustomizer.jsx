import React from 'react';
import { useDashboardLayout } from '../../context/DashboardLayoutContext';
import styles from './DashboardCustomizer.module.css';

export default function DashboardCustomizer() {
  const { charts, toggleChart, resetLayout, customizeOpen, setCustomizeOpen } = useDashboardLayout();

  if (!customizeOpen) {
    return (
      <button type="button" className={styles.toggleBtn} onClick={() => setCustomizeOpen(true)}>
        ⚙ CUSTOMIZE
      </button>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span>CUSTOMIZE DASHBOARD</span>
        <button type="button" onClick={() => setCustomizeOpen(false)} aria-label="Close">×</button>
      </div>
      <ul className={styles.list}>
        {charts.map((c) => (
          <li key={c.id}>
            <label>
              <input type="checkbox" checked={c.visible} onChange={() => toggleChart(c.id)} />
              {c.label}
            </label>
          </li>
        ))}
      </ul>
      <button type="button" className={styles.resetBtn} onClick={resetLayout}>RESET LAYOUT</button>
    </div>
  );
}
