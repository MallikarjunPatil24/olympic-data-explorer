import React, { useState, useEffect } from 'react';
import styles from './ErrorRecovery.module.css';

export default function ErrorRecovery({
  error,
  onRetry,
  title = 'CONNECTION FAILURE',
  coldStartHint = true,
}) {
  const [countdown, setCountdown] = useState(0);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleRetry = async () => {
    if (countdown > 0 || retrying) return;
    setRetrying(true);
    try {
      await onRetry?.();
    } finally {
      setRetrying(false);
      setCountdown(5);
    }
  };

  return (
    <div className={styles.container} role="alert">
      <span className={styles.icon} aria-hidden="true">⚠</span>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>{error || 'Unable to reach the API server.'}</p>
      {coldStartHint && (
        <p className={styles.hint}>
          If deployed on Render free tier, the backend may be waking up — this can take up to 30 seconds.
        </p>
      )}
      <button
        className={styles.retryBtn}
        onClick={handleRetry}
        disabled={countdown > 0 || retrying}
        type="button"
      >
        {retrying ? 'RETRYING…' : countdown > 0 ? `RETRY IN ${countdown}s` : 'RETRY CONNECTION'}
      </button>
    </div>
  );
}
