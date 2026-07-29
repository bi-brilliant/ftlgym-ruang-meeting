import { memo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDisplayDate } from '../utils/date';

const STATUS_META = {
  pending: { label: 'Pending', badgeKey: 'statusPending', textKey: 'statusPendingText' },
  selesai: { label: 'Selesai', badgeKey: 'statusSelesai', textKey: 'statusSelesaiText' },
  dibatalkan: { label: 'Dibatalkan', badgeKey: 'statusDibatalkan', textKey: 'statusDibatalkanText' },
};

// Dumb/presentational component - just renders, no logic. Wrapped in
// React.memo since it's rendered inside a FlatList that can grow large -
// takes the raw `item` plus a stable `onPress(item)` (instead of an
// already-bound closure) so the memo actually bails out when neither the
// item nor the callback identity changed, instead of re-rendering every
// row whenever the parent re-renders for an unrelated reason.
function ScheduleCard({ item, image, capacity, onPress }) {
  const statusMeta = item.status ? STATUS_META[item.status] : null;

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.7}>
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.info}>
        <View style={styles.headerRow}>
          <Text style={styles.room} numberOfLines={1}>
            {item.nama_ruangan}
          </Text>
          {statusMeta && (
            <View style={[styles.statusBadge, styles[statusMeta.badgeKey]]}>
              <Text style={[styles.statusText, styles[statusMeta.textKey]]}>{statusMeta.label}</Text>
            </View>
          )}
        </View>
        <View style={styles.row}>
          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
          <Text style={styles.rowText}>{formatDisplayDate(item.tanggal) ?? 'Tanggal tidak tersedia'}</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="time-outline" size={14} color="#6B7280" />
          <Text style={styles.rowText}>
            {item.waktu_mulai} - {item.waktu_selesai}
          </Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="person-outline" size={14} color="#6B7280" />
          <Text style={styles.rowText}>{capacity != null ? `${capacity} orang` : '-'}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
    </TouchableOpacity>
  );
}

export default memo(ScheduleCard);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
  },
  image: { width: 64, height: 64, borderRadius: 10, marginRight: 12, backgroundColor: '#E5E7EB' },
  info: { flex: 1, justifyContent: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  room: { flex: 1, fontWeight: '700', fontSize: 14, color: '#1F2937' },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  rowText: { fontSize: 12, color: '#6B7280', marginLeft: 4 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 8 },
  statusText: { fontSize: 10, fontWeight: '700' },
  statusPending: { backgroundColor: '#FEF3C7' },
  statusPendingText: { color: '#92400E' },
  statusSelesai: { backgroundColor: '#DCFCE7' },
  statusSelesaiText: { color: '#166534' },
  statusDibatalkan: { backgroundColor: '#FEE2E2' },
  statusDibatalkanText: { color: '#991B1B' },
});
