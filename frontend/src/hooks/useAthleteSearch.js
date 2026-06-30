import { useState, useEffect } from 'react';
import axios from 'axios';
import axiosClient from '../api/axiosClient';

export function useAthleteSearch(searchTerm, limit = 50, offset = 0) {
  const [data, setData] = useState({ results: [], total_results: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axiosClient.get('/api/athletes', {
          params: { search: searchTerm || undefined, limit, offset },
          signal: controller.signal,
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
          setError(err.response?.data?.detail || err.message || 'Failed to search athletes.');
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [searchTerm, limit, offset]);

  return { data, loading, error };
}

export function useAthleteProfile(athleteName) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!athleteName) return;

    const controller = new AbortController();
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axiosClient.get(`/api/athletes/${encodeURIComponent(athleteName)}`, {
          signal: controller.signal,
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
          setError(err.response?.data?.detail || err.message || 'Failed to load athlete profile.');
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [athleteName]);

  return { data, loading, error };
}
