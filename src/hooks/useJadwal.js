import { useCallback, useEffect, useMemo, useState } from 'react';
import { getJadwalRuangan } from '../api/jadwal';

function isSameDay(dateStr, target) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return (
    d.getFullYear() === target.getFullYear() &&
    d.getMonth() === target.getMonth() &&
    d.getDate() === target.getDate()
  );
}

// ViewModel: fetches + normalizes schedule data, exposes filters to the View.
export function useJadwal() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roomFilter, setRoomFilter] = useState(null);
  const [dateFilter, setDateFilter] = useState(new Date());

  const fetchJadwal = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getJadwalRuangan();
      // Response shape not confirmed until tested live - normalize defensively.
      const list = data.data ?? data.items ?? data.jadwal ?? data ?? [];
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e.response?.data?.message ?? e.message ?? 'Gagal memuat jadwal');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJadwal();
  }, [fetchJadwal]);

  const todayItems = useMemo(
    () => items.filter((it) => isSameDay(it.tanggal ?? it.date, new Date())),
    [items],
  );

  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      const matchesRoom = !roomFilter || (it.ruangan ?? it.room) === roomFilter;
      const matchesDate = !dateFilter || isSameDay(it.tanggal ?? it.date, dateFilter);
      return matchesRoom && matchesDate;
    });
  }, [items, roomFilter, dateFilter]);

  const roomOptions = useMemo(
    () => [...new Set(items.map((it) => it.ruangan ?? it.room).filter(Boolean))],
    [items],
  );

  return {
    items,
    todayItems,
    filteredItems,
    roomOptions,
    roomFilter,
    setRoomFilter,
    dateFilter,
    setDateFilter,
    loading,
    error,
    refetch: fetchJadwal,
  };
}
