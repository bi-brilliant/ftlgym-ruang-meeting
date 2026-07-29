# Ruang Meeting App - Technical Test Context (FTL Gym / Epicultura Group)

Deadline: hari ini jam 17:00. Dibuat dari scratch mulai jam 15:42.

## Tugas
1. Bikin slicing UI pakai React Native (sesuai desain Figma di bawah)
2. Push project ke GitHub public repo
3. UI boleh di-improve dari desain aslinya (bukan pixel-perfect wajib)

Repo: https://github.com/bi-brilliant/ftlgym-ruang-meeting

## Stack yang dipakai
- **Expo** (bukan bare RN CLI) - dipilih karena keterbatasan waktu (deadline ketat, Expo Go dipakai buat preview tanpa perlu Android Studio/Xcode)
- React Navigation (native-stack)
- Axios buat HTTP client
- AsyncStorage buat nyimpen token login
- Custom hooks sebagai "ViewModel" (pola MVVM), komponen screen cuma render (pola yang dipakai konsisten sesuai standar arsitektur yang mau ditunjukkan)

## API (dari desain Figma, sudah diverifikasi ada di gambar)
- **Login:** `POST https://uat-api.ftlgym.com/api/v1/test/login`
  - Body: `{ "email": "yosi@gmail.com", "password": "password" }`
  - Response kemungkinan berisi data user (nama "Yosi", role "Web Developer") dan token
- **Jadwal Ruang Meeting:** `GET https://uat-api.ftlgym.com/api/v1/test/jadwalruangan`
  - Kemungkinan butuh Authorization header dari token login

Catatan: struktur response asli belum diketahui pasti sebelum benar-benar coding & hit API-nya - sesuaikan field mapping begitu response asli kelihatan. Jangan asumsikan struktur field tanpa cek response nyata dulu.

## Screens (5 total, sesuai frame di Figma)

### 1. Welcome
- Teks: "Selamat Datang" / "Di Aplikasi" / "Ruang Meeting"
- Tombol "Next" di bawah -> ke Login

### 2. Login
- Judul "Ruangan Meeting"
- Card "Sign In": input Email, input Password (ada toggle show/hide password/eye icon), tombol "Sign In"
- Sukses login -> simpan token (AsyncStorage) -> navigate ke Home

### 3. Home
- Header: avatar (inisial "Y"), nama "Yosi", role "Web Developer" (dari response login)
- Label "Jadwal Ruang Meeting Hari Ini"
- List jadwal hari ini (dari API jadwalruangan, filter tanggal = hari ini): jam mulai-selesai + nama ruangan
- Bottom nav 2 menu: "Jadwal Ruang Meeting" (icon clipboard) -> ke screen Jadwal Ruangan, "Booking Ruang Meeting" (icon pensil) -> ke screen Pesan Ruangan

### 4. Pesan Ruangan (Booking form)
- Header: back arrow + judul "Booking Ruang Meeting"
- Form fields:
  - Divisi (dropdown/picker)
  - Ruang Meeting (dropdown/picker)
  - Tanggal Meeting (date picker)
  - Waktu Mulai Meeting (time picker)
  - Waktu Selesai Meeting (time picker)
  - Jumlah Peserta (input angka)
- Tombol "Submit"
- Setelah submit sukses -> tampilkan alert/modal "Sukses"
- Catatan: belum ada endpoint submit booking yang keliatan eksplisit di Figma - kemungkinan perlu ditanya ke User/interviewer, atau kalau nggak sempat, submit-nya boleh di-mock (console.log + tampilkan alert sukses) sambil dijelasin secara verbal bahwa integrasi endpoint submit belum dikonfirmasi

### 5. Jadwal Ruangan (Schedule list)
- Header: back arrow + judul "Jadwal Ruang Meeting"
- Filter: Ruang Meeting (dropdown), Tanggal Meeting (date picker)
- List jadwal (jam mulai-selesai + nama ruangan), filtered sesuai pilihan di atas

## Struktur folder (pola MVVM yang mau ditunjukkan)
```
src/
  api/         <- axios instance, fungsi endpoint (login, getJadwal, dst)
  hooks/       <- custom hooks (ViewModel): useAuth, useJadwal, useBooking
  components/  <- reusable dumb components (ScheduleCard, FormField, dst)
  screens/     <- WelcomeScreen, LoginScreen, HomeScreen, BookingScreen, ScheduleScreen
  navigation/  <- stack navigator config
```

## Hal yang perlu diingat pas demo/jelasin ke interviewer
- Pakai Expo karena keterbatasan waktu test - kalau ditanya soal CLI vs Expo, jujur aja: biasanya pakai CLI buat kerjaan sehari-hari (butuh native module custom), tapi buat konteks test dengan deadline ketat, Expo lebih efisien buat proof-of-concept dan tetap kepakai konsep yang sama.
- Pola arsitektur: custom hook sebagai ViewModel, screen component cuma render (MVVM) - ini yang sempat direfresh sebelum interview.
- Kalau endpoint booking beneran belum jelas, jangan diem-diem dikira udah jalan - state itu jujur pas ditanya.
