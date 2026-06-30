import React from 'react';
import { Link } from 'react-router-dom';
import { useSportsList } from '../hooks/useSportProfile';
import DataTable from '../components/table/DataTable';
import { exportToCSV, exportToExcel } from '../utils/exportUtils';
import styles from './Sports.module.css';

export default function Sports() {
  const { data, loading, error } = useSportsList();

  const columns = [
    {
      header: 'SPORT / DISCIPLINE',
      accessorKey: 'sport',
      cell: ({ getValue }) => {
        const val = getValue();
        return (
          <Link to={`/sports/${val.toLowerCase()}`} className={styles.link}>
            {val.toUpperCase()}
          </Link>
        );
      }
    },
    {
      header: 'TOTAL ATHLETES',
      accessorKey: 'athlete_count',
      cell: ({ getValue }) => <div className={styles.numberCell}>{getValue().toLocaleString()}</div>
    },
    {
      header: 'EVENTS COMPLETED',
      accessorKey: 'event_count',
      cell: ({ getValue }) => <div className={styles.numberCell}>{getValue().toLocaleString()}</div>
    },
    {
      header: 'TOTAL MEDALS AWARDED',
      accessorKey: 'medal_count',
      cell: ({ getValue }) => (
        <div className={`${styles.numberCell} ${styles.medalCell}`}>{getValue().toLocaleString()}</div>
      )
    }
  ];

  return (
    <div className={styles.sportsContainer}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>SPORTS DIRECTORY</h1>
          <p className={styles.subtitle}>List of Olympic sports, event volumes, and historical athlete distributions (1896 – 2022)</p>
        </div>
        <div className={styles.exportActions}>
          <button 
            onClick={() => exportToCSV(data, 'Olympic_Sports')} 
            className={styles.exportBtn}
            title="Export sports table to CSV"
            disabled={!data || data.length === 0}
          >
            📊 CSV
          </button>
          <button 
            onClick={() => exportToExcel(data, 'Olympic_Sports')} 
            className={styles.exportBtn}
            title="Export sports table to Excel"
            disabled={!data || data.length === 0}
          >
            📈 EXCEL
          </button>
        </div>
      </header>

      {error ? (
        <div className={styles.errorContainer}>
          <h3 className={styles.errorTitle}>DATA RETRIEVAL FAILED</h3>
          <p className={styles.errorText}>{error}</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <DataTable columns={columns} data={data || []} loading={loading} />
        </div>
      )}
    </div>
  );
}
