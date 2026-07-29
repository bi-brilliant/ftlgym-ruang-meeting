import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useJadwal } from '../hooks/useJadwal';
import { useRuangan } from '../hooks/useRuangan';
import ScheduleCard from '../components/ScheduleCard';
import BookingDetailModal from '../components/BookingDetailModal';
import { getRoomImageUri } from '../utils/images';

function formatDate(d) {
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function ScheduleScreen({ navigation }) {
  const {
    filteredItems,
    roomOptions,
    roomFilter,
    setRoomFilter,
    dateFilter,
    setDateFilter,
    loading,
    error,
    refetch,
    updateItem,
  } = useJadwal();
  const { rooms } = useRuangan();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Reset filters on blur so re-entering this screen always starts from
  // "show everything, today" instead of whatever filter was left applied.
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setRoomFilter(null);
      setDateFilter(new Date());
    });
    return unsubscribe;
  }, [navigation, setRoomFilter, setDateFilter]);

  // Refetch on focus so a booking submitted elsewhere shows up here too.
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', refetch);
    return unsubscribe;
  }, [navigation, refetch]);

  const roomCapacity = useMemo(() => {
    const map = {};
    rooms.forEach((r) => {
      map[r.nama_ruangan] = r.kapasitas;
    });
    return map;
  }, [rooms]);

  const handleItemPress = useCallback((item) => setSelectedItem(item), []);
  const handleModalClose = useCallback(() => setSelectedItem(null), []);

  const handleUpdateStatus = useCallback(
    async (status) => {
      if (!selectedItem?.bookingId) return;
      await updateItem(selectedItem.bookingId, { status });
      setSelectedItem((prev) => (prev ? { ...prev, status } : prev));
    },
    [selectedItem, updateItem],
  );

  const handleSaveNote = useCallback(
    async (note) => {
      if (!selectedItem?.bookingId) return;
      await updateItem(selectedItem.bookingId, { note });
      setSelectedItem((prev) => (prev ? { ...prev, note } : prev));
    },
    [selectedItem, updateItem],
  );

  const keyExtractor = useCallback((item, idx) => String(item.id ?? idx), []);

  const renderItem = useCallback(
    ({ item }) => (
      <ScheduleCard
        item={item}
        image={getRoomImageUri(item.nama_ruangan)}
        capacity={item.jumlah_peserta ?? roomCapacity[item.nama_ruangan] ?? null}
        onPress={handleItemPress}
      />
    ),
    [roomCapacity, handleItemPress],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Jadwal Ruang Meeting</Text>
      </View>

      <View style={styles.filters}>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={roomFilter ?? ''} onValueChange={(v) => setRoomFilter(v || null)}>
            <Picker.Item label="Semua Ruang Meeting" value="" />
            {roomOptions.map((r) => (
              <Picker.Item key={r} label={r} value={r} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
          <Text>{formatDate(dateFilter)}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dateFilter}
            mode="date"
            onChange={(_, d) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (d) setDateFilter(d);
            }}
          />
        )}
      </View>

      <View style={styles.listArea}>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={keyExtractor}
            contentContainerStyle={{ padding: 20 }}
            renderItem={renderItem}
            ListEmptyComponent={<Text style={styles.empty}>Tidak ada jadwal untuk filter ini.</Text>}
          />
        )}
      </View>

      <BookingDetailModal
        visible={!!selectedItem}
        item={selectedItem}
        onClose={handleModalClose}
        onUpdateStatus={handleUpdateStatus}
        onSaveNote={handleSaveNote}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  back: { fontSize: 20, marginRight: 12 },
  headerTitle: { fontWeight: '700', fontSize: 15, color: '#1F2937' },
  filters: { paddingHorizontal: 20, paddingTop: 16, gap: 10 },
  pickerWrap: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, overflow: 'hidden' },
  dateButton: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, marginTop: 10 },
  listArea: { flex: 1 },
  empty: { color: '#9CA3AF', fontSize: 13, textAlign: 'center', marginTop: 20 },
  error: { color: '#DC2626', fontSize: 13, textAlign: 'center', marginTop: 20 },
});
