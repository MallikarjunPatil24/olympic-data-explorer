import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSportProfile } from '../hooks/useSportProfile';
import ChartCard from '../components/charts/ChartCard';
import DataTable from '../components/table/DataTable';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { CHART_COLORS } from '../utils/chartColors';
import { Skeleton, KpiCardSkeleton, ChartSkeleton } from '../components/ui/Skeleton';
import styles from './SportProfile.module.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        padding: 'var(--space-8) var(--space-12)',
        fontSize: '0.75rem',
        fontFamily: 'var(--font-body)',
        color: 'var(--text-primary)',
        borderRadius: 'var(--radius-sm)',
        boxShadow: 'var(--card-shadow)'
      }}>
        <p style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>{label}</p>
        {payload.map((item, index) => (
          <div key={index} style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-16)', color: item.color }}>
            <span>{item.name}:</span>
            <span style={{ fontWeight: 750 }}>{item.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        padding: 'var(--space-8) var(--space-12)',
        fontSize: '0.75rem',
        fontFamily: 'var(--font-body)',
        color: 'var(--text-primary)',
        borderRadius: 'var(--radius-sm)',
        boxShadow: 'var(--card-shadow)'
      }}>
        <p style={{ fontWeight: 700, color: data.payload.color }}>{data.name}</p>
        <div>Count: <span style={{ fontWeight: 750 }}>{data.value.toLocaleString()} ({data.payload.pct}%)</span></div>
      </div>
    );
  }
  return null;
};

export default function SportProfile() {
  const { name } = useParams();
  const { data, loading, error } = useSportProfile(name);

  const columns = [
    {
      header: 'ATHLETE NAME',
      accessorKey: 'name',
      cell: ({ getValue }) => (
        <Link to={`/athletes/${getValue()}`} className={styles.tableLink}>
          {getValue()}
        </Link>
      )
    },
    {
      header: 'NOC',
      accessorKey: 'noc',
      cell: ({ getValue }) => (
        <Link to={`/countries/${getValue()}`} className={styles.tableLink}>
          <span className={styles.nocBadge}>{getValue()}</span>
        </Link>
      )
    },
    {
      header: 'GOLD',
      accessorKey: 'gold_count',
      cell: ({ getValue }) => <div className={styles.numberCell}>{getValue()}</div>
    },
    {
      header: 'SILVER',
      accessorKey: 'silver_count',
      cell: ({ getValue }) => <div className={styles.numberCell}>{getValue()}</div>
    },
    {
      header: 'BRONZE',
      accessorKey: 'bronze_count',
      cell: ({ getValue }) => <div className={styles.numberCell}>{getValue()}</div>
    },
    {
      header: 'TOTAL MEDALS',
      accessorKey: 'total_medals',
      cell: ({ getValue }) => (
        <div className={`${styles.numberCell} ${styles.totalMedalsCell}`}>{getValue()}</div>
      )
    }
  ];

  const totalAthletes = useMemo(() => {
    if (!data || !data.gender_split) return 0;
    return data.gender_split.male_count + data.gender_split.female_count;
  }, [data]);

  const pieData = useMemo(() => {
    if (!data || !data.gender_split) return [];
    return [
      { name: 'MALE ATHLETES', value: data.gender_split.male_count, pct: data.gender_split.male_pct, color: CHART_COLORS[0] },
      { name: 'FEMALE ATHLETES', value: data.gender_split.female_count, pct: data.gender_split.female_pct, color: CHART_COLORS[2] }
    ];
  }, [data]);

  if (loading) {
    return (
      <div className={styles.profileContainer}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <Skeleton style={{ height: '12px', width: '120px', marginBottom: '8px' }} />
            <Skeleton style={{ height: '36px', width: '250px' }} />
          </div>
        </header>
        <section className={styles.statsCard}>
          <div className={styles.statsGrid}>
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
          </div>
        </section>
        <div className={styles.chartsRow}>
          <div className={styles.span4}><ChartSkeleton /></div>
          <div className={styles.span8}><ChartSkeleton /></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.errorContainer}>
        <h3 className={styles.errorTitle}>SPORT PROFILE ERROR</h3>
        <p className={styles.errorText}>{error || 'Failed to locate sport profile record.'}</p>
        <Link to="/sports" className={styles.backBtn}>BACK TO DIRECTORY</Link>
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link to="/sports" className={styles.backLink}>&larr; SPORTS DIRECTORY</Link>
          <h1 className={styles.sportName}>{data.sport.toUpperCase()}</h1>
          <p className={styles.subtitle}>Historical Performance & Physical Participation Profile</p>
        </div>
      </header>

      {/* Stats row */}
      <section className={styles.statsCard}>
        <div className={styles.statsGrid}>
          <div className={styles.statBlock}>
            <span className={styles.statCount}>{totalAthletes.toLocaleString()}</span>
            <span className={styles.statLabel}>TOTAL UNIQUE ATHLETES</span>
          </div>
          <div className={styles.statBlock}>
            <span className={styles.statCount}>{data.participating_countries_count}</span>
            <span className={styles.statLabel}>PARTICIPATING COUNTRIES (NOCs)</span>
          </div>
          <div className={styles.statBlock}>
            <span className={styles.statCount}>{data.gender_split.male_count.toLocaleString()}</span>
            <span className={styles.statLabel}>MALE COMPETITORS</span>
          </div>
          <div className={styles.statBlock}>
            <span className={styles.statCount}>{data.gender_split.female_count.toLocaleString()}</span>
            <span className={styles.statLabel}>FEMALE COMPETITORS</span>
          </div>
        </div>
      </section>

      {/* Visual Analytics */}
      <div className={styles.chartsRow}>
        {/* Gender split pie */}
        <div className={styles.span4}>
          <ChartCard
            title="GENDER SPLIT RATIO"
            subtitle="Breakdown of male vs. female representation"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '0.75rem', fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--text-secondary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Historical medals trend */}
        <div className={styles.span8}>
          <ChartCard
            title="HISTORICAL MEDAL ACQUISITIONS"
            subtitle={`Year-over-year progress of medals awarded in ${data.sport}`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.historical_trend}
                margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
              >
                <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" opacity={0.5} vertical={false} />
                <XAxis 
                  dataKey="year" 
                  tickLine={false}
                  axisLine={false}
                  style={{ fontSize: '0.7rem', fontFamily: 'var(--font-body)', fill: 'var(--text-muted)' }}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  style={{ fontSize: '0.7rem', fontFamily: 'var(--font-body)', fill: 'var(--text-muted)' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="rect"
                  iconSize={10}
                  wrapperStyle={{ fontSize: '0.75rem', fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--text-secondary)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="gold" 
                  name="GOLD" 
                  stackId="1" 
                  stroke={CHART_COLORS[1]} 
                  fill={CHART_COLORS[1]} 
                  fillOpacity={0.7} 
                />
                <Area 
                  type="monotone" 
                  dataKey="silver" 
                  name="SILVER" 
                  stackId="1" 
                  stroke={CHART_COLORS[5]} 
                  fill={CHART_COLORS[5]} 
                  fillOpacity={0.7} 
                />
                <Area 
                  type="monotone" 
                  dataKey="bronze" 
                  name="BRONZE" 
                  stackId="1" 
                  stroke={CHART_COLORS[2]} 
                  fill={CHART_COLORS[2]} 
                  fillOpacity={0.7} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Top Athletes Table */}
      <section className={styles.tableSection}>
        <h2 className={styles.sectionTitle}>ALL-TIME TOP MEDALISTS IN {data.sport.toUpperCase()}</h2>
        <DataTable columns={columns} data={data.top_athletes || []} loading={false} pageSize={10} />
      </section>
    </div>
  );
}
