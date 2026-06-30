import React from 'react';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import useMedalDistribution from '../../hooks/useMedalDistribution';
import ChartCard from './ChartCard';
import { CHART_COLORS } from '../../utils/chartColors';

const CustomTooltip = ({ active, payload }) => {
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
        <div>Count: <span style={{ fontWeight: 750 }}>{data.value.toLocaleString()}</span></div>
      </div>
    );
  }
  return null;
};

export default function MedalDistributionChart() {
  const { data, loading, error } = useMedalDistribution();

  // Transform data format: overall distribution contains a single object with gold, silver, bronze
  const overall = data[0];
  const chartData = overall
    ? [
        { name: 'GOLD', value: overall.gold, color: CHART_COLORS[1] },   // Olympic Yellow
        { name: 'SILVER', value: overall.silver, color: CHART_COLORS[5] }, // Light Gray
        { name: 'BRONZE', value: overall.bronze, color: CHART_COLORS[2] }, // Olympic Red
      ]
    : [];

  return (
    <ChartCard
      title="MEDAL TYPE DISTRIBUTION"
      subtitle="Proportion of Gold, Silver, and Bronze awards in matches"
      loading={loading}
      error={error}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
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
  );
}
