import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAthleteProfile } from '../hooks/useAthleteSearch';
import DataTable from '../components/table/DataTable';
import { Skeleton, KpiCardSkeleton } from '../components/ui/Skeleton';
import styles from './AthleteDetail.module.css';

export default function AthleteDetail() {
  const { name } = useParams();
  const { data, loading, error } = useAthleteProfile(name);

  const columns = [
    {
      header: 'YEAR',
      accessorKey: 'year',
      cell: ({ getValue }) => <span style={{ fontWeight: 700 }}>{getValue()}</span>
    },
    {
      header: 'SEASON',
      accessorKey: 'season',
      cell: ({ getValue }) => (
        <span className={`${styles.seasonBadge} ${
          getValue().toLowerCase() === 'summer' ? styles.summer : styles.winter
        }`}>
          {getValue().toUpperCase()}
        </span>
      )
    },
    {
      header: 'CITY',
      accessorKey: 'city',
    },
    {
      header: 'SPORT',
      accessorKey: 'sport',
      cell: ({ getValue }) => (
        <Link to={`/sports/${getValue().toLowerCase()}`} className={styles.link}>
          {getValue()}
        </Link>
      )
    },
    {
      header: 'EVENT',
      accessorKey: 'event',
    },
    {
      header: 'RESULT',
      accessorKey: 'medal',
      cell: ({ getValue }) => {
        const val = getValue();
        const lower = val.toLowerCase();
        if (lower === 'gold' || lower === 'silver' || lower === 'bronze') {
          return <span className={`${styles.medalBadge} ${styles[lower]}`}>{val.toUpperCase()}</span>;
        }
        return <span className={styles.noMedal}>PARTICIPATED</span>;
      }
    }
  ];

  if (loading) {
    return (
      <div className={styles.detailContainer}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <Skeleton style={{ height: '12px', width: '120px', marginBottom: '8px' }} />
            <Skeleton style={{ height: '36px', width: '250px' }} />
          </div>
        </header>
        <section className={styles.bioCard}>
          <div className={styles.bioGrid}>
            <Skeleton style={{ height: '50px' }} />
            <Skeleton style={{ height: '50px' }} />
            <Skeleton style={{ height: '50px' }} />
            <Skeleton style={{ height: '50px' }} />
          </div>
        </section>
        <section className={styles.statsSection}>
          <div className={styles.medalGrid}>
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
          </div>
        </section>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.errorContainer}>
        <h3 className={styles.errorTitle}>BIOGRAPHY RETRIEVAL ERROR</h3>
        <p className={styles.errorText}>{error || 'Failed to locate biography record.'}</p>
        <Link to="/athletes" className={styles.backBtn}>BACK TO EXPLORER</Link>
      </div>
    );
  }

  return (
    <div className={styles.detailContainer}>
      {/* Page Header */}
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link to="/athletes" className={styles.backLink}>&larr; ATHLETE EXPLORER</Link>
          <h1 className={styles.name}>{data.name}</h1>
          <p className={styles.affiliation}>
            REPRESENTING <Link to={`/countries/${data.noc}`} className={styles.countryLink}>{data.team} ({data.noc})</Link>
          </p>
        </div>
      </header>

      <div className={styles.profileGrid}>
        {/* Biography characteristics */}
        <section className={styles.bioCard}>
          <h2 className={styles.sectionTitle}>PHYSICAL PROFILE</h2>
          <div className={styles.bioInfoGrid}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>SEX</span>
              <span className={styles.infoValue}>{data.sex === 'M' ? 'MALE' : 'FEMALE'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>LATEST RECORDED AGE</span>
              <span className={styles.infoValue}>
                {data.age_latest !== null ? `${Math.round(data.age_latest)} YRS` : '—'}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>LATEST RECORDED HEIGHT</span>
              <span className={styles.infoValue}>
                {data.height_latest !== null ? `${data.height_latest} CM` : '—'}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>LATEST RECORDED WEIGHT</span>
              <span className={styles.infoValue}>
                {data.weight_latest !== null ? `${data.weight_latest} KG` : '—'}
              </span>
            </div>
          </div>
        </section>

        {/* Medal Summary Stat Blocks */}
        <section className={styles.medalCard}>
          <h2 className={styles.sectionTitle}>MEDAL PROFILE</h2>
          <div className={styles.medalStats}>
            <div className={`${styles.medalBlock} ${styles.goldBlock}`}>
              <span className={styles.medalCount}>{data.gold_count}</span>
              <span className={styles.medalLabel}>GOLD</span>
            </div>
            <div className={`${styles.medalBlock} ${styles.silverBlock}`}>
              <span className={styles.medalCount}>{data.silver_count}</span>
              <span className={styles.medalLabel}>SILVER</span>
            </div>
            <div className={`${styles.medalBlock} ${styles.bronzeBlock}`}>
              <span className={styles.medalCount}>{data.bronze_count}</span>
              <span className={styles.medalLabel}>BRONZE</span>
            </div>
            <div className={`${styles.medalBlock} ${styles.totalBlock}`}>
              <span className={styles.medalCount}>{data.total_medals}</span>
              <span className={styles.medalLabel}>TOTALS</span>
            </div>
          </div>
        </section>
      </div>

      {/* Olympic History appearances table */}
      <section className={styles.historySection}>
        <h2 className={styles.sectionTitle}>OLYMPIC PARTICIPATION CHRONICLE ({data.total_appearances} APPEARANCES)</h2>
        <DataTable columns={columns} data={data.appearances || []} loading={false} pageSize={10} />
      </section>
    </div>
  );
}
