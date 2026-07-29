import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useJadwal } from '../hooks/useJadwal';
import ScheduleCard from '../components/ScheduleCard';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { todayItems, loading, error } = useJadwal();

  const name = user?.name ?? user?.nama ?? 'Yosi';
  const role = user?.role ?? user?.jabatan ?? 'Web Developer';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
        </View>
        <View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.role}>{role}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Jadwal Ruang Meeting Hari Ini</Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={todayItems}
          keyExtractor={(item, idx) => String(item.id ?? idx)}
          renderItem={({ item }) => (
            <ScheduleCard
              startTime={item.waktu_mulai}
              endTime={item.waktu_selesai}
              room={item.nama_ruangan}
            />
          )}
          ListEmptyComponent={<Text style={styles.empty}>Tidak ada jadwal hari ini.</Text>}
        />
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Schedule')}>
          <Text style={styles.navIcon}>🗓️</Text>
          <Text style={styles.navLabel}>Jadwal{'\n'}Ruang Meeting</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Booking')}>
          <Text style={styles.navIcon}>✏️</Text>
          <Text style={styles.navLabel}>Booking{'\n'}Ruang Meeting</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { fontWeight: '700', color: '#4338CA', fontSize: 16 },
  name: { fontWeight: '700', fontSize: 15, color: '#1F2937' },
  role: { fontSize: 12, color: '#6B7280' },
  sectionTitle: { fontWeight: '700', fontSize: 13, marginBottom: 10, color: '#1F2937' },
  empty: { color: '#9CA3AF', fontSize: 13, marginTop: 8 },
  error: { color: '#DC2626', fontSize: 13, marginTop: 8 },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    paddingBottom: 4,
  },
  navItem: { alignItems: 'center' },
  navIcon: { fontSize: 22 },
  navLabel: { fontSize: 11, textAlign: 'center', color: '#374151', marginTop: 2 },
});
