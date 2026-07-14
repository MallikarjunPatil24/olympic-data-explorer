import React from 'react';
import styles from './KeyboardShortcutsModal.module.css';

export default function KeyboardShortcutsModal() {
  const shortcuts = [
    { key: '/', desc: 'Focus athlete search' },
    { key: 'Esc', desc: 'Clear all filters' },
    { key: 'D', desc: 'Toggle dark/light theme' },
    { key: '?', desc: 'Show this help dialog' },
  ];

  return (
    <dialog id="keyboard-shortcuts-modal" className={styles.dialog}>
      <form method="dialog">
        <header className={styles.header}>
          <h2>KEYBOARD SHORTCUTS</h2>
          <button type="submit" className={styles.closeBtn} aria-label="Close">×</button>
        </header>
        <ul className={styles.list}>
          {shortcuts.map((s) => (
            <li key={s.key}>
              <kbd className={styles.kbd}>{s.key}</kbd>
              <span>{s.desc}</span>
            </li>
          ))}
        </ul>
        <footer className={styles.footer}>
          <button type="submit" className={styles.okBtn}>GOT IT</button>
        </footer>
      </form>
    </dialog>
  );
}
