import { useState, useEffect } from 'react';
import axios from 'axios';
import axiosClient from '../api/axiosClient';

export function useSportsList() {
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
        const response = await axiosClient.get('/api/sports', {
          signal: controller.signal,
        });
        if (isMounted) {
          setData(response.data);
          setLoading(false);
        }
      } catch (err) {
        if (axios.isCancel(err)) return;
        if (isMounted) {
          setError(err.response?.data?.detail || err.message || 'Failed to fetch sports list.');
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  return { data, loading, error };
}

export function useSportProfile(sportName) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sportName) return;

    const controller = new AbortController();
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosClient.get(`/api/sports/${encodeURIComponent(sportName)}`, {
          signal: controller.signal,
        });
        if (isMounted) {
          setData(response.data);
          setLoading(false);
        }
      } catch (err) {
        if (axios.isCancel(err)) return;
        if (isMounted) {
          setError(err.response?.data?.detail || err.message || 'Failed to fetch sport details.');
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [sportName]);

  return { data, loading, error };
}
