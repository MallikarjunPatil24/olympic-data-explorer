import { useState, useEffect } from 'react';
import axios from 'axios';
import axiosClient from '../api/axiosClient';
import { useFilters } from '../context/FilterContext';

export default function useMedalTrend() {
  const { filters } = useFilters();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {};
        if (filters.year) params.year = filters.year;
        if (filters.season) params.season = filters.season;
        if (filters.country) params.country = filters.country;
        if (filters.sport) params.sport = filters.sport;
        if (filters.gender) params.sex = filters.gender;
        if (filters.medal) params.medal = filters.medal;

        const response = await axiosClient.get('/api/medals', {
          params,
          signal: controller.signal
        });
        
        if (isMounted) {
          setData(response.data);
          setLoading(false);
        }
      } catch (err) {
        if (axios.isCancel(err)) {
          return;
        }
        if (isMounted) {
          const errorMsg = err.response?.data?.detail || err.message || 'Failed to fetch medal trends.';
          setError(errorMsg);
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [
    filters.year,
    filters.season,
    filters.country,
    filters.sport,
    filters.gender,
    filters.medal
  ]);

  return { data, loading, error };
}
