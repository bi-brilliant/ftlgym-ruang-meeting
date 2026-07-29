import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useJadwal } from '../hooks/useJadwal';
import { useRuangan } from '../hooks/useRuangan';
import ScheduleCard from '../components/ScheduleCard';
import BookingDetailModal from '../components/BookingDetailModal';
import { toISODate, addDays } from '../utils/date';
import { getRoomImageUri, COVER_IMAGE_URI } from '../utils/images';

function formatShortDate(d) {
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
}

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const { filteredItems, dateFilter, setDateFilter, loading, error, refetch, updateItem } = useJadwal();
  const { rooms } = useRuangan();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const name = user?.name ?? user?.nama ?? 'Yosi';
  const role = user?.role ?? user?.jabatan ?? 'Web Developer';

  // Home stays mounted underneath Booking on the stack, so a fresh booking
  // submit won't show up here unless we refetch when this screen regains
  // focus (e.g. navigating back after a successful submit).
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

  const todayIso = toISODate(new Date());
  const tomorrowIso = toISODate(addDays(new Date(), 1));
  const filterIso = toISODate(dateFilter);
  const isToday = filterIso === todayIso;
  const isTomorrow = filterIso === tomorrowIso;

  const handleLogout = useCallback(async () => {
    await signOut();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  }, [signOut, navigation]);

  // Stable callback identity so ScheduleCard's React.memo can bail out on
  // unrelated re-renders (e.g. toggling the date picker) instead of every
  // row re-rendering just because the parent did.
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
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ImageBackground source={{ uri: COVER_IMAGE_URI }} style={styles.cover}>
        <View style={[styles.coverTopBar, { paddingTop: insets.top + 8 }]}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={handleLogout} style={styles.logoutFab}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.coverBottom}>
          <Text style={styles.coverTitle}>{name}</Text>
          <Text style={styles.coverRole}>{role}</Text>
          <View style={styles.coverInfoBox}>
            <View style={styles.coverInfoRow}>
              <Ionicons name="mail-outline" size={13} color="#fff" />
              <Text style={styles.coverInfoText} numberOfLines={1}>
                {user?.email ?? '-'}
              </Text>
            </View>
            <View style={styles.coverInfoRow}>
              <Ionicons name="business-outline" size={13} color="#fff" />
              <Text style={styles.coverInfoText}>TechTest - Booking Meeting Room</Text>
            </View>
          </View>
        </View>
      </ImageBackground>

      <View style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <Ionicons name="home-outline" size={18} color="#1F2937" />
          <Text style={styles.sheetTitle}>Jadwal Ruang Meeting</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Ionicons name="filter-outline" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.chip, isToday && styles.chipActive]}
            onPress={() => setDateFilter(new Date())}
          >
            <Text style={[styles.chipText, isToday && styles.chipTextActive]}>Hari Ini</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, isTomorrow && styles.chipActive]}
            onPress={() => setDateFilter(addDays(new Date(), 1))}
          >
            <Text style={[styles.chipText, isTomorrow && styles.chipTextActive]}>Besok</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, !isToday && !isTomorrow && styles.chipActive]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.chipText, !isToday && !isTomorrow && styles.chipTextActive]}>
              {formatShortDate(dateFilter)}
            </Text>
          </TouchableOpacity>
        </View>
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

        <View style={styles.listArea}>
          {loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} />
          ) : error ? (
            <Text style={styles.error}>{error}</Text>
          ) : (
            <FlatList
              data={filteredItems}
              keyExtractor={keyExtractor}
              contentContainerStyle={{ paddingBottom: 16 }}
              renderItem={renderItem}
              ListEmptyComponent={<Text style={styles.empty}>Tidak ada jadwal untuk tanggal ini.</Text>}
            />
          )}
        </View>
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Schedule')}>
          <Ionicons name="calendar-outline" size={22} color="#1F2937" />
          <Text style={styles.navLabel}>Jadwal{'\n'}Ruang Meeting</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Booking')}>
          <Ionicons name="create-outline" size={22} color="#1F2937" />
          <Text style={styles.navLabel}>Booking{'\n'}Ruang Meeting</Text>
        </TouchableOpacity>
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
  cover: { height: 300, justifyContent: 'space-between' },
  coverTopBar: { flexDirection: 'row', paddingHorizontal: 16 },
  logoutFab: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverBottom: { padding: 20 },
  coverTitle: { fontSize: 24, fontWeight: '700', color: '#fff' },
  coverRole: { fontSize: 14, color: '#F3F4F6', marginBottom: 10 },
  coverInfoBox: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12,
    padding: 10,
  },
  coverInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  coverInfoText: { color: '#fff', fontSize: 12, marginLeft: 6, flexShrink: 1 },
  sheet: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  sheetTitle: { flex: 1, fontWeight: '700', fontSize: 15, color: '#1F2937', marginLeft: 8 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  chip: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  chipActive: { backgroundColor: '#1F2937', borderColor: '#1F2937' },
  chipText: { fontSize: 12, color: '#4B5563', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  listArea: { flex: 1 },
  empty: { color: '#9CA3AF', fontSize: 13, marginTop: 8 },
  error: { color: '#DC2626', fontSize: 13, marginTop: 8 },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: '#fff',
  },
  navItem: { alignItems: 'center' },
  navLabel: { fontSize: 11, textAlign: 'center', color: '#374151', marginTop: 2 },
});
