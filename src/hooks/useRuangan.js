import { useCallback, useEffect, useState } from 'react';
import { getRuanganList } from '../api/ruangan';

export function useRuangan() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRuanganList();
      setRooms(Array.isArray(data.data) ? data.data : []);
    } catch (e) {
      setError(e.response?.data?.message ?? e.message ?? 'Gagal memuat daftar ruangan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return { rooms, loading, error, refetch: fetchRooms };
}
