import React, { useState } from 'react';
import styles from './InfoTooltip.module.css';

export default function InfoTooltip({ term, definition, children }) {
  const [open, setOpen] = useState(false);

  return (
    <span className={styles.wrapper}>
      {children || (
        <button
          type="button"
          className={styles.trigger}
          aria-label={`Definition of ${term}`}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
        >
          {term}
          <span className={styles.infoIcon} aria-hidden="true">?</span>
        </button>
      )}
      {open && (
        <span className={styles.tooltip} role="tooltip">
          <strong>{term}</strong>
          <span>{definition}</span>
        </span>
      )}
    </span>
  );
}
