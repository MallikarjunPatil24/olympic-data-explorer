import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFilters } from '../context/FilterContext';

const FILTER_KEYS = ['year', 'season', 'country', 'sport', 'gender', 'medal'];

function parseFiltersFromParams(searchParams) {
  const parsed = {};
  FILTER_KEYS.forEach((key) => {
    const val = searchParams.get(key);
    if (!val) return;
    parsed[key] = key === 'year' ? parseInt(val, 10) : val;
  });
  return parsed;
}

function filtersToParams(filters) {
  const params = new URLSearchParams();
  FILTER_KEYS.forEach((key) => {
    if (filters[key] != null && filters[key] !== '') {
      params.set(key, String(filters[key]));
    }
  });
  return params;
}

export default function useFilterUrlSync() {
  const { filters, setFilter, resetFilters } = useFilters();
  const [searchParams, setSearchParams] = useSearchParams();
  const isInitialMount = useRef(true);
  const skipNextWrite = useRef(false);

  // Read URL → state on mount and browser back/forward
  useEffect(() => {
    const fromUrl = parseFiltersFromParams(searchParams);
    const hasUrlFilters = Object.keys(fromUrl).length > 0;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (hasUrlFilters) {
        skipNextWrite.current = true;
        FILTER_KEYS.forEach((key) => {
          setFilter(key, fromUrl[key] ?? null);
        });
      }
      return;
    }

    skipNextWrite.current = true;
    if (hasUrlFilters) {
      FILTER_KEYS.forEach((key) => setFilter(key, fromUrl[key] ?? null));
    } else {
      resetFilters();
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Write state → URL when filters change
  useEffect(() => {
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    const next = filtersToParams(filters);
    const current = searchParams.toString();
    const nextStr = next.toString();
    if (current !== nextStr) {
      setSearchParams(next, { replace: true });
    }
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps
}
