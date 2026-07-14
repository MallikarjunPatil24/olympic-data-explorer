import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

export default function useOlympicHistory() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    axiosClient.get('/api/analytics/on-this-day')
      .then((res) => { if (mounted) { setData(res.data); setLoading(false); } })
      .catch(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return { data, loading };
}
