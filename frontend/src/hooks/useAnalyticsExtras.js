import { useState, useEffect } from 'react';
import axios from 'axios';
import axiosClient from '../api/axiosClient';
import { useFilters } from '../context/FilterContext';

function buildParams(filters) {
  const params = {};
  if (filters.year) params.year = filters.year;
  if (filters.season) params.season = filters.season;
  if (filters.country) params.country = filters.country;
  if (filters.sport) params.sport = filters.sport;
  if (filters.gender) params.sex = filters.gender;
  if (filters.medal) params.medal = filters.medal;
  return params;
}

export default function useMedalHeatmap() {
  const { filters } = useFilters();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    axiosClient.get('/api/analytics/heatmap', { params: buildParams(filters), signal: controller.signal })
      .then((res) => { setData(res.data); setError(null); setLoading(false); })
      .catch((err) => {
        if (!axios.isCancel(err)) { setError(err.message); setLoading(false); }
      });
    return () => controller.abort();
  }, [filters.year, filters.season, filters.country, filters.sport, filters.gender, filters.medal]);

  return { data, loading, error };
}

export function useCompareData(countries = [], sports = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (countries.length === 0 && sports.length === 0) {
      setData(null);
      return;
    }
    setLoading(true);
    const params = {};
    if (countries.length) params.countries = countries.join(',');
    if (sports.length) params.sports = sports.join(',');
    axiosClient.get('/api/analytics/compare', { params })
      .then((res) => { setData(res.data); setError(null); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [countries.join(','), sports.join(',')]);

  return { data, loading, error };
}
