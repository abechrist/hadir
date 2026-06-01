# Product Requirements Document (PRD)
## Aplikasi Kehadiran Mentor & Pendamping
### Program Penumbuhan Wirausaha Muda Kota Salatiga 2026
**Versi:** 1.1 (Firebase Spark Plan)  
**Framework & UI:** Next.js 14 (App Router) + Tailwind CSS + shadcn/ui  
**Backend Service:** Firebase Auth, Firestore, Storage (Spark/Free Tier)  
**Deployment:** Vercel (Hobby)

---

## 1. Ringkasan Produk
Aplikasi web responsif + PWA untuk pencatatan kehadiran dan aktivitas mentor/pendamping. Mentor mengisi absensi sesuai jadwal, pendamping absen harian. Semua data dilengkapi selfie, foto kegiatan, dan log. Admin memverifikasi dan mengunduh laporan bulanan PDF. **Aplikasi menggunakan seluruhnya layanan gratis (Firebase Spark, Vercel Hobby) dengan optimasi agar tetap dalam batas kuota.**

## 2. Persona Pengguna
- **Mentor:** lihat jadwal, absen kegiatan (selfie, dokumentasi, log), izin, riwayat.
- **Pendamping:** check-in/out harian, selfie, log aktivitas harian, izin, riwayat.
- **Admin:** kelola jadwal, verifikasi absensi & aktivitas, unduh laporan.

## 3. Alur Utama
1. **Login:** Firebase Auth email/password.
2. **Dashboard:** Status hari ini, jadwal (mentor), aktivitas terbaru.
3. **Absensi Mentor:** Pilih jadwal → buka kamera selfie → ambil/unggah foto dokumentasi (max 3) → tulis log → submit. Data disimpan dengan timestamp & status "pending verifikasi".
4. **Absensi Pendamping:**
   - **Check-in (06.00–09.00):** Selfie, catat jam.
   - **Aktivitas Harian:** Tambah catatan (narasi + foto/dokumen) sepanjang hari.
   - **Check-out (15.00–18.00):** Selfie, catat jam pulang.
5. **Izin:** Pilih tanggal, jenis, keterangan. Status menunggu verifikasi.
6. **Verifikasi Admin:** Tabel item pending, lihat detail, terima/tolak dengan catatan.
7. **Laporan Bulanan:** Pilih bulan & individu → Generate PDF (diproses di Next.js API route).

## 4. Fitur Detail

### 4.1 Manajemen Pengguna
- Firebase Auth email/password, role (admin, mentor, pendamping) di dokumen `users/{uid}`.
- Halaman login, tidak ada pendaftaran mandiri (akun dibuat oleh admin).

### 4.2 Manajemen Jadwal (Admin)
- CRUD jadwal: judul, tanggal, waktu, lokasi, mentor yang ditugaskan.
- Tampil di kalender mentor.

### 4.3 Modul Mentor
- **Absensi Kegiatan:** Form berisi: pilih jadwal hari ini, selfie (kamera), foto dokumentasi (maks 3, kompres otomatis ≤ 1 MB per foto), log teks.
- **Izin:** Ajukan izin dengan alasan, opsional lampiran bukti (foto surat, dll).
- **Riwayat:** Daftar absensi & izin, filter status verifikasi.

### 4.4 Modul Pendamping
- **Check-in/out:** Tombol besar, akses kamera, pencatatan waktu otomatis.
- **Log Aktivitas Harian:** Multiple entry per hari (waktu, narasi, lampiran foto/dokumen). Maks 5 entry per hari untuk hemat kuota.
- **Izin:** Sama dengan mentor.
- **Riwayat:** Tampilan kalender kehadiran, detail aktivitas.

#### 4.4.1 Validasi Lokasi Absensi (Geofencing)
- **Lokasi Kantor:** Disimpan sebagai konfigurasi di Firestore (collection `config`, doc `officeLocation`), berisi `latitude`, `longitude`, `radiusTolerance` (default 150 meter). Hanya admin yang bisa mengubah.
- **Saat Check-in/out:** Aplikasi meminta izin lokasi (jika belum diberikan). Menggunakan `navigator.geolocation.getCurrentPosition()` dengan timeout 10 detik.
  - Jika posisi didapat dan jarak ke pusat kantor ≤ radius toleransi → absen diterima.
  - Jika di luar radius → tampilkan pesan error: “Anda berada di luar area kantor. Jika ada penugasan, pastikan admin telah menetapkannya. Jika tidak, silakan ajukan izin.”
  - Jika GPS gagal (timeout/error) → tampilkan opsi: “Tidak dapat mendeteksi lokasi. Coba lagi atau ajukan izin.” (Admin tetap dapat memverifikasi manual).
- **Pengecualian Penugasan:** Jika pada tanggal tersebut terdapat dokumen penugasan aktif untuk pendamping, validasi beralih ke koordinat lokasi penugasan dengan toleransi yang sama.

#### 4.4.2 Penugasan Luar Kantor (Fitur Admin)
- **Admin** dapat membuat **Penugasan** melalui menu “Penugasan Pendamping”.
- Form penugasan:
  - Pilih pendamping
  - Tanggal (bisa rentang)
  - Nama kegiatan / lokasi
  - Koordinat lokasi (bisa diisi manual lat/lng atau pilih dari peta sederhana menggunakan library Leaflet/Google Maps Static).
  - Catatan
- Data disimpan di collection `assignments`.
- Pada hari H, saat pendamping membuka aplikasi, sistem akan mengecek apakah ada `assignment` aktif. Jika ya, validasi lokasi menggunakan koordinat penugasan.
- Di riwayat absensi pendamping, tercatat apakah absensi dilakukan di kantor atau di lokasi penugasan (beserta detail penugasan).
- Admin dapat melihat laporan penugasan dan absensi luar.

#### 4.4.3 Tampilan UI
- Saat check-in/out, pendamping dapat melihat status: “Area Kantor” (hijau) atau “Lokasi Penugasan: [nama]” (biru). Jika di luar area yang diizinkan, area berwarna merah.
- Jika lokasi tidak didapat, tombol check-in/out dinonaktifkan dengan pesan “Menunggu lokasi…” atau “Lokasi tidak tersedia”.

### 4.5 Panel Verifikasi Admin
- Tabel item pending (absensi mentor, log pendamping, izin), filter tanggal.
- Modal detail: lihat selfie & dokumentasi, log.
- Tombol Approve/Reject + catatan wajib jika ditolak.
- Data yang sudah diverifikasi tidak dapat diedit user.

### 4.6 Generate Laporan Bulanan (PDF)
- Pilih mentor/pendamping atau semua.
- Konten: Nama, periode, total kehadiran, total izin, tabel detail (tanggal, jam, kegiatan/log), status verifikasi.
- Foto tidak disertakan penuh, hanya thumbnail (kompresi lanjut) atau tidak disertakan untuk menghemat ukuran PDF.
- Diproses di API route Next.js menggunakan jsPDF; file diunduh.

### 4.7 Notifikasi Dasar
- Badge jumlah pending di dashboard admin.
- (Opsional) Toast/alert saat pengajuan baru.

### 4.8 Fitur Pengelolaan File & Saran Backup
- **Notifikasi Backup Otomatis:** Setelah admin meng-generate laporan bulanan (dan laporan sudah terverifikasi penuh), sistem mengirimkan pemberitahuan kepada mentor dan pendamping terkait:  
  *“Laporan bulan [bulan] telah terbit. Anda disarankan untuk mengunduh salinan foto & dokumen Anda dari aplikasi sebelum [tanggal batas]. Setelah tanggal tersebut, file akan dihapus untuk menjaga kapasitas penyimpanan.”*
- **Halaman “Arsip Saya” (Mentor/Pendamping):** Menampilkan semua file yang diunggah, dapat diunduh satu per satu atau sebagai arsip ZIP (opsional). Tombol “Saya sudah backup” untuk menandai bahwa mereka sudah menyimpan salinan.
- **Panel Admin – Penghapusan File:** Admin dapat melihat status backup tiap pengguna. File yang sudah ditandai “sudah backup” oleh pengguna dapat dihapus massal oleh admin melalui tombol “Hapus File Ter-backup”. File yang belum di-backup tetapi sudah melewati masa retensi (30 hari) tetap akan dihapus oleh admin secara manual.

#### Optimasi untuk Spark Plan (Bagian 5.2) – Tambahan
- **Strategi Penghapusan Terjadwal:** File dihapus hanya oleh admin setelah memastikan pengguna sudah mem-backup. Sistem tidak menghapus otomatis untuk menghindari keluhan kehilangan data.

## 5. Optimasi untuk Firebase Spark Plan

### 5.1 Batasan yang Harus Dipatuhi
- **Firestore:** 50K reads/hari, 20K writes/hari, 20K deletes/hari, 1 GiB total data.
- **Storage:** 5 GB total, 1 GB unduh/hari, 20K upload/hari.
- **Authentication:** Email/password tanpa batas.

### 5.2 Strategi Penghematan
- **Kompresi Gambar di Client:** Sebelum upload, resize & kompres JPEG/WebP hingga maksimal **1 MB** (target 300–500 KB) memakai library seperti `browser-image-compression`.
- **Batasi Jumlah Foto:** Mentor maks 3 foto per kegiatan, pendamping maks 2 per entry log (opsional).
- **Retensi File:** Admin dapat menghapus foto selfie & dokumentasi dari Storage setelah laporan bulanan terbit dan terverifikasi (data log tetap ada). Fitur “Hapus File Lama” di panel admin.
- **Caching & Query Optimization:** Gunakan React Query dengan `staleTime` dan `cacheTime` untuk mengurangi reads Firestore. Hindari polling real-time berlebihan; gunakan listener snapshot terbatas (hanya dashboard admin).
- **Pembatasan Write Harian:** Log aktivitas pendamping dibatasi maksimal 5 entry per hari, izin hanya 1 per hari.
- **Data lokasi:** Hanya menyimpan koordinat check-in/out (lat, lng) di dokumen `dailyLogs`. Tidak menyimpan riwayat lokasi berkelanjutan.
- **Peta:** Menggunakan leaflet dengan tile gratis (OpenStreetMap) untuk tampilan sederhana, tidak memerlukan API key berbayar.

### 5.3 Monitoring Kuota
- Admin dapat melihat estimasi pemakaian storage di dashboard (menggunakan Firebase console secara manual atau API jika ada).
- Jika mendekati batas, aplikasi memberi peringatan (misal, “Storage tersisa < 500 MB”).

## 6. Spesifikasi Teknis

### 6.1 Frontend
- **Next.js 14 (App Router) + TypeScript**
- **Tailwind CSS** + **shadcn/ui** untuk komponen.
- **PWA** dengan `next-pwa` agar bisa diinstal dan mengakses kamera.
- **Kamera:** `navigator.mediaDevices.getUserMedia` dengan fallback input file `capture="environment"`.
- **Image Compression:** `browser-image-compression` dijalankan sebelum upload ke Storage.
- **State Management:** React Context + React Query.
- **Geolocation API:** `navigator.geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 })`.
- **Perhitungan Jarak:** Menggunakan rumus Haversine di client-side untuk membandingkan posisi dengan koordinat target (kantor/penugasan).
- **Fallback:** Jika pengguna menolak izin lokasi, tampilkan pesan edukatif dan arahkan ke pengaturan browser.

### 6.2 Backend & Database
- **Firebase Auth:** Login & token.
- **Firestore:** Database NoSQL.
  - Collections: `users`, `schedules`, `attendances`, `dailyLogs`, `leaves`.
  - Aturan akses ketat berdasarkan role.
- **Firebase Storage:** Path `selfies/{userId}/{timestamp}.jpg`, `documentations/{attendanceId}/...`.
- **Next.js API Routes:** Generate PDF (akses Firestore & Storage menggunakan Firebase Admin SDK, service account aman di environment variable Vercel).
- **Admin SDK** tidak terpengaruh batasan Spark, tetap gratis karena berjalan di server eksternal.

### 6.3 Deployment
- **Vercel:** Hobby plan, cukup untuk traffic internal. Environment variable untuk Firebase config & service account.
- Domain default atau kustom jika tersedia.

## 7. Data Model Singkat (Firestore)
users { uid, email, role, name, createdAt }
schedules { scheduleId, title, date, time, location, mentorId, status }
attendances { attendanceId, userId, scheduleId, type, selfieUrl, photos[], log, timestamp, verification }
dailyLogs { logId, userId, date, entries: [{ time, narration, attachments[] }], checkInTime, checkOutTime, verification }
leaves { leaveId, userId, date, type, reason, attachmentUrl, status }
- **config/officeLocation**: `{ lat: number, lng: number, radius: number }`
- **assignments**: `{ assignmentId, userId, dateStart, dateEnd, location: { lat, lng, name }, description, createdBy, createdAt }`
- **dailyLogs**: Tambahkan field `checkInLocation: { lat, lng }`, `checkOutLocation: { lat, lng }`, `locationType: "office" | "assignment"`, `assignmentId` (jika ada).

Semua dokumen dilengkapi field `createdAt` untuk pembersihan terjadwal.

## 8. Desain UI/UX (Ringkasan)
- Warna biru tua & emas khas Salatiga.
- Mobile-first, navigasi bawah.
- Mentor: kartu jadwal, tombol “Absen”.
- Pendamping: status check-in/out, timeline aktivitas.
- Admin: sidebar (desktop), tabel verifikasi dengan badge pending.

## 9. Kriteria Rilis (MVP)
- [x] Autentikasi & role.
- [x] Admin CRUD jadwal.
- [x] Mentor dapat absen dengan selfie, dokumentasi, log.
- [x] Pendamping check-in/out, log harian.
- [x] Izin & verifikasi.
- [x] Admin verifikasi item.
- [x] Generate PDF sederhana (teks rekap + thumbnail opsional).
- [x] Kompresi gambar <1 MB.
- [x] Uji dengan 5 user, tidak tembus kuota Spark selama 2 minggu.

## 10. Risiko Teknis Tambahan
- **Kuota firestore reads:** Diantisipasi dengan caching React Query dan snapshot terbatas.
- **Storage penuh sebelum Desember:** Fitur penghapusan massal oleh admin via UI.
- **PDF terlalu besar:** Hanya menyertakan teks rekap dan tidak menyematkan foto, hanya link jika perlu.
