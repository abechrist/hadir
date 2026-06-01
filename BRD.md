# Business Requirements Document (BRD)
## Aplikasi Kehadiran Mentor & Pendamping
### Program Penumbuhan Wirausaha Muda Kota Salatiga 2026
**Disusun untuk:** Bidang Kepemudaan, Dinas Pemuda dan Olahraga Kota Salatiga  
**Tanggal:** 1 Juni 2026  
**Versi:** 1.1 (Pilihan Firebase Spark Plan)

---

## 1. Tujuan Bisnis
Menyediakan sistem digital pencatatan kehadiran dan dokumentasi kegiatan mentor serta pendamping yang transparan, akuntabel, dan tanpa biaya infrastruktur tambahan (menggunakan layanan gratis). Output akhir berupa laporan bulanan otomatis untuk pertanggungjawaban kepada Bidang Kepemudaan Dispora Salatiga.

## 2. Pemangku Kepentingan
| Peran | Deskripsi |
|-------|------------|
| Admin (Bidang Kepemudaan) | Memonitor, memverifikasi kehadiran & aktivitas, menerima laporan bulanan. |
| Mentor | Absensi per kegiatan terjadwal, dokumentasi, pengajuan izin. |
| Pendamping | Absensi harian (masuk/pulang), log aktivitas harian, pengajuan izin. |

## 3. Permasalahan Bisnis
- Pencatatan manual rentan kehilangan dan sulit direkap.
- Tidak ada bukti otentik terintegrasi (foto selfie & dokumentasi).
- Verifikasi oleh Bidang Kepemudaan lambat dan tidak real-time.
- Penyusunan laporan bulanan memakan waktu serta rawan inkonsistensi.

## 4. Ruang Lingkup
### Termasuk
- Absensi mentor berbasis kegiatan terjadwal (mentoring, kelas, visit).
- Absensi harian pendamping (Senin–Jumat) dengan jam masuk & pulang.
- Upload selfie wajib untuk check-in/check-out.
- Upload foto/dokumentasi kegiatan sebagai evidence.
- Catatan log kegiatan (mentor) dan log aktivitas harian (pendamping).
- Pengajuan izin tidak hadir dengan alasan (sakit, kegiatan lain).
- Verifikasi data oleh admin.
- Generate laporan bulanan dalam PDF.
- **Seluruh operasi berada dalam batas gratis Firebase (Spark Plan).**

### Tidak Termasuk
- Penggajian atau honor.
- Integrasi sistem kepegawaian daerah.
- Aplikasi native (cukup web app responsif + PWA).

## 5. Kebutuhan Fungsional Utama (High-Level)
1. Otentikasi & otorisasi pengguna (admin, mentor, pendamping).
2. Manajemen jadwal kegiatan oleh admin.
3. Absensi mentor: selfie, foto kegiatan, log.
4. Absensi pendamping: check-in/out, selfie, log harian.
5. Pengajuan dan persetujuan izin.
6. Panel verifikasi admin.
7. Laporan bulanan PDF otomatis.
8. **Validasi lokasi saat absensi pendamping (check-in/out).**  
   Aplikasi mendeteksi koordinat GPS perangkat pendamping. Jika tidak dalam radius toleransi dari kantor Dispora Salatiga (default 150 meter), absensi ditolak, kecuali terdapat surat penugasan luar dari admin.
9. **Penugasan luar kantor oleh admin.**  
   Admin dapat menetapkan lokasi alternatif (misal, lokasi kegiatan visit) bagi pendamping pada tanggal tertentu. Pada hari tersebut, validasi absensi mengacu ke koordinat lokasi penugasan, bukan kantor.

## 6. Kebutuhan Non-Fungsional
- **Biaya Operasional:** Rp0 (Firebase Spark Plan + Vercel Hobby).
- **Keamanan:** Firebase Security Rules sesuai role. Data sensitif hanya diakses pihak berwenang.
- **Ketersediaan:** Vercel (uptime tinggi), Firebase Spark (SLA tidak dijamin, namun cukup andal).
- **Responsif:** Web app mobile-first, akses kamera via PWA.
- **Kinerja:** Gambar dikompresi (maks 1 MB) sebelum upload; halaman ringan.
- **Retensi Data:** File di Storage dapat dihapus berkala setelah laporan bulanan terverifikasi untuk menjaga kuota.
- **Retensi File:** Foto selfie dan dokumentasi di Firebase Storage hanya disimpan maksimal 30 hari setelah laporan bulanan terverifikasi. Sistem akan menyarankan pengguna untuk mengunduh salinan cadangan sebelum penghapusan.

## 7. Asumsi & Batasan
- Mentor & pendamping memiliki ponsel berkamera dan koneksi internet.
- Volume data harian masih dalam batas Spark Plan (mis. maks. 20 pendamping + 10 mentor, total transaksi aman di bawah 20K writes/hari).
- Kuota Storage 5 GB cukup dengan kompresi ketat dan penghapusan file usang.
- **Proyek hanya berlangsung hingga Desember 2026**, sehingga tidak diperlukan skalabilitas jangka panjang.
- Jika kuota mendekati batas, admin akan membersihkan data lama atau mengunduh arsip manual.

## 8. Risiko & Mitigasi
| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| Kuota Firestore melebihi 50K reads/hari | Aplikasi lambat/error | Optimasi query, caching lokal (React Query), batasi polling. |
| Kuota Storage 5 GB penuh | Upload gagal | Kompresi client-side (max 1MB/foto), hapus foto >3 bulan setelah laporan terbit. |
| Koneksi internet buruk | Data tidak terkirim | Simpan draft offline (IndexedDB), sync saat online. |
| Firebase Spark tiba-tiba turun | Akses terganggu | Tidak ada SLA, mitigasi: backup periodik manual. |
| Kuota Storage 5 GB penuh | Upload gagal, data baru tidak tersimpan | Kompresi gambar ≤1 MB. Setelah laporan bulanan terbit, sistem menyarankan mentor/pendamping mengunduh salinan file mereka. Admin dapat menghapus file yang sudah di-backup pengguna. |
| GPS tidak akurat/dinonaktifkan | Pendamping tidak bisa absen | Toleransi radius 150 m; jika GPS tetap tidak tersedia, fallback ke mode izin khusus (admin bisa verifikasi manual) atau pendamping mengajukan izin. |
| Pendamping lupa meminta penugasan | Tidak bisa absen di luar | Fitur pengajuan penugasan darurat oleh pendamping (opsional), atau admin membuat penugasan setelah kejadian untuk keperluan verifikasi. |
