import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDisplayDate } from '../utils/date';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'dibatalkan', label: 'Dibatalkan' },
];

export default function BookingDetailModal({ visible, item, onClose, onUpdateStatus, onSaveNote }) {
  const [note, setNote] = useState('');
  const [savingStatus, setSavingStatus] = useState(null);
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    setNote(item?.note ?? '');
  }, [item]);

  if (!item) return null;

  const editable = item.bookingId != null;

  const handleStatusPress = async (status) => {
    setSavingStatus(status);
    try {
      await onUpdateStatus(status);
    } finally {
      setSavingStatus(null);
    }
  };

  const handleSaveNote = async () => {
    setSavingNote(true);
    try {
      await onSaveNote(note);
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.headerRow}>
              <Text style={styles.title} numberOfLines={1}>
                {item.nama_ruangan}
              </Text>
              <TouchableOpacity onPress={onClose} hitSlop={10}>
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{formatDisplayDate(item.tanggal) ?? 'Tanggal tidak tersedia'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>
                {item.waktu_mulai} - {item.waktu_selesai}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>
                {item.jumlah_peserta != null ? `${item.jumlah_peserta} orang` : 'Kapasitas tidak diketahui'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="briefcase-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{item.divisi ?? 'Divisi tidak tersedia'}</Text>
            </View>

            {editable ? (
              <>
                <Text style={styles.sectionLabel}>Status</Text>
                <View style={styles.statusRow}>
                  {STATUS_OPTIONS.map((opt) => {
                    const active = item.status === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        style={[styles.statusChip, active && styles.statusChipActive]}
                        onPress={() => handleStatusPress(opt.value)}
                        disabled={savingStatus != null}
                      >
                        {savingStatus === opt.value ? (
                          <ActivityIndicator size="small" color={active ? '#fff' : '#1F2937'} />
                        ) : (
                          <Text style={[styles.statusChipText, active && styles.statusChipTextActive]}>
                            {opt.label}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.sectionLabel}>Catatan</Text>
                <TextInput
                  style={styles.noteInput}
                  value={note}
                  onChangeText={setNote}
                  placeholder="Tambahkan catatan..."
                  multiline
                  numberOfLines={3}
                />
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveNote} disabled={savingNote}>
                  {savingNote ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Simpan Catatan</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.readOnlyNote}>
                Data ini berasal dari jadwal API resmi dan belum bisa diedit di sini.
              </Text>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  title: { flex: 1, fontSize: 17, fontWeight: '700', color: '#1F2937', marginRight: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  detailText: { fontSize: 13, color: '#374151', marginLeft: 8 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#6B7280', marginTop: 12, marginBottom: 8 },
  statusRow: { flexDirection: 'row', gap: 8 },
  statusChip: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    minWidth: 70,
    alignItems: 'center',
  },
  statusChipActive: { backgroundColor: '#1F2937', borderColor: '#1F2937' },
  statusChipText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  statusChipTextActive: { color: '#fff' },
  noteInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    color: '#1F2937',
    textAlignVertical: 'top',
    minHeight: 70,
  },
  saveButton: {
    backgroundColor: '#1F2937',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  readOnlyNote: { fontSize: 12, color: '#9CA3AF', marginTop: 12, fontStyle: 'italic' },
});
