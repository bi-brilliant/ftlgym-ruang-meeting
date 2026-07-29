import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useRuangan } from '../hooks/useRuangan';
import { submitBooking } from '../api/booking';

const DIVISI_OPTIONS = ['IT', 'HR', 'Finance', 'Marketing', 'Operasional'];

function formatDate(d) {
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}
function formatTime(d) {
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}
function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function toHHMM(d) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
function isToday(d) {
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

export default function BookingScreen({ navigation }) {
  const { rooms } = useRuangan();
  const roomOptions = rooms.map((r) => r.nama_ruangan);

  const [divisi, setDivisi] = useState('');
  const [ruangan, setRuangan] = useState('');
  const [tanggal, setTanggal] = useState(new Date());
  const [jamMulai, setJamMulai] = useState(new Date());
  const [jamSelesai, setJamSelesai] = useState(new Date());
  const [jumlahPeserta, setJumlahPeserta] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = divisi.length > 0 && ruangan.length > 0 && jumlahPeserta.length > 0 && !submitting;

  // Reset the whole form on blur so navigating away and back (or submitting
  // then coming back later) never shows leftover input from last time.
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setDivisi('');
      setRuangan('');
      setTanggal(new Date());
      setJamMulai(new Date());
      setJamSelesai(new Date());
      setJumlahPeserta('');
      setShowSuccess(false);
    });
    return unsubscribe;
  }, [navigation]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitBooking({
        divisi,
        ruangan,
        tanggal: toISODate(tanggal),
        jam_mulai: toHHMM(jamMulai),
        jam_selesai: toHHMM(jamSelesai),
        jumlah_peserta: jumlahPeserta,
      });
      setShowSuccess(true);
    } catch (e) {
      Alert.alert('Gagal', e.response?.data?.message ?? e.message ?? 'Booking gagal diajukan.');
    } finally {
      setSubmitting(false);
    }
  };

  // Sanitize: strip anything that isn't a digit, whether typed or pasted -
  // onChangeText fires with the full resulting text either way, so filtering
  // here catches paste too, not just the on-screen numeric keyboard.
  const handleJumlahPesertaChange = (text) => {
    setJumlahPeserta(text.replace(/[^0-9]/g, ''));
  };

  const handleTanggalChange = (_, d) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (d) setTanggal(d);
  };

  const handleJamMulaiChange = (_, d) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (!d) return;
    if (isToday(tanggal) && d < new Date()) {
      Alert.alert('Waktu tidak valid', 'Waktu mulai meeting tidak boleh sebelum waktu sekarang.');
      return;
    }
    setJamMulai(d);
  };

  const handleJamSelesaiChange = (_, d) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (!d) return;
    if (d <= jamMulai) {
      Alert.alert('Waktu tidak valid', 'Waktu selesai meeting harus setelah waktu mulai.');
      return;
    }
    setJamSelesai(d);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Ruang Meeting</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Divisi</Text>
          <View style={styles.pickerWrap}>
            <Picker selectedValue={divisi} onValueChange={setDivisi}>
              <Picker.Item label="Pilih divisi..." value="" />
              {DIVISI_OPTIONS.map((d) => (
                <Picker.Item key={d} label={d} value={d} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Ruang Meeting</Text>
          <View style={styles.pickerWrap}>
            <Picker selectedValue={ruangan} onValueChange={setRuangan}>
              <Picker.Item label="Pilih ruangan..." value="" />
              {roomOptions.map((r) => (
                <Picker.Item key={r} label={r} value={r} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Tanggal Meeting</Text>
          <TouchableOpacity style={styles.fieldButton} onPress={() => setShowDatePicker(true)}>
            <Text>{formatDate(tanggal)}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker value={tanggal} mode="date" minimumDate={new Date()} onChange={handleTanggalChange} />
          )}

          <Text style={styles.label}>Waktu Mulai Meeting</Text>
          <TouchableOpacity style={styles.fieldButton} onPress={() => setShowStartPicker(true)}>
            <Text>{formatTime(jamMulai)}</Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={jamMulai}
              mode="time"
              minimumDate={isToday(tanggal) ? new Date() : undefined}
              onChange={handleJamMulaiChange}
            />
          )}

          <Text style={styles.label}>Waktu Selesai Meeting</Text>
          <TouchableOpacity style={styles.fieldButton} onPress={() => setShowEndPicker(true)}>
            <Text>{formatTime(jamSelesai)}</Text>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker value={jamSelesai} mode="time" minimumDate={jamMulai} onChange={handleJamSelesaiChange} />
          )}

          <Text style={styles.label}>Jumlah Peserta</Text>
          <TextInput
            style={styles.fieldButton}
            keyboardType="number-pad"
            value={jumlahPeserta}
            onChangeText={handleJumlahPesertaChange}
            placeholder="Contoh: 10"
          />

          <TouchableOpacity
            style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.submitText, !canSubmit && styles.submitTextDisabled]}>Submit</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal transparent visible={showSuccess} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons name="checkmark-circle" size={40} color="#22C55E" style={styles.modalIcon} />
            <Text style={styles.modalTitle}>Sukses</Text>
            <Text style={styles.modalBody}>Booking ruang meeting berhasil diajukan.</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowSuccess(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.modalButtonText}>Sukses</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  headerTitle: { fontWeight: '700', fontSize: 15, color: '#1F2937', marginLeft: 12 },
  form: { padding: 20 },
  label: { fontSize: 12, color: '#6B7280', marginBottom: 4, marginTop: 12 },
  pickerWrap: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, overflow: 'hidden' },
  fieldButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  submitButton: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  submitButtonDisabled: { backgroundColor: '#D1D5DB' },
  submitText: { color: '#fff', fontWeight: '600' },
  submitTextDisabled: { color: '#6B7280' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  modalIcon: { fontSize: 36, marginBottom: 8 },
  modalTitle: { fontWeight: '700', fontSize: 18, color: '#7C3AED', marginBottom: 4 },
  modalBody: { fontSize: 13, color: '#4B5563', textAlign: 'center', marginBottom: 16 },
  modalButton: { backgroundColor: '#7C3AED', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 28 },
  modalButtonText: { color: '#fff', fontWeight: '600' },
});
