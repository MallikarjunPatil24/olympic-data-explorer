import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

export default function useFilterOptions() {
  const [options, setOptions] = useState({
    years: [],
    seasons: [],
    countries: [],
    sports: [],
    genders: [],
    medals: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchOptions = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get('/api/filters');
        if (isMounted) {
          setOptions(response.data);
          setOptions(prev => ({
            ...prev,
            // Sort years descending and sports/seasons alphabetically
            years: response.data.years ? [...response.data.years].sort((a,b) => b - a) : [],
            sports: response.data.sports ? [...response.data.sports].sort() : [],
            countries: response.data.countries ? [...response.data.countries].sort((a,b) => a.name.localeCompare(b.name)) : []
          }));
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load filter options.');
          setLoading(false);
        }
      }
    };
    
    fetchOptions();
    
    return () => {
      isMounted = false;
    };
  }, []);

  return { options, loading, error };
}
