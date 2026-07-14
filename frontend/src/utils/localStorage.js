const PREFIX = 'olympic_';

export function getStorageItem(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function setStorageItem(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* quota exceeded */
  }
}

export function addRecentSearch(name, max = 8) {
  const recent = getStorageItem('recentAthletes', []);
  const filtered = recent.filter((r) => r !== name);
  setStorageItem('recentAthletes', [name, ...filtered].slice(0, max));
}

export function getRecentSearches() {
  return getStorageItem('recentAthletes', []);
}

export function getSavedViews() {
  return getStorageItem('savedViews', []);
}

export function saveView(name, filters) {
  const views = getSavedViews();
  const updated = [{ id: Date.now(), name, filters, createdAt: new Date().toISOString() }, ...views].slice(0, 10);
  setStorageItem('savedViews', updated);
  return updated;
}

export function deleteView(id) {
  const views = getSavedViews().filter((v) => v.id !== id);
  setStorageItem('savedViews', views);
  return views;
}

export function getDashboardLayout() {
  return getStorageItem('dashboardLayout', null);
}

export function setDashboardLayout(layout) {
  setStorageItem('dashboardLayout', layout);
}

export function getCompareSelection() {
  return getStorageItem('compareSelection', { countries: [], sports: [], athletes: [] });
}

export function setCompareSelection(selection) {
  setStorageItem('compareSelection', selection);
}
