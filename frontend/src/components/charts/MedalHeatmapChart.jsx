import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useMedalHeatmap from '../../hooks/useAnalyticsExtras';
import ChartCard from './ChartCard';
import EmptyState from '../ui/EmptyState';
import { CHART_COLORS } from '../../utils/chartColors';
import styles from './MedalHeatmapChart.module.css';

function MedalHeatmapChart() {
  const { data, loading, error } = useMedalHeatmap();
  const navigate = useNavigate();

  const { countries, years, matrix, maxVal } = useMemo(() => {
    if (!data?.length) return { countries: [], years: [], matrix: {}, maxVal: 1 };
    const countrySet = [...new Set(data.map((d) => d.noc))];
    const yearSet = [...new Set(data.map((d) => d.year))].sort((a, b) => a - b);
    const mat = {};
    let max = 1;
    data.forEach((d) => {
      const key = `${d.noc}-${d.year}`;
      mat[key] = d.total;
      if (d.total > max) max = d.total;
    });
    return { countries: countrySet, years: yearSet, matrix: mat, maxVal: max };
  }, [data]);

  const getColor = (val) => {
    if (!val) return 'var(--bg-primary)';
    const intensity = val / maxVal;
    const alpha = 0.15 + intensity * 0.85;
    return `rgba(0, 133, 199, ${alpha})`;
  };

  return (
    <ChartCard
      title="MEDAL HEATMAP"
      subtitle="Country × year medal intensity (top 20 nations) — click a cell to filter"
      loading={loading}
      error={error}
      accentColor="var(--accent-yellow)"
      fullscreenEnabled
    >
      {!data?.length && !loading ? (
        <EmptyState compact title="NO HEATMAP DATA" message="Medal heatmap requires athlete-level data with country and year fields." />
      ) : (
        <div className={styles.wrapper}>
          <div className={styles.grid} style={{ gridTemplateColumns: `80px repeat(${years.length}, minmax(24px, 1fr))` }}>
            <div className={styles.corner} />
            {years.map((y) => (
              <div key={y} className={styles.yearLabel}>{y}</div>
            ))}
            {countries.map((noc) => {
              const label = data.find((d) => d.noc === noc)?.country || noc;
              return (
                <React.Fragment key={noc}>
                  <div
                    className={styles.countryLabel}
                    onClick={() => navigate(`/countries/${noc}`)}
                    title={`View ${label}`}
                  >
                    {noc}
                  </div>
                  {years.map((year) => {
                    const val = matrix[`${noc}-${year}`] || 0;
                    return (
                      <div
                        key={`${noc}-${year}`}
                        className={styles.cell}
                        style={{ backgroundColor: getColor(val) }}
                        title={`${label} ${year}: ${val} medals`}
                        onClick={() => val > 0 && navigate(`/countries/${noc}`)}
                      />
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
          <div className={styles.legend}>
            <span>Low</span>
            <div className={styles.legendBar} />
            <span>High</span>
          </div>
        </div>
      )}
    </ChartCard>
  );
}

export default React.memo(MedalHeatmapChart);
