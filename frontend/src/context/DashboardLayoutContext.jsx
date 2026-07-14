import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDashboardLayout, setDashboardLayout } from '../utils/localStorage';

const DEFAULT_CHARTS = [
  { id: 'medalTrend', label: 'Medal Trend', visible: true, span: 12 },
  { id: 'topCountries', label: 'Top Countries', visible: true, span: 6 },
  { id: 'topSports', label: 'Top Sports', visible: true, span: 6 },
  { id: 'gender', label: 'Gender Analysis', visible: true, span: 8 },
  { id: 'medalDist', label: 'Medal Distribution', visible: true, span: 4 },
  { id: 'participation', label: 'Athlete Participation', visible: true, span: 7 },
  { id: 'age', label: 'Age Distribution', visible: true, span: 5 },
  { id: 'hostCities', label: 'Host Cities', visible: true, span: 12 },
  { id: 'heatmap', label: 'Medal Heatmap', visible: true, span: 12 },
  { id: 'medalMap', label: 'Medal Map', visible: true, span: 12 },
];

const DashboardLayoutContext = createContext();

export function DashboardLayoutProvider({ children }) {
  const [charts, setCharts] = useState(() => getDashboardLayout() || DEFAULT_CHARTS);
  const [customizeOpen, setCustomizeOpen] = useState(false);

  useEffect(() => {
    setDashboardLayout(charts);
  }, [charts]);

  const toggleChart = (id) => {
    setCharts((prev) => prev.map((c) => (c.id === id ? { ...c, visible: !c.visible } : c)));
  };

  const resetLayout = () => setCharts(DEFAULT_CHARTS);

  return (
    <DashboardLayoutContext.Provider value={{ charts, toggleChart, resetLayout, customizeOpen, setCustomizeOpen }}>
      {children}
    </DashboardLayoutContext.Provider>
  );
}

export function useDashboardLayout() {
  const ctx = useContext(DashboardLayoutContext);
  if (!ctx) throw new Error('useDashboardLayout must be used within DashboardLayoutProvider');
  return ctx;
}

export default DashboardLayoutContext;
