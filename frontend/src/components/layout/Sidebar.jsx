import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const navItems = [
    { path: '/', label: 'DASHBOARD' },
    { path: '/countries', label: 'COUNTRIES' },
    { path: '/sports', label: 'SPORTS' },
    { path: '/athletes', label: 'ATHLETES' },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <svg className={styles.logo} viewBox="0 0 110 55" fill="none">
          <circle cx="20" cy="20" r="13" stroke="#0085C7" strokeWidth="3.5" />
          <circle cx="55" cy="20" r="13" stroke="var(--text-primary)" strokeWidth="3.5" />
          <circle cx="90" cy="20" r="13" stroke="#DF0024" strokeWidth="3.5" />
          <circle cx="37.5" cy="35" r="13" stroke="#F4C300" strokeWidth="3.5" />
          <circle cx="72.5" cy="35" r="13" stroke="#009F3D" strokeWidth="3.5" />
        </svg>
        <span>OLYMPIC ANALYTICS</span>
      </div>
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
