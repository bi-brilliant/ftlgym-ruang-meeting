import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useJadwal } from '../hooks/useJadwal';

const DIVISI_OPTIONS = ['IT', 'HR', 'Finance', 'Marketing', 'Operasional'];

function formatDate(d) {
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}
function formatTime(d) {
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export default function BookingScreen({ navigation }) {
  const { roomOptions } = useJadwal();

  const [divisi, setDivisi] = useState(DIVISI_OPTIONS[0]);
  const [ruangan, setRuangan] = useState('');
  const [tanggal, setTanggal] = useState(new Date());
  const [jamMulai, setJamMulai] = useState(new Date());
  const [jamSelesai, setJamSelesai] = useState(new Date());
  const [jumlahPeserta, setJumlahPeserta] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // NOTE: belum ada endpoint submit booking yang terkonfirmasi dari desain -
  // untuk sekarang submit di-mock (tidak hit API), tampilkan alert sukses.
  const handleSubmit = () => {
    setShowSuccess(true);
  };

  // Sanitize: strip anything that isn't a digit, whether typed or pasted -
  // onChangeText fires with the full resulting text either way, so filtering
  // here catches paste too, not just the on-screen numeric keyboard.
  const handleJumlahPesertaChange = (text) => {
    setJumlahPeserta(text.replace(/[^0-9]/g, ''));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Ruang Meeting</Text>
      </View>

      <ScrollView style={styles.form}>
        <Text style={styles.label}>Divisi</Text>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={divisi} onValueChange={setDivisi}>
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
          <DateTimePicker
            value={tanggal}
            mode="date"
            onChange={(_, d) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (d) setTanggal(d);
            }}
          />
        )}

        <Text style={styles.label}>Waktu Mulai Meeting</Text>
        <TouchableOpacity style={styles.fieldButton} onPress={() => setShowStartPicker(true)}>
          <Text>{formatTime(jamMulai)}</Text>
        </TouchableOpacity>
        {showStartPicker && (
          <DateTimePicker
            value={jamMulai}
            mode="time"
            onChange={(_, d) => {
              setShowStartPicker(Platform.OS === 'ios');
              if (d) setJamMulai(d);
            }}
          />
        )}

        <Text style={styles.label}>Waktu Selesai Meeting</Text>
        <TouchableOpacity style={styles.fieldButton} onPress={() => setShowEndPicker(true)}>
          <Text>{formatTime(jamSelesai)}</Text>
        </TouchableOpacity>
        {showEndPicker && (
          <DateTimePicker
            value={jamSelesai}
            mode="time"
            onChange={(_, d) => {
              setShowEndPicker(Platform.OS === 'ios');
              if (d) setJamSelesai(d);
            }}
          />
        )}

        <Text style={styles.label}>Jumlah Peserta</Text>
        <TextInput
          style={styles.fieldButton}
          keyboardType="number-pad"
          value={jumlahPeserta}
          onChangeText={handleJumlahPesertaChange}
          placeholder="Contoh: 10"
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>

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
    </View>
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
  submitText: { color: '#fff', fontWeight: '600' },
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
