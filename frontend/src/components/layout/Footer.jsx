import React from 'react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <span>DATA SOURCE: OLYMPIC HISTORICAL RECORD (1896 – 2022)</span>
      <span>SYSTEM STATUS: STABLE / PIPELINE FULLY RESOLVED</span>
    </footer>
  );
}
