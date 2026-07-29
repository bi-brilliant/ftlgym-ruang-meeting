import { useCallback, useEffect, useMemo, useState } from 'react';
import { getJadwalRuangan } from '../api/jadwal';

// ViewModel: fetches + normalizes schedule data, exposes filters to the View.
//
// NOTE: the real API response (`/test/jadwalruangan`) returns items shaped
// like `{ waktu_mulai, waktu_selesai, nama_ruangan }` - no date field at all.
// So "today's schedule" and the date filter can't actually filter by date
// (there's nothing to filter against) - all items are shown regardless of
// date. The date picker stays in the UI to match the design, but is
// honestly non-functional against this data shape unless the API adds a
// date field later.
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
      const list = data.data ?? [];
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

  // No date field in the API response - "today" is effectively "all".
  const todayItems = items;

  const filteredItems = useMemo(() => {
    if (!roomFilter) return items;
    return items.filter((it) => it.nama_ruangan === roomFilter);
  }, [items, roomFilter]);

  const roomOptions = useMemo(
    () => [...new Set(items.map((it) => it.nama_ruangan).filter(Boolean))],
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
