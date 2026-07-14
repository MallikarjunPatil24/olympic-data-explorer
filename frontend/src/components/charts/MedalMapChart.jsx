import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useTopCountries from '../../hooks/useTopCountries';
import ChartCard from './ChartCard';
import EmptyState from '../ui/EmptyState';
import styles from './MedalMapChart.module.css';

const REGION_HINTS = {
  USA: 'Americas', CAN: 'Americas', MEX: 'Americas', BRA: 'Americas',
  GBR: 'Europe', FRA: 'Europe', GER: 'Europe', ITA: 'Europe', NED: 'Europe', SWE: 'Europe',
  CHN: 'Asia', JPN: 'Asia', KOR: 'Asia', IND: 'Asia', AUS: 'Oceania',
  RUS: 'Europe', URS: 'Europe', KOR: 'Asia',
};

function MedalMapChart() {
  const { data, loading, error } = useTopCountries();
  const navigate = useNavigate();

  const bubbles = useMemo(() => {
    if (!data?.length) return [];
    const max = Math.max(...data.map((d) => d.total_medals), 1);
    return data.slice(0, 24).map((d, i) => ({
      ...d,
      size: 28 + (d.total_medals / max) * 72,
      region: REGION_HINTS[d.noc] || 'Global',
      x: 10 + ((i * 37 + d.noc.charCodeAt(0) * 13) % 80),
      y: 10 + ((i * 53 + d.total_medals * 3) % 70),
    }));
  }, [data]);

  return (
    <ChartCard
      title="GLOBAL MEDAL MAP"
      subtitle="Bubble size = total medals — click to view country profile"
      loading={loading}
      error={error}
      accentColor="var(--accent-blue)"
      fullscreenEnabled
    >
      {!data?.length && !loading ? (
        <EmptyState compact title="NO MAP DATA" message="Country medal data is unavailable for the current filters." />
      ) : (
        <div className={styles.mapContainer}>
          <div className={styles.mapBg}>
            {bubbles.map((b) => (
              <button
                key={b.noc}
                type="button"
                className={styles.bubble}
                style={{
                  width: b.size,
                  height: b.size,
                  left: `${b.x}%`,
                  top: `${b.y}%`,
                  opacity: 0.55 + (b.total_medals / Math.max(...bubbles.map((x) => x.total_medals))) * 0.45,
                }}
                onClick={() => navigate(`/countries/${b.noc}`)}
                title={`${b.country_name}: ${b.total_medals} medals (${b.region})`}
              >
                <span className={styles.noc}>{b.noc}</span>
                <span className={styles.count}>{b.total_medals}</span>
              </button>
            ))}
          </div>
          <div className={styles.regionLegend}>
            {['Americas', 'Europe', 'Asia', 'Oceania', 'Global'].map((r) => (
              <span key={r} className={styles.regionTag}>{r}</span>
            ))}
          </div>
        </div>
      )}
    </ChartCard>
  );
}

export default React.memo(MedalMapChart);
