import React from 'react';
import styles from './LaneDivider.module.css';

export default function LaneDivider({ 
  direction = 'horizontal', 
  tick = true, 
  tickColor = 'var(--accent-blue)',
  style = {}
}) {
  const isVertical = direction === 'vertical';
  
  return (
    <div 
      className={`${styles.divider} ${isVertical ? styles.vertical : styles.horizontal}`}
      style={style}
    >
      <div className={styles.line} />
      {tick && (
        <div 
          className={styles.tick} 
          style={{ backgroundColor: tickColor }} 
        />
      )}
    </div>
  );
}
