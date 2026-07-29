# TechTest - Booking Meeting Room

A React Native (Expo) app for booking and managing meeting rooms - built as a technical test submission. Users can sign in, view today's/upcoming room schedule, filter by date or room, book a new meeting, and track each booking's status with notes.

## Features

- **Auth**: sign in, auto-login (persisted session), logout, clear-field buttons, show/hide password
- **Home**: today's schedule at a glance, with Hari Ini / Besok / custom-date filters
- **Jadwal Ruang Meeting**: full schedule list, filterable by room and date
- **Booking Ruang Meeting**: book a room with divisi, room, date, start/end time, and participant count - with client-side validation (no past dates/times, end time must be after start time, numeric-only participant input that also sanitizes pasted text)
- **Booking detail**: tap any schedule entry to see full details in a modal; update its status (Pending / Selesai / Dibatalkan) and attach a note
- **Toast notifications** (`react-native-toast-message`) instead of blocking native alerts
- Safe-area aware layouts (no bleed into the status bar or Android gesture nav), keyboard-avoiding forms

## Tech Stack

- **Expo (SDK 54)** + React Native 0.81 / React 19 - chosen over bare RN CLI so the app is previewable via Expo Go without an Android Studio/Xcode setup
- **React Navigation** (native-stack)
- **Axios** for HTTP
- **AsyncStorage** for session persistence
- **@expo/vector-icons**, **@react-native-community/datetimepicker**, **@react-native-picker/picker**
- Custom hooks as the "ViewModel" layer (MVVM-ish) - screen components stay focused on rendering; data-fetching, filtering, and mutation logic live in `src/hooks/*`
- React Context (`AuthContext`) for session state, since screens on a stack navigator stay mounted underneath each other and a plain hook would give each one a disconnected copy of the same state
- `React.memo` + `useCallback` on the schedule list's card component and its `FlatList` handlers, since that list is the one place in the app that can grow unbounded

## Project Structure

```
src/
  api/          axios clients + endpoint functions (login, jadwal, ruangan, booking)
  context/      AuthContext - shared session state
  hooks/        useJadwal, useRuangan - data fetching/filtering/mutation (the "ViewModel" layer)
  components/   ScheduleCard, BookingDetailModal - reusable presentational pieces
  screens/      Welcome, Login, Home, Booking, Schedule
  navigation/   native-stack config
  utils/        date formatting/helpers, placeholder image URLs
```

## Running Locally

```bash
npm install
npx expo start --tunnel
```

Scan the QR with Expo Go (Android/iOS). `--tunnel` is only needed if your phone and dev machine aren't on the same network.

## API Integration - What's Real vs. What I Built

The provided design only specified two real endpoints (`uat-api.ftlgym.com`):

- `POST /login` - returns `{ status, message, data: [] }`, no token and no user object
- `GET /jadwalruangan` - returns `{ waktu_mulai, waktu_selesai, nama_ruangan }`, no date field and no id

Both are called exactly as given - **nothing about them was changed or mocked**. Two things the app needs simply don't exist on that API, though: an official room list, and a booking-submit endpoint. Rather than fake those client-side, I stood up a small Node/Express API of my own (deployed separately) that adds:

- `GET /ruangan` - the official room list (with capacity)
- `POST /booking` - creates a booking
- `GET /booking` - lists bookings
- `PATCH /booking/:id` - updates a booking's status/note

`useJadwal` merges the real jadwal feed with this booking API into one schedule list, so a submitted booking shows up immediately in both Home and the Jadwal Ruang Meeting screen.

## Known Limitations / Honest Trade-offs

- **No token, no real user object** from the login API - the session is a lightweight local one keyed off a successful login response, not a real bearer token. The display name is derived from the email prefix.
- **Legacy jadwal entries have no date or id** - they can't be date-filtered precisely (shown regardless of the active date filter) and can't be edited/status-updated in the detail modal (shown as read-only), since there's nothing on the real API to patch against.
- **Room capacity for legacy jadwal entries** falls back to the room's general capacity from `/ruangan`, since the real jadwal feed doesn't report actual attendee counts.
- **The custom booking API is in-memory** - data resets if the server process restarts. Fine for a demo/test; would need a real datastore for production use.
- Built and tested primarily via Expo Go on Android; iOS-specific spacing/keyboard behavior hasn't been verified on a physical iOS device.
