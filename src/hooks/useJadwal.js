import { useCallback, useEffect, useMemo, useState } from 'react';
import { getJadwalRuangan } from '../api/jadwal';
import { getBookings, updateBooking } from '../api/booking';
import { toISODate } from '../utils/date';

// ViewModel: merges two sources into one schedule list -
// 1. the real FTL API (`/jadwalruangan`) - items shaped `{ waktu_mulai, waktu_selesai, nama_ruangan }`,
//    no date field at all, so we can't tell which day they belong to.
// 2. our own booking API (`/booking`) - every booking submitted through this app,
//    which does carry a real `tanggal`.
// Merging them means a newly submitted booking shows up in the schedule immediately,
// without needing a separate "list rooms" endpoint from the real API.
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
      const [jadwalResult, bookingResult] = await Promise.allSettled([getJadwalRuangan(), getBookings()]);

      if (jadwalResult.status === 'rejected' && bookingResult.status === 'rejected') {
        setError(
          jadwalResult.reason?.response?.data?.message ?? jadwalResult.reason?.message ?? 'Gagal memuat jadwal',
        );
        setItems([]);
        return;
      }

      const fromJadwal =
        jadwalResult.status === 'fulfilled'
          ? (jadwalResult.value.data ?? []).map((it, idx) => ({
              id: `jadwal-${idx}`,
              waktu_mulai: it.waktu_mulai,
              waktu_selesai: it.waktu_selesai,
              nama_ruangan: it.nama_ruangan,
              tanggal: null,
              jumlah_peserta: null,
              status: null,
              note: null,
              bookingId: null,
            }))
          : [];

      const fromBooking =
        bookingResult.status === 'fulfilled'
          ? (bookingResult.value.data ?? []).map((b) => ({
              id: `booking-${b.id}`,
              waktu_mulai: b.jam_mulai,
              waktu_selesai: b.jam_selesai,
              nama_ruangan: b.nama_ruangan,
              tanggal: b.tanggal,
              jumlah_peserta: b.jumlah_peserta,
              status: b.status ?? 'pending',
              note: b.note ?? '',
              bookingId: b.id,
            }))
          : [];

      setItems([...fromJadwal, ...fromBooking]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJadwal();
  }, [fetchJadwal]);

  // Legacy jadwal entries have no date, so we can't know if they're "today" -
  // show them regardless. Our own bookings do carry a date, so only show
  // those that are actually today.
  const todayItems = useMemo(() => {
    const todayIso = toISODate(new Date());
    return items.filter((it) => !it.tanggal || it.tanggal === todayIso);
  }, [items]);

  const filteredItems = useMemo(() => {
    const filterIso = toISODate(dateFilter);
    return items
      .filter((it) => !roomFilter || it.nama_ruangan === roomFilter)
      .filter((it) => !it.tanggal || it.tanggal === filterIso);
  }, [items, roomFilter, dateFilter]);

  const roomOptions = useMemo(
    () => [...new Set(items.map((it) => it.nama_ruangan).filter(Boolean))],
    [items],
  );

  // Only items backed by our own booking API (bookingId != null) can be
  // mutated - legacy jadwal entries have no id to patch against.
  const updateItem = useCallback(
    async (bookingId, payload) => {
      await updateBooking(bookingId, payload);
      await fetchJadwal();
    },
    [fetchJadwal],
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
    updateItem,
    refetch: fetchJadwal,
  };
}
