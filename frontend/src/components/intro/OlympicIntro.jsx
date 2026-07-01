import React, { useEffect, useState } from "react";
import styles from "./OlympicIntro.module.css";

export default function OlympicIntro({ onEnter }) {
  useEffect(() => {
    // Auto-transition to dashboard after animation completes (3.8 seconds)
    const t = setTimeout(() => {
      onEnter();
    }, 3800);
    return () => clearTimeout(t);
  }, [onEnter]);

  return (
    <div className={styles.wrap}>
      <svg className={styles.svg} viewBox="0 0 260 165" width="280">
        <circle className={`${styles.ring} ${styles.r1}`} cx="45" cy="48" r="40"/>
        <circle className={`${styles.ring} ${styles.r2}`} cx="130" cy="48" r="40"/>
        <circle className={`${styles.ring} ${styles.r3}`} cx="215" cy="48" r="40"/>
        <circle className={`${styles.ring} ${styles.r4}`} cx="87" cy="90" r="40"/>
        <circle className={`${styles.ring} ${styles.r5}`} cx="173" cy="90" r="40"/>
        <text className={styles.title} x="130" y="148">OLYMPIC ANALYTICS</text>
        <text className={styles.sub} x="130" y="164">1896 – 2022</text>
      </svg>
    </div>
  );
}
