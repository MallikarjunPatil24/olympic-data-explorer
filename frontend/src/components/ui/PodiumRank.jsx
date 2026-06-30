import React from 'react';
import styles from './PodiumRank.module.css';

export default function PodiumRank({ items = [] }) {
  // Sort items to rank elements: items[0] is Gold (1st), items[1] is Silver (2nd), items[2] is Bronze (3rd)
  const gold = items[0] || null;
  const silver = items[1] || null;
  const bronze = items[2] || null;

  return (
    <div className={styles.podiumContainer}>
      {/* 2nd Place (Silver) */}
      <div className={`${styles.podiumCol} ${styles.silverCol}`}>
        {silver ? (
          <>
            <div className={styles.itemInfo}>
              <span className={styles.itemLabel} title={silver.label}>{silver.label}</span>
              <span className={styles.itemValue}>{silver.value}</span>
              {silver.subtext && <span className={styles.itemSubtext}>{silver.subtext}</span>}
            </div>
            <div className={styles.podiumBlock}>
              <span className={styles.rankNum}>2</span>
            </div>
          </>
        ) : (
          <div className={styles.emptyCol} />
        )}
      </div>

      {/* 1st Place (Gold) */}
      <div className={`${styles.podiumCol} ${styles.goldCol}`}>
        {gold ? (
          <>
            <div className={styles.itemInfo}>
              <span className={styles.itemLabel} title={gold.label}>{gold.label}</span>
              <span className={styles.itemValue}>{gold.value}</span>
              {gold.subtext && <span className={styles.itemSubtext}>{gold.subtext}</span>}
            </div>
            <div className={styles.podiumBlock}>
              <span className={styles.rankNum}>1</span>
            </div>
          </>
        ) : (
          <div className={styles.emptyCol} />
        )}
      </div>

      {/* 3rd Place (Bronze) */}
      <div className={`${styles.podiumCol} ${styles.bronzeCol}`}>
        {bronze ? (
          <>
            <div className={styles.itemInfo}>
              <span className={styles.itemLabel} title={bronze.label}>{bronze.label}</span>
              <span className={styles.itemValue}>{bronze.value}</span>
              {bronze.subtext && <span className={styles.itemSubtext}>{bronze.subtext}</span>}
            </div>
            <div className={styles.podiumBlock}>
              <span className={styles.rankNum}>3</span>
            </div>
          </>
        ) : (
          <div className={styles.emptyCol} />
        )}
      </div>
    </div>
  );
}
