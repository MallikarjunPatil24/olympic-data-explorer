import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={styles.navbar}>
      <div className={styles.left}>
        <span className={styles.badge}>DATA PIPELINE ACTIVE</span>
        <span className={styles.editionText}>OLYMPIC TIMELINE: 1896 – 2022</span>
      </div>
      <div className={styles.right}>
        <button 
          className={styles.themeToggle} 
          aria-label="Toggle Theme" 
          onClick={toggleTheme}
        >
          THEME: {theme.toUpperCase()}
        </button>
      </div>
    </header>
  );
}
