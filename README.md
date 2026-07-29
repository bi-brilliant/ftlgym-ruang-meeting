# TechTest - Booking Meeting Room

Aplikasi React Native (Expo) untuk booking dan mengelola ruang meeting - dibuat sebagai submission technical test. User bisa sign in, melihat jadwal ruangan hari ini/mendatang, filter berdasarkan tanggal atau ruangan, booking meeting baru, dan melacak status tiap booking beserta catatannya.

## Fitur

- **Auth**: sign in, auto-login (session tersimpan), logout, tombol clear field, show/hide password
- **Home**: jadwal hari ini sekilas, dengan filter Hari Ini / Besok / tanggal custom
- **Jadwal Ruang Meeting**: daftar jadwal lengkap, bisa difilter berdasarkan ruangan dan tanggal
- **Booking Ruang Meeting**: booking ruangan dengan divisi, ruangan, tanggal, waktu mulai/selesai, dan jumlah peserta - lengkap dengan validasi di sisi client (tidak bisa backdate tanggal/jam, waktu selesai harus setelah waktu mulai, input peserta hanya angka termasuk saat paste teks)
- **Detail booking**: tap jadwal mana pun untuk lihat detail lengkap di modal; ubah status (Pending / Selesai / Dibatalkan) dan tambahkan catatan
- **Notifikasi toast** (`react-native-toast-message`) menggantikan alert native yang blocking
- Layout yang aman dari status bar/gesture nav Android (safe-area aware), form yang menyesuaikan keyboard

## Tech Stack

- **Expo (SDK 54)** + React Native 0.81 / React 19 - dipilih dibanding bare RN CLI supaya aplikasi bisa langsung di-preview via Expo Go tanpa perlu setup Android Studio/Xcode
- **React Navigation** (native-stack)
- **Axios** untuk HTTP
- **AsyncStorage** untuk menyimpan session
- **@expo/vector-icons**, **@react-native-community/datetimepicker**, **@react-native-picker/picker**
- Custom hooks sebagai layer "ViewModel" (pola mirip MVVM) - komponen screen fokus render saja; logika fetch data, filter, dan mutasi ada di `src/hooks/*`
- React Context (`AuthContext`) untuk session state, karena screen di stack navigator tetap mounted di belakang satu sama lain, sehingga plain hook biasa akan bikin tiap screen punya copy state yang terpisah/tidak sinkron
- `React.memo` + `useCallback` pada komponen kartu jadwal dan handler `FlatList`-nya, karena list itu satu-satunya bagian aplikasi yang berpotensi jumlah datanya terus bertambah

## Struktur Project

```
src/
  api/          axios client + fungsi endpoint (login, jadwal, ruangan, booking)
  context/      AuthContext - shared session state
  hooks/        useJadwal, useRuangan - fetch/filter/mutasi data (layer "ViewModel")
  components/   ScheduleCard, BookingDetailModal - komponen presentational yang reusable
  screens/      Welcome, Login, Home, Booking, Schedule
  navigation/   konfigurasi native-stack
  utils/        helper format tanggal, URL gambar placeholder
```

## Menjalankan Secara Lokal

```bash
npm install
npx expo start --tunnel
```

Scan QR-nya pakai Expo Go (Android/iOS). `--tunnel` hanya diperlukan kalau HP dan komputer dev tidak satu jaringan.

## Integrasi API - Mana yang Asli, Mana yang Saya Bangun Sendiri

Desain yang diberikan hanya menyediakan dua endpoint asli (`uat-api.ftlgym.com`):

- `POST /login` - mengembalikan `{ status, message, data: [] }`, tanpa token dan tanpa objek user
- `GET /jadwalruangan` - mengembalikan `{ waktu_mulai, waktu_selesai, nama_ruangan }`, tanpa field tanggal dan tanpa id

Keduanya dipanggil persis seperti aslinya - **tidak ada yang diubah atau di-mock**. Namun ada dua kebutuhan aplikasi yang memang tidak tersedia di API tersebut: daftar ruangan resmi, dan endpoint submit booking. Daripada dipalsukan di sisi client, saya membangun API Node/Express kecil sendiri (di-deploy terpisah) yang menambahkan:

- `GET /ruangan` - daftar ruangan resmi (dengan kapasitas)
- `POST /booking` - membuat booking
- `GET /booking` - daftar booking
- `PATCH /booking/:id` - update status/catatan booking

`useJadwal` menggabungkan feed jadwal asli dengan API booking ini menjadi satu daftar jadwal, sehingga booking yang baru disubmit langsung muncul di Home maupun di screen Jadwal Ruang Meeting.

## Batasan / Trade-off yang Jujur Diakui

- **Tidak ada token, tidak ada objek user asli** dari API login - session yang dipakai adalah session lokal ringan berdasarkan status login sukses, bukan bearer token sungguhan. Nama tampilan diambil dari prefix email.
- **Entri jadwal lama (dari API asli) tidak punya tanggal atau id** - tidak bisa difilter tanggal secara presisi (selalu tampil terlepas dari filter tanggal aktif) dan tidak bisa diedit/diubah statusnya di modal detail (ditampilkan read-only), karena memang tidak ada apa pun di API asli yang bisa di-patch.
- **Kapasitas ruangan untuk entri jadwal lama** memakai fallback dari kapasitas umum ruangan via `/ruangan`, karena feed jadwal asli tidak melaporkan jumlah peserta sebenarnya.
- **API booking custom bersifat in-memory** - data hilang kalau proses server di-restart. Cukup untuk demo/test; perlu datastore sungguhan untuk produksi.
- Dibangun dan ditest terutama lewat Expo Go di Android; perilaku spacing/keyboard khusus iOS belum diverifikasi di perangkat iOS fisik.
