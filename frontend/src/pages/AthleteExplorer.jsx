import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAthleteSearch } from '../hooks/useAthleteSearch';
import useDebounce from '../hooks/useDebounce';
import DataTable from '../components/table/DataTable';
import { exportToCSV, exportToExcel } from '../utils/exportUtils';
import styles from './AthleteExplorer.module.css';

export default function AthleteExplorer() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  
  // Fetch matching results via hook
  const { data, loading, error } = useAthleteSearch(debouncedSearch);

  const columns = [
    {
      header: 'COMPETITOR NAME',
      accessorKey: 'name',
      cell: ({ getValue }) => (
        <Link to={`/athletes/${getValue()}`} className={styles.link}>
          {getValue()}
        </Link>
      )
    },
    {
      header: 'GENDER',
      accessorKey: 'sex',
      cell: ({ getValue }) => {
        const val = getValue();
        return (
          <span className={`${styles.genderBadge} ${val === 'M' ? styles.male : styles.female}`}>
            {val === 'M' ? 'MALE' : 'FEMALE'}
          </span>
        );
      }
    },
    {
      header: 'NOC',
      accessorKey: 'noc',
      cell: ({ getValue }) => <span className={styles.nocBadge}>{getValue()}</span>
    },
    {
      header: 'PRIMARY SPORT / DISCIPLINE',
      accessorKey: 'sport',
      cell: ({ getValue }) => <span className={styles.sportText}>{getValue()}</span>
    },
    {
      header: 'APPEARANCES',
      accessorKey: 'total_appearances',
      cell: ({ getValue }) => <div className={styles.numberCell}>{getValue()}</div>
    },
    {
      header: 'TOTAL MEDALS',
      accessorKey: 'total_medals',
      cell: ({ getValue }) => (
        <div className={`${styles.numberCell} ${getValue() > 0 ? styles.medalWinner : ''}`}>
          {getValue()}
        </div>
      )
    }
  ];

  return (
    <div className={styles.explorerContainer}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>ATHLETE EXPLORER</h1>
          <p className={styles.subtitle}>Search and explore profiles of historic Olympic competitors (1896 – 2022)</p>
        </div>
        <div className={styles.exportActions}>
          <button 
            onClick={() => exportToCSV(data?.results || [], 'Olympic_Athletes')} 
            className={styles.exportBtn}
            title="Export athletes table to CSV"
            disabled={!data?.results || data.results.length === 0}
          >
            📊 CSV
          </button>
          <button 
            onClick={() => exportToExcel(data?.results || [], 'Olympic_Athletes')} 
            className={styles.exportBtn}
            title="Export athletes table to Excel"
            disabled={!data?.results || data.results.length === 0}
          >
            📈 EXCEL
          </button>
        </div>
      </header>

      <div className={styles.searchSection}>
        <label htmlFor="search-athlete" style={{ display: 'none' }}>Search Athlete</label>
        <input
          id="search-athlete"
          name="search-athlete"
          type="text"
          className={styles.searchInput}
          placeholder="SEARCH ATHLETE BY NAME (E.G. MICHAEL PHELPS)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error ? (
        <div className={styles.errorContainer}>
          <h3 className={styles.errorTitle}>SEARCH FAILED</h3>
          <p className={styles.errorText}>{error}</p>
        </div>
      ) : (
        <div className={styles.resultsContainer}>
          <DataTable 
            columns={columns} 
            data={data?.results || []} 
            loading={loading}
          />
        </div>
      )}
    </div>
  );
}
