import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import useAgeDistribution from '../../hooks/useAgeDistribution';
import ChartCard from './ChartCard';
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
        <p style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Age Group: {data.range}</p>
        <div>Athlete Count: <span style={{ fontWeight: 750 }}>{data.count.toLocaleString()}</span></div>
      </div>
    );
  }
  return null;
};

export default function AgeDistributionChart() {
  const { data, loading, error } = useAgeDistribution();

  return (
    <ChartCard
      title="ATHLETE AGE DISTRIBUTION"
      subtitle="Frequency of age categories at the time of competing"
      loading={loading}
      error={error}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
        >
          <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" opacity={0.5} vertical={false} />
          <XAxis 
            dataKey="range" 
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
          <Bar 
            dataKey="count" 
            name="ATHLETES" 
            barSize={20}
            radius={[2, 2, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
