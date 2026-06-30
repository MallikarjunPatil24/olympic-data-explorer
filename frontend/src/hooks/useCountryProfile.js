import { useState, useEffect } from 'react';
import axios from 'axios';
import axiosClient from '../api/axiosClient';

export function useCountriesList() {
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
        const response = await axiosClient.get('/api/countries', {
          signal: controller.signal,
        });
        if (isMounted) {
          setData(response.data);
          setLoading(false);
        }
      } catch (err) {
        if (axios.isCancel(err)) return;
        if (isMounted) {
          setError(err.response?.data?.detail || err.message || 'Failed to fetch countries list.');
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

export function useCountryProfile(countryCode) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!countryCode) return;

    const controller = new AbortController();
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosClient.get(`/api/countries/${encodeURIComponent(countryCode)}`, {
          signal: controller.signal,
        });
        if (isMounted) {
          setData(response.data);
          setLoading(false);
        }
      } catch (err) {
        if (axios.isCancel(err)) return;
        if (isMounted) {
          setError(err.response?.data?.detail || err.message || 'Failed to fetch country profile.');
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [countryCode]);

  return { data, loading, error };
}
