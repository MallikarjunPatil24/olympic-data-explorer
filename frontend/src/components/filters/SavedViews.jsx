import React, { useState } from 'react';
import { useFilters } from '../../context/FilterContext';
import { getSavedViews, saveView, deleteView } from '../../utils/localStorage';
import styles from './SavedViews.module.css';

export default function SavedViews() {
  const { filters, setFilter, resetFilters } = useFilters();
  const [views, setViews] = useState(getSavedViews);
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);

  const hasActive = Object.values(filters).some((v) => v !== null);

  const handleSave = () => {
    if (!name.trim() || !hasActive) return;
    setViews(saveView(name.trim(), { ...filters }));
    setName('');
  };

  const applyView = (view) => {
    resetFilters();
    Object.entries(view.filters).forEach(([key, value]) => setFilter(key, value));
    setOpen(false);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    setViews(deleteView(id));
  };

  return (
    <div className={styles.wrapper}>
      <button type="button" className={styles.toggleBtn} onClick={() => setOpen(!open)}>
        💾 SAVED VIEWS ({views.length})
      </button>
      {open && (
        <div className={styles.panel}>
          <div className={styles.saveRow}>
            <input
              type="text"
              placeholder="Name this view…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              disabled={!hasActive}
            />
            <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={!hasActive || !name.trim()}>
              SAVE
            </button>
          </div>
          {views.length === 0 ? (
            <p className={styles.empty}>No saved views yet. Apply filters, then save.</p>
          ) : (
            <ul className={styles.list}>
              {views.map((v) => (
                <li key={v.id} className={styles.item} onClick={() => applyView(v)}>
                  <span>{v.name}</span>
                  <button type="button" className={styles.delBtn} onClick={(e) => handleDelete(v.id, e)} aria-label="Delete view">×</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
