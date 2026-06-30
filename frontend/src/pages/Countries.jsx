import React from 'react';
import { Link } from 'react-router-dom';
import { useCountriesList } from '../hooks/useCountryProfile';
import DataTable from '../components/table/DataTable';
import { exportToCSV, exportToExcel } from '../utils/exportUtils';
import styles from './Countries.module.css';

export default function Countries() {
  const { data, loading, error } = useCountriesList();

  const columns = [
    {
      header: 'NOC CODE',
      accessorKey: 'noc',
      cell: ({ getValue }) => <span className={styles.nocBadge}>{getValue()}</span>
    },
    {
      header: 'COUNTRY / TEAM',
      accessorKey: 'country_name',
      cell: ({ getValue, row }) => (
        <Link to={`/countries/${row.original.noc}`} className={styles.link}>
          {getValue()}
        </Link>
      )
    },
    {
      header: 'ATHLETES SENT',
      accessorKey: 'athlete_count',
      cell: ({ getValue }) => <div className={styles.numberCell}>{getValue().toLocaleString()}</div>
    },
    {
      header: 'GOLD',
      accessorKey: 'gold_count',
      cell: ({ getValue }) => <div className={styles.numberCell}>{getValue().toLocaleString()}</div>
    },
    {
      header: 'SILVER',
      accessorKey: 'silver_count',
      cell: ({ getValue }) => <div className={styles.numberCell}>{getValue().toLocaleString()}</div>
    },
    {
      header: 'BRONZE',
      accessorKey: 'bronze_count',
      cell: ({ getValue }) => <div className={styles.numberCell}>{getValue().toLocaleString()}</div>
    },
    {
      header: 'TOTAL MEDALS',
      accessorKey: 'total_medals',
      cell: ({ getValue }) => (
        <div className={`${styles.numberCell} ${styles.totalMedalsCell}`}>{getValue().toLocaleString()}</div>
      )
    }
  ];

  return (
    <div className={styles.countriesContainer}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>COUNTRIES SUMMARY</h1>
          <p className={styles.subtitle}>Unified historical statistics and medal counts per National Olympic Committee (1896 – 2022)</p>
        </div>
        <div className={styles.exportActions}>
          <button 
            onClick={() => exportToCSV(data, 'Olympic_Countries')} 
            className={styles.exportBtn}
            title="Export countries table to CSV"
            disabled={!data || data.length === 0}
          >
            📊 CSV
          </button>
          <button 
            onClick={() => exportToExcel(data, 'Olympic_Countries')} 
            className={styles.exportBtn}
            title="Export countries table to Excel"
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
