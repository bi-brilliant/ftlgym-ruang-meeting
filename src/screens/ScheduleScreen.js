import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useJadwal } from '../hooks/useJadwal';
import ScheduleCard from '../components/ScheduleCard';

function formatDate(d) {
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function ScheduleScreen({ navigation }) {
  const { filteredItems, roomOptions, roomFilter, setRoomFilter, dateFilter, setDateFilter, loading, error } =
    useJadwal();
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Reset filters on blur so re-entering this screen always starts from
  // "show everything, today" instead of whatever filter was left applied.
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setRoomFilter(null);
      setDateFilter(new Date());
    });
    return unsubscribe;
  }, [navigation, setRoomFilter, setDateFilter]);

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

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item, idx) => String(item.id ?? idx)}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <ScheduleCard
              startTime={item.waktu_mulai}
              endTime={item.waktu_selesai}
              room={item.nama_ruangan}
            />
          )}
          ListEmptyComponent={<Text style={styles.empty}>Tidak ada jadwal untuk filter ini.</Text>}
        />
      )}
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
  empty: { color: '#9CA3AF', fontSize: 13, textAlign: 'center', marginTop: 20 },
  error: { color: '#DC2626', fontSize: 13, textAlign: 'center', marginTop: 20 },
});
