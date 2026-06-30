import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import useTopSports from '../../hooks/useTopSports';
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
        <p style={{ fontWeight: 700, marginBottom: 'var(--space-4)', textTransform: 'uppercase' }}>{data.sport}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div>Athletes: <span style={{ fontWeight: 750 }}>{data.athlete_count.toLocaleString()}</span></div>
          <div>Events: <span style={{ fontWeight: 750 }}>{data.event_count.toLocaleString()}</span></div>
          <div>Medals Awarded: <span style={{ fontWeight: 750 }}>{data.medal_count.toLocaleString()}</span></div>
        </div>
      </div>
    );
  }
  return null;
};

export default function TopSportsChart() {
  const { data, loading, error } = useTopSports();

  const top3 = data ? data.slice(0, 3).map(item => ({
    label: item.sport,
    value: item.athlete_count.toLocaleString(),
    subtext: `${item.event_count} Events / ${item.medal_count} Medals`
  })) : [];

  const remaining = data ? data.slice(3) : [];

  return (
    <ChartCard
      title="TOP SPORTS BY HEADCOUNT"
      subtitle="Top 3 on podium; ranks 4+ detailed in track bars"
      loading={loading}
      error={error}
      accentColor="var(--accent-green)"
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
                  margin={{ top: 0, right: 5, left: -10, bottom: 0 }}
                >
                  <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" opacity={0.5} horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="sport" 
                    type="category" 
                    tickLine={false}
                    axisLine={false}
                    style={{ fontSize: '0.65rem', fontFamily: 'var(--font-heading)', fill: 'var(--text-primary)', fontWeight: 700 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="athlete_count" 
                    name="ATHLETES" 
                    barSize={6}
                    radius={[0, 2, 2, 0]}
                  >
                    {remaining.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[(index + 4) % CHART_COLORS.length]} />
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
