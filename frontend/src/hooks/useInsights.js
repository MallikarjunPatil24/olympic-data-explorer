import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

export default function useInsights() {
  const [insights, setInsights] = useState([]);
  const [fact, setFact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    axiosClient.get('/api/analytics/insights')
      .then((res) => {
        if (mounted) {
          setInsights(res.data.insights || []);
          setFact(res.data.fact || null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  return { insights, fact, loading };
}
