import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import useMedalTrend from '../../hooks/useMedalTrend';
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

function MedalTrendChart() {
  const { data, loading, error } = useMedalTrend();

  return (
    <ChartCard 
      title="MEDAL ACQUISITIONS TIMELINE" 
      subtitle="Historical growth of Gold, Silver, and Bronze awards across editions"
      loading={loading}
      error={error}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
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
            dataKey="gold_count" 
            name="GOLD" 
            stackId="1" 
            stroke={CHART_COLORS[1]} 
            fill={CHART_COLORS[1]} 
            fillOpacity={0.15} 
            filter="url(#ledGlow)"
          />
          <Area 
            type="monotone" 
            dataKey="silver_count" 
            name="SILVER" 
            stackId="1" 
            stroke={CHART_COLORS[5]} 
            fill={CHART_COLORS[5]} 
            fillOpacity={0.15} 
            filter="url(#ledGlow)"
          />
          <Area 
            type="monotone" 
            dataKey="bronze_count" 
            name="BRONZE" 
            stackId="1" 
            stroke={CHART_COLORS[2]} 
            fill={CHART_COLORS[2]} 
            fillOpacity={0.15} 
            filter="url(#ledGlow)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
export default React.memo(MedalTrendChart);
