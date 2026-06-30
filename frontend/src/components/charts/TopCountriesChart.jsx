import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import useTopCountries from '../../hooks/useTopCountries';
import ChartCard from './ChartCard';
import PodiumRank from '../ui/PodiumRank';
import { CHART_COLORS } from '../../utils/chartColors';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
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
        <p style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>{data.country_name} ({data.noc})</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ color: CHART_COLORS[1] }}>Gold: <span style={{ fontWeight: 750 }}>{data.gold_count}</span></div>
          <div style={{ color: CHART_COLORS[5] }}>Silver: <span style={{ fontWeight: 750 }}>{data.silver_count}</span></div>
          <div style={{ color: CHART_COLORS[2] }}>Bronze: <span style={{ fontWeight: 750 }}>{data.bronze_count}</span></div>
          <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '4px', paddingTop: '4px', fontWeight: 800 }}>
            Total Medals: {data.total_medals}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

function TopCountriesChart() {
  const { data, loading, error } = useTopCountries();

  const top3 = data ? data.slice(0, 3).map(item => ({
    label: item.country_name || item.noc,
    value: item.total_medals.toLocaleString(),
    subtext: `${item.gold_count} G / ${item.silver_count} S / ${item.bronze_count} B`
  })) : [];

  const remaining = data ? data.slice(3) : [];

  return (
    <ChartCard
      title="TOP COUNTRIES LEADERBOARD"
      subtitle="Top 3 on podium; ranks 4+ detailed in track bars"
      loading={loading}
      error={error}
      accentColor="var(--accent-blue)"
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {data && data.length > 0 ? (
          <>
            <PodiumRank items={top3} />
            <div style={{ flexGrow: 1, minHeight: '90px', marginTop: 'var(--space-8)' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={remaining}
                  layout="vertical"
                  margin={{ top: 0, right: 5, left: -25, bottom: 0 }}
                >
                  <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" opacity={0.5} horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="noc" 
                    type="category" 
                    tickLine={false}
                    axisLine={false}
                    style={{ fontSize: '0.65rem', fontFamily: 'var(--font-heading)', fill: 'var(--text-primary)', fontWeight: 700 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="total_medals" 
                    name="TOTAL MEDALS" 
                    barSize={6}
                    radius={[0, 2, 2, 0]}
                  >
                    {remaining.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[(index + 3) % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            No records found
          </div>
        )}
      </div>
    </ChartCard>
  );
}
export default React.memo(TopCountriesChart);
