import React, { lazy, Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { FilterProvider } from './context/FilterContext';
import { ThemeProvider } from './context/ThemeContext';
import { ChartSkeleton } from './components/ui/Skeleton';
import OlympicIntro from './components/intro/OlympicIntro';

// Lazy loaded page components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Countries = lazy(() => import('./pages/Countries'));
const CountryProfile = lazy(() => import('./pages/CountryProfile'));
const Sports = lazy(() => import('./pages/Sports'));
const SportProfile = lazy(() => import('./pages/SportProfile'));
const AthleteExplorer = lazy(() => import('./pages/AthleteExplorer'));
const AthleteDetail = lazy(() => import('./pages/AthleteDetail'));

export default function App() {
  const [showIntro, setShowIntro] = useState(true);

  if (showIntro) {
    return <OlympicIntro onEnter={() => setShowIntro(false)} />;
  }

  return (
    <ThemeProvider>
      <FilterProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Suspense fallback={
            <div style={{ padding: 'var(--space-24)', display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>
              <ChartSkeleton />
            </div>
          }>
            <Routes>
              {/* Main Application Shell */}
              <Route element={<AppLayout />}>
                {/* Dashboard lives at the root index */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/countries" element={<Countries />} />
                <Route path="/countries/:code" element={<CountryProfile />} />
                <Route path="/sports" element={<Sports />} />
                <Route path="/sports/:name" element={<SportProfile />} />
                <Route path="/athletes" element={<AthleteExplorer />} />
                <Route path="/athletes/:name" element={<AthleteDetail />} />
              </Route>
              
              {/* Fallback redirect to root */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </FilterProvider>
    </ThemeProvider>
  );
}
