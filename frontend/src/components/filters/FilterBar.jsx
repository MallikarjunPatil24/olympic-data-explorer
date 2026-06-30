import React, { useState, useEffect, useRef } from 'react';
import { useFilters } from '../../context/FilterContext';
import useFilterOptions from '../../hooks/useFilterOptions';
import styles from './FilterBar.module.css';

export default function FilterBar() {
  const { filters, setFilter, resetFilters } = useFilters();
  const { options, loading } = useFilterOptions();
  
  // Custom searchable dropdown state for Country selection
  const [countrySearch, setCountrySearch] = useState('');
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const countryRef = useRef(null);

  // Close country dropdown on outside clicks
  useEffect(() => {
    function handleClickOutside(event) {
      if (countryRef.current && !countryRef.current.contains(event.target)) {
        setCountryDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update input text if country NOC changes externally (e.g., reset)
  useEffect(() => {
    if (!filters.country) {
      setCountrySearch('');
    } else {
      const match = options.countries.find(c => c.noc === filters.country);
      if (match) {
        setCountrySearch(match.name);
      }
    }
  }, [filters.country, options.countries]);

  const handleCountrySelect = (noc, name) => {
    setFilter('country', noc);
    setCountrySearch(name);
    setCountryDropdownOpen(false);
  };

  const handleCountryClear = (e) => {
    e.stopPropagation();
    setFilter('country', null);
    setCountrySearch('');
  };

  // Filter countries list client-side based on search query
  const filteredCountries = options.countries.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.noc.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // Check if any filters are active to toggle reset button status
  const hasActiveFilters = Object.values(filters).some(val => val !== null);
  
  // Count active filters
  const activeCount = Object.values(filters).filter(val => val !== null).length;

  return (
    <div className={styles.filterBarContainer}>
      <div className={styles.filterBar}>
        {/* Year Dropdown */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>YEAR</label>
          <select
            className={styles.select}
            value={filters.year || ''}
            onChange={(e) => setFilter('year', e.target.value ? parseInt(e.target.value) : null)}
            disabled={loading}
          >
            <option value="">ALL YEARS</option>
            {options.years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Season Button Group */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>SEASON</label>
          <div className={styles.buttonGroup}>
            <button
              className={`${styles.toggleBtn} ${!filters.season ? styles.activeToggle : ''}`}
              onClick={() => setFilter('season', null)}
            >
              ALL
            </button>
            <button
              className={`${styles.toggleBtn} ${filters.season === 'Summer' ? styles.activeToggle : ''}`}
              onClick={() => setFilter('season', 'Summer')}
            >
              SUMMER
            </button>
            <button
              className={`${styles.toggleBtn} ${filters.season === 'Winter' ? styles.activeToggle : ''}`}
              onClick={() => setFilter('season', 'Winter')}
            >
              WINTER
            </button>
          </div>
        </div>

        {/* Country Searchable Dropdown */}
        <div className={styles.filterGroup} ref={countryRef}>
          <label className={styles.label}>COUNTRY</label>
          <div className={styles.searchableWrapper}>
            <input
              type="text"
              className={styles.input}
              placeholder="SEARCH COUNTRY..."
              value={countrySearch}
              onFocus={() => setCountryDropdownOpen(true)}
              onChange={(e) => {
                setCountrySearch(e.target.value);
                setCountryDropdownOpen(true);
                if (!e.target.value) setFilter('country', null);
              }}
              disabled={loading}
            />
            {filters.country && (
              <button 
                className={styles.clearBtn} 
                onClick={handleCountryClear}
                aria-label="Clear country"
              >
                &times;
              </button>
            )}
            
            {countryDropdownOpen && (
              <ul className={styles.dropdownList}>
                {filteredCountries.slice(0, 50).map(c => (
                  <li
                    key={c.noc}
                    className={`${styles.dropdownItem} ${filters.country === c.noc ? styles.activeDropdownItem : ''}`}
                    onClick={() => handleCountrySelect(c.noc, c.name)}
                  >
                    <span className={styles.nocBadge}>{c.noc}</span> {c.name}
                  </li>
                ))}
                {filteredCountries.length === 0 && (
                  <li className={styles.noResults}>NO COUNTRIES FOUND</li>
                )}
              </ul>
            )}
          </div>
        </div>

        {/* Sport Dropdown */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>SPORT</label>
          <select
            className={styles.select}
            value={filters.sport || ''}
            onChange={(e) => setFilter('sport', e.target.value || null)}
            disabled={loading}
          >
            <option value="">ALL SPORTS</option>
            {options.sports.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Gender Button Group */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>GENDER</label>
          <div className={styles.buttonGroup}>
            <button
              className={`${styles.toggleBtn} ${!filters.gender ? styles.activeToggle : ''}`}
              onClick={() => setFilter('gender', null)}
            >
              ALL
            </button>
            <button
              className={`${styles.toggleBtn} ${filters.gender === 'M' ? styles.activeToggle : ''}`}
              onClick={() => setFilter('gender', 'M')}
            >
              MALE
            </button>
            <button
              className={`${styles.toggleBtn} ${filters.gender === 'F' ? styles.activeToggle : ''}`}
              onClick={() => setFilter('gender', 'F')}
            >
              FEMALE
            </button>
          </div>
        </div>

        {/* Medal Button Group */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>MEDAL</label>
          <div className={styles.buttonGroup}>
            <button
              className={`${styles.toggleBtn} ${!filters.medal ? styles.activeToggle : ''}`}
              onClick={() => setFilter('medal', null)}
            >
              ALL
            </button>
            <button
              className={`${styles.toggleBtn} ${filters.medal === 'Gold' ? styles.activeToggle : ''}`}
              onClick={() => setFilter('medal', 'Gold')}
            >
              GOLD
            </button>
            <button
              className={`${styles.toggleBtn} ${filters.medal === 'Silver' ? styles.activeToggle : ''}`}
              onClick={() => setFilter('medal', 'Silver')}
            >
              SILVER
            </button>
            <button
              className={`${styles.toggleBtn} ${filters.medal === 'Bronze' ? styles.activeToggle : ''}`}
              onClick={() => setFilter('medal', 'Bronze')}
            >
              BRONZE
            </button>
          </div>
        </div>

        {/* Reset Trigger Action */}
        <button
          className={styles.resetBtn}
          onClick={resetFilters}
          disabled={!hasActiveFilters}
        >
          RESET
        </button>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className={styles.chipsRow}>
          <span className={styles.chipsLabel}>ACTIVE FILTERS ({activeCount}):</span>
          <div className={styles.chipsList}>
            {filters.year && (
              <span className={styles.chip}>
                Year: {filters.year}
                <button onClick={() => setFilter('year', null)}>&times;</button>
              </span>
            )}
            {filters.season && (
              <span className={styles.chip}>
                Season: {filters.season}
                <button onClick={() => setFilter('season', null)}>&times;</button>
              </span>
            )}
            {filters.country && (
              <span className={styles.chip}>
                NOC: {filters.country}
                <button onClick={handleCountryClear}>&times;</button>
              </span>
            )}
            {filters.sport && (
              <span className={styles.chip}>
                Sport: {filters.sport}
                <button onClick={() => setFilter('sport', null)}>&times;</button>
              </span>
            )}
            {filters.gender && (
              <span className={styles.chip}>
                Gender: {filters.gender === 'M' ? 'Male' : 'Female'}
                <button onClick={() => setFilter('gender', null)}>&times;</button>
              </span>
            )}
            {filters.medal && (
              <span className={styles.chip}>
                Medal: {filters.medal}
                <button onClick={() => setFilter('medal', null)}>&times;</button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
