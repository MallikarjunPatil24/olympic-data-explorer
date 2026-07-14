import React, { useState, useEffect } from 'react';
import useInsights from '../../hooks/useInsights';
import styles from './InsightsBanner.module.css';

export default function InsightsBanner() {
  const { insights, fact, loading } = useInsights();
  const [idx, setIdx] = useState(0);

  const allFacts = fact ? [fact, ...insights.map((i) => i.text)] : insights.map((i) => i.text);
  const display = allFacts.filter(Boolean);

  useEffect(() => {
    if (display.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % display.length), 8000);
    return () => clearInterval(t);
  }, [display.length]);

  if (loading || display.length === 0) return null;

  return (
    <div className={styles.banner}>
      <span className={styles.badge}>💡 DID YOU KNOW?</span>
      <p className={styles.text}>{display[idx]}</p>
      {display.length > 1 && (
        <div className={styles.dots}>
          {display.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.dot} ${i === idx ? styles.activeDot : ''}`}
              onClick={() => setIdx(i)}
              aria-label={`Fact ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
