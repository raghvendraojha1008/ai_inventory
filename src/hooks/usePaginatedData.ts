
import { useState, useEffect, useCallback } from 'react';
import { ApiService } from '../services/api';
import { getQueryConstraints } from '../utils/helpers';

export const usePaginatedData = (userId: string, col: string, config: any) => {
  const [data, setData] = useState<any[]>([]);
  const [last, setLast] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [idxErr, setIdxErr] = useState(false);

  useEffect(() => {
    setData([]); setLast(null); setHasMore(true); setIdxErr(false); fetchMore(true); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, col, config.sortField, config.searchTerm, config.dateFilter?.start, config.dateFilter?.end]);

  const fetchMore = useCallback(async (isInit = false) => {
    if (!userId || (loading && !isInit) || (!isInit && !hasMore)) return;
    setLoading(true); setIdxErr(false);
    try {
      const constraints = getQueryConstraints(config);
      const snap = await ApiService.fetchPaginated(userId, col, constraints, isInit ? null : last);
      const res = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setData(p => isInit ? res : [...p, ...res]);
      setLast(snap.docs[snap.docs.length - 1]);
      setHasMore(snap.docs.length === 100);
    } catch (e: any) { 
        if (e.message === "Missing Index") setIdxErr(true); 
    } finally { 
        setLoading(false); 
    }
  }, [userId, col, config, last, loading, hasMore]);

  const loadMore = () => fetchMore(false);

  return { data, loading, hasMore, idxErr, loadMore, refresh: () => fetchMore(true), setData };
};

// Also export useDebounce here as it's a related utility hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}