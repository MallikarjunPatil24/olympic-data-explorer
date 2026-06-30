import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCountryProfile } from '../hooks/useCountryProfile';
import ChartCard from '../components/charts/ChartCard';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CHART_COLORS } from '../utils/chartColors';
import { Skeleton, KpiCardSkeleton, ChartSkeleton } from '../components/ui/Skeleton';
import styles from './CountryProfile.module.css';

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

export default function CountryProfile() {
  const { code } = useParams();
  const { data, loading, error } = useCountryProfile(code);

  const getInsights = () => {
    if (!data) return [];
    const insights = [];
    
    // Top Sport insight
    if (data.top_sports && data.top_sports.length > 0) {
      const bestSport = data.top_sports[0];
      insights.push({
        type: 'SPORT',
        title: 'STRONGEST OLYMPIC SPORT',
        text: `${data.country_name} dominates in ${bestSport.sport.toUpperCase()} with ${bestSport.total} total medals won (${bestSport.gold} Gold, ${bestSport.silver} Silver, ${bestSport.bronze} Bronze) historically.`
      });
    }
    
    // Top Year appearance insight
    if (data.medal_trend && data.medal_trend.length > 0) {
      const sortedTrend = [...data.medal_trend].sort((a, b) => b.total - a.total);
      const bestYear = sortedTrend[0];
      insights.push({
        type: 'EDITION',
        title: 'MOST SUCCESSFUL EDITION',
        text: `The peak athletic performance was recorded in ${bestYear.year} where the delegation brought home ${bestYear.total} total medals.`
      });
    }

    return insights;
  };

  const insights = useMemo(() => getInsights(), [data]);

  if (loading) {
    return (
      <div className={styles.profileContainer}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <Skeleton style={{ height: '12px', width: '120px', marginBottom: '8px' }} />
            <Skeleton style={{ height: '36px', width: '250px' }} />
          </div>
        </header>
        <section className={styles.medalCard}>
          <div className={styles.medalStats}>
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
          </div>
        </section>
        <div className={styles.chartsGrid}>
          <div className={styles.span12}><ChartSkeleton /></div>
          <div className={styles.span12}><ChartSkeleton /></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.errorContainer}>
        <h3 className={styles.errorTitle}>PROFILE RETRIEVAL ERROR</h3>
        <p className={styles.errorText}>{error || 'Failed to locate country profile record.'}</p>
        <Link to="/countries" className={styles.backBtn}>BACK TO SUMMARY</Link>
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link to="/countries" className={styles.backLink}>&larr; COUNTRIES SUMMARY</Link>
          <h1 className={styles.countryName}>{data.country_name}</h1>
          <p className={styles.subtitle}>Historical Performance Analysis | NOC Code: {data.noc}</p>
        </div>
      </header>

      {/* KPI Medal Breakdown */}
      <section className={styles.medalCard}>
        <div className={styles.medalStats}>
          <div className={`${styles.medalBlock} ${styles.goldBlock}`}>
            <span className={styles.medalCount}>{data.gold_count}</span>
            <span className={styles.medalLabel}>GOLD MEDALS</span>
          </div>
          <div className={`${styles.medalBlock} ${styles.silverBlock}`}>
            <span className={styles.medalCount}>{data.silver_count}</span>
            <span className={styles.medalLabel}>SILVER MEDALS</span>
          </div>
          <div className={`${styles.medalBlock} ${styles.bronzeBlock}`}>
            <span className={styles.medalCount}>{data.bronze_count}</span>
            <span className={styles.medalLabel}>BRONZE MEDALS</span>
          </div>
          <div className={`${styles.medalBlock} ${styles.totalBlock}`}>
            <span className={styles.medalCount}>{data.total_medals}</span>
            <span className={styles.medalLabel}>TOTAL MEDALS</span>
          </div>
          <div className={`${styles.medalBlock} ${styles.athleteBlock}`}>
            <span className={styles.medalCount}>{data.total_athletes_sent.toLocaleString()}</span>
            <span className={styles.medalLabel}>UNIQUE ATHLETES SENT</span>
          </div>
        </div>
      </section>

      {/* Insights Panels */}
      {insights.length > 0 && (
        <section className={styles.insightsSection}>
          <div className={styles.insightsContainer}>
            {insights.map((insight, idx) => (
              <div key={idx} className={styles.insightCard}>
                <div className={styles.insightAccent} />
                <h4 className={styles.insightTitle}>{insight.title}</h4>
                <p className={styles.insightText}>{insight.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Charts Grid */}
      <div className={styles.chartsGrid}>
        {/* Scoped Medal Trend Timeline */}
        <div className={styles.span12}>
          <ChartCard
            title="HISTORICAL MEDAL TIMELINE"
            subtitle={`Year-over-year progress of medals won by ${data.country_name}`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.medal_trend}
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

        {/* Top Medal Sports Bar chart */}
        <div className={styles.span12}>
          <ChartCard
            title="TOP MEDAL-EARNING SPORTS"
            subtitle={`Distribution of Olympic awards across sports disciplines for ${data.country_name}`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.top_sports}
                layout="vertical"
                margin={{ top: 5, right: 5, left: 15, bottom: 5 }}
              >
                <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" opacity={0.5} horizontal={false} />
                <XAxis 
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  style={{ fontSize: '0.7rem', fontFamily: 'var(--font-body)', fill: 'var(--text-muted)' }}
                />
                <YAxis 
                  dataKey="sport" 
                  type="category" 
                  tickLine={false}
                  axisLine={false}
                  style={{ fontSize: '0.7rem', fontFamily: 'var(--font-body)', fill: 'var(--text-primary)', fontWeight: 600 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="rect"
                  iconSize={10}
                  wrapperStyle={{ fontSize: '0.75rem', fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--text-secondary)' }}
                />
                <Bar 
                  dataKey="gold" 
                  name="GOLD" 
                  stackId="a" 
                  fill={CHART_COLORS[1]} 
                  barSize={14}
                />
                <Bar 
                  dataKey="silver" 
                  name="SILVER" 
                  stackId="a" 
                  fill={CHART_COLORS[5]} 
                  barSize={14}
                />
                <Bar 
                  dataKey="bronze" 
                  name="BRONZE" 
                  stackId="a" 
                  fill={CHART_COLORS[2]} 
                  barSize={14}
                  radius={[0, 2, 2, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
