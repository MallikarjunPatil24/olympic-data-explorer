import React from 'react';
import useDashboardData from '../hooks/useDashboardData';
import KpiCardGrid from '../components/dashboard/KpiCardGrid';
import KpiCard from '../components/dashboard/KpiCard';
import FilterBar from '../components/filters/FilterBar';
import MedalTrendChart from '../components/charts/MedalTrendChart';
import TopCountriesChart from '../components/charts/TopCountriesChart';
import TopSportsChart from '../components/charts/TopSportsChart';
import GenderAnalysisChart from '../components/charts/GenderAnalysisChart';
import AgeDistributionChart from '../components/charts/AgeDistributionChart';
import MedalDistributionChart from '../components/charts/MedalDistributionChart';
import AthleteParticipationChart from '../components/charts/AthleteParticipationChart';
import HostCitiesChart from '../components/charts/HostCitiesChart';
import { KpiCardSkeleton, ChartSkeleton } from '../components/ui/Skeleton';
import { exportToPDF, printDashboard } from '../utils/exportUtils';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { data, loading, error } = useDashboardData();

  return (
    <div className={styles.dashboardContainer} id="dashboard-view">
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>DASHBOARD OVERVIEW</h1>
          <p className={styles.subtitle}>Unified baseline statistics mapping historic Olympic event participation (1896 – 2022)</p>
        </div>
        <div className={styles.exportActions}>
          <button 
            className={styles.exportBtn} 
            onClick={() => exportToPDF('dashboard-view', 'Olympic_Dashboard')}
            title="Download Dashboard view as PDF"
          >
            📄 PDF
          </button>
          <button 
            className={styles.exportBtn} 
            onClick={printDashboard}
            title="Print Dashboard Report"
          >
            🖨️ PRINT
          </button>
        </div>
      </header>

      <div className={styles.stickyFilterBar}>
        <FilterBar />
      </div>

      {loading ? (
        <div className={styles.content}>
          <KpiCardGrid>
            {Array.from({ length: 6 }).map((_, i) => <KpiCardSkeleton key={i} />)}
          </KpiCardGrid>
          <div className={styles.visualizationsGrid}>
            <div className={styles.span12}><ChartSkeleton /></div>
            <div className={styles.span6}><ChartSkeleton /></div>
            <div className={styles.span6}><ChartSkeleton /></div>
            <div className={styles.span8}><ChartSkeleton /></div>
            <div className={styles.span4}><ChartSkeleton /></div>
            <div className={styles.span7}><ChartSkeleton /></div>
            <div className={styles.span5}><ChartSkeleton /></div>
            <div className={styles.span12}><ChartSkeleton /></div>
          </div>
        </div>
      ) : error ? (
        <div className={styles.errorContainer}>
          <h3 className={styles.errorTitle}>CONNECTION FAILURE</h3>
          <p className={styles.errorText}>{error}</p>
        </div>
      ) : (
        <div className={styles.content}>
          <KpiCardGrid>
            <KpiCard 
              label="TOTAL ATHLETES" 
              value={data?.total_athletes} 
              accentColor="blue" 
            />
            <KpiCard 
              label="TOTAL COUNTRIES" 
              value={data?.total_countries} 
              accentColor="yellow" 
            />
            <KpiCard 
              label="OLYMPIC GAMES EDITIONS" 
              value={data?.total_games} 
              accentColor="black" 
            />
            <KpiCard 
              label="TOTAL SPORTS" 
              value={data?.total_sports} 
              accentColor="green" 
            />
            <KpiCard 
              label="TOTAL EVENTS" 
              value={data?.total_events} 
              accentColor="red" 
            />
            <KpiCard 
              label="TOTAL MEDALS AWARDED" 
              value={data?.total_medals} 
              accentColor="blue" 
            />
          </KpiCardGrid>
          
          <div className={styles.visualizationsGrid}>
            <div className={styles.span12}>
              <MedalTrendChart />
            </div>
            
            <div className={styles.span6}>
              <TopCountriesChart />
            </div>
            
            <div className={styles.span6}>
              <TopSportsChart />
            </div>
            
            <div className={styles.span8}>
              <GenderAnalysisChart />
            </div>
            
            <div className={styles.span4}>
              <MedalDistributionChart />
            </div>
            
            <div className={styles.span7}>
              <AthleteParticipationChart />
            </div>
            
            <div className={styles.span5}>
              <AgeDistributionChart />
            </div>
            
            <div className={styles.span12}>
              <HostCitiesChart />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
