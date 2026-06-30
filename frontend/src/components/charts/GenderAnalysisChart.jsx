import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import useOlympicYears from '../../hooks/useOlympicYears';
import ChartCard from './ChartCard';
import { CHART_COLORS } from '../../utils/chartColors';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const male = payload[0]?.value || 0;
    const female = payload[1]?.value || 0;
    const total = male + female;
    const malePct = total > 0 ? ((male / total) * 100).toFixed(1) : '0';
    const femalePct = total > 0 ? ((female / total) * 100).toFixed(1) : '0';
    
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ color: CHART_COLORS[0] }}>
            Male: <span style={{ fontWeight: 750 }}>{male.toLocaleString()} ({malePct}%)</span>
          </div>
          <div style={{ color: CHART_COLORS[2] }}>
            Female: <span style={{ fontWeight: 750 }}>{female.toLocaleString()} ({femalePct}%)</span>
          </div>
          <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '4px', paddingTop: '4px', fontWeight: 800 }}>
            Total: {total.toLocaleString()}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function GenderAnalysisChart() {
  const { data, loading, error } = useOlympicYears();

  return (
    <ChartCard
      title="GENDER PARTICIPATION OVER TIME"
      subtitle="Timeline showing male vs. female athlete representation"
      loading={loading}
      error={error}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
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
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="rect"
            iconSize={10}
            wrapperStyle={{ fontSize: '0.75rem', fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--text-secondary)' }}
          />
          <Area 
            type="monotone" 
            dataKey="male_athlete_count" 
            name="MALE ATHLETES" 
            stackId="1" 
            stroke={CHART_COLORS[0]} 
            fill={CHART_COLORS[0]} 
            fillOpacity={0.15} 
            filter="url(#ledGlow)"
          />
          <Area 
            type="monotone" 
            dataKey="female_athlete_count" 
            name="FEMALE ATHLETES" 
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
