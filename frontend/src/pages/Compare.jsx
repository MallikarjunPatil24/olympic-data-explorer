import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useCompareData } from '../hooks/useAnalyticsExtras';
import useFilterOptions from '../hooks/useFilterOptions';
import ChartCard from '../components/charts/ChartCard';
import { CHART_COLORS } from '../utils/chartColors';
import styles from './Compare.module.css';

export default function Compare() {
  const { options } = useFilterOptions();
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedSports, setSelectedSports] = useState([]);
  const { data, loading, error } = useCompareData(selectedCountries, selectedSports);

  const toggleCountry = (noc) => {
    setSelectedCountries((prev) =>
      prev.includes(noc) ? prev.filter((c) => c !== noc) : prev.length < 3 ? [...prev, noc] : prev
    );
  };

  const toggleSport = (sport) => {
    setSelectedSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : prev.length < 3 ? [...prev, sport] : prev
    );
  };

  const chartData = [
    ...(data?.countries || []).map((c) => ({ name: c.label, gold: c.gold, silver: c.silver, bronze: c.bronze, total: c.total, athletes: c.athletes, type: 'country' })),
    ...(data?.sports || []).map((s) => ({ name: s.label, gold: s.gold, silver: s.silver, bronze: s.bronze, total: s.total, athletes: s.athletes, type: 'sport' })),
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>COMPARE MODE</h1>
        <p className={styles.subtitle}>Select up to 3 countries or sports to compare medal performance side by side</p>
      </header>

      <div className={styles.selectors}>
        <section className={styles.selectorSection}>
          <h3 className={styles.sectionLabel}>COUNTRIES (max 3)</h3>
          <div className={styles.chipGrid}>
            {options.countries.slice(0, 30).map((c) => (
              <button
                key={c.noc}
                type="button"
                className={`${styles.chip} ${selectedCountries.includes(c.noc) ? styles.chipActive : ''}`}
                onClick={() => toggleCountry(c.noc)}
              >
                {c.noc}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.selectorSection}>
          <h3 className={styles.sectionLabel}>SPORTS (max 3)</h3>
          <div className={styles.chipGrid}>
            {options.sports.slice(0, 30).map((s) => (
              <button
                key={s}
                type="button"
                className={`${styles.chip} ${selectedSports.includes(s) ? styles.chipActive : ''}`}
                onClick={() => toggleSport(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </section>
      </div>

      {(selectedCountries.length > 0 || selectedSports.length > 0) && (
        <div className={styles.results}>
          <ChartCard title="MEDAL COMPARISON" subtitle="Stacked medal breakdown" loading={loading} error={error}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" opacity={0.5} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="gold" name="Gold" stackId="a" fill={CHART_COLORS[1]} animationDuration={600} />
                  <Bar dataKey="silver" name="Silver" stackId="a" fill={CHART_COLORS[5]} animationDuration={600} />
                  <Bar dataKey="bronze" name="Bronze" stackId="a" fill={CHART_COLORS[2]} animationDuration={600} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className={styles.emptyMsg}>Select countries or sports above to compare.</p>
            )}
          </ChartCard>

          {chartData.length > 0 && (
            <div className={styles.statsGrid}>
              {chartData.map((item) => (
                <div key={item.name} className={styles.statCard}>
                  <h4>{item.name}</h4>
                  <div className={styles.statRow}><span>Total Medals</span><strong>{item.total}</strong></div>
                  <div className={styles.statRow}><span>Athletes</span><strong>{item.athletes?.toLocaleString()}</strong></div>
                  <div className={styles.medalBreakdown}>
                    <span className={styles.gold}>🥇 {item.gold}</span>
                    <span className={styles.silver}>🥈 {item.silver}</span>
                    <span className={styles.bronze}>🥉 {item.bronze}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
