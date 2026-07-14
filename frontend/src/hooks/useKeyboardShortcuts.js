import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFilters } from '../context/FilterContext';
import { useTheme } from '../context/ThemeContext';

export default function useKeyboardShortcuts() {
  const { resetFilters } = useFilters();
  const { toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleKeyDown = useCallback((e) => {
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

    if (e.key === '/') {
      e.preventDefault();
      navigate('/athletes');
      setTimeout(() => {
        document.getElementById('search-athlete')?.focus();
      }, 100);
    } else if (e.key === 'Escape') {
      resetFilters();
    } else if (e.key === 'd' || e.key === 'D') {
      toggleTheme();
    } else if (e.key === '?') {
      const el = document.getElementById('keyboard-shortcuts-modal');
      if (el) el.showModal?.();
    }
  }, [resetFilters, toggleTheme, navigate]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
