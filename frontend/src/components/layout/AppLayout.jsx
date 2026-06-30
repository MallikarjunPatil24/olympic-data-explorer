import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import styles from './AppLayout.module.css';

export default function AppLayout() {
  return (
    <div className={styles.layoutContainer}>
      {/* Global SVG Filters for Recharts */}
      <svg width="0" height="0" style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="ledGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComponentTransfer in="blur" result="boost">
              <feFuncA type="linear" slope="0.5"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="boost" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <Sidebar />
      <div className={styles.mainWrapper}>
        <Navbar />
        <main className={styles.contentPane}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
