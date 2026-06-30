import React from 'react';
import styles from './KpiCardGrid.module.css';

export default function KpiCardGrid({ children }) {
  return <div className={styles.grid}>{children}</div>;
}
