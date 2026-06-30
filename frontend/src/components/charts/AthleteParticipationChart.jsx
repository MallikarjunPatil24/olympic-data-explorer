import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useOlympicYears from '../../hooks/useOlympicYears';
import ChartCard from './ChartCard';
import { CHART_COLORS } from '../../utils/chartColors';

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
        <p style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Olympic Edition: {label}</p>
        <div>Total Athletes: <span style={{ fontWeight: 750 }}>{payload[0].value.toLocaleString()}</span></div>
      </div>
    );
  }
  return null;
};

export default function AthleteParticipationChart() {
  const { data, loading, error } = useOlympicYears();

  return (
    <ChartCard
      title="ATHLETE HEADCOUNT TRENDS"
      subtitle="Total volume of unique athletes participating in each Olympic edition"
      loading={loading}
      error={error}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
        >
          <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" opacity={0.5} vertical={false} />
          <XAxis 
            dataKey="games" 
            tickLine={false}
            axisLine={false}
            style={{ fontSize: '0.65rem', fontFamily: 'var(--font-body)', fill: 'var(--text-muted)' }}
          />
          <YAxis 
            tickLine={false}
            axisLine={false}
            style={{ fontSize: '0.7rem', fontFamily: 'var(--font-body)', fill: 'var(--text-muted)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="athlete_count" 
            name="ATHLETES" 
            stroke={CHART_COLORS[0]} // Olympic Blue
            strokeWidth={2.5}
            filter="url(#ledGlow)"
            dot={{ r: 3, strokeWidth: 1 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
