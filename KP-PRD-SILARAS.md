# PRD & Dokumentasi KP — SILARAS

## 1. Judul Proyek
Sistem Informasi Layanan dan Arsip (SILARAS) untuk Diskominfo Provinsi Sumatera Utara.

## 2. Ringkasan Eksekutif
SILARAS adalah aplikasi web full-stack yang membantu pengelolaan permohonan layanan TI dan arsip digital di lingkungan instansi pemerintah. Proyek ini dibangun sebagai pekerjaan praktik (KP) dengan tujuan mengotomatisasi alur permohonan, mempermudah monitoring status, dan menyediakan laporan operasional baik untuk pengguna biasa maupun admin.

## 3. Latar Belakang
Instansi pemerintah sering menerima permohonan layanan TI dari banyak unit kerja. Proses manual memicu keterlambatan penanganan, kesulitan pelacakan, dan kurangnya transparansi. SILARAS hadir untuk menyederhanakan proses tersebut dalam bentuk portal internal dengan akses role-based.

## 4. Tujuan KP
- Membangun aplikasi manajemen permohonan layanan TI berbasis web.
- Menyediakan modul untuk pengguna umum mengajukan permohonan dan melihat status.
- Menyediakan modul admin untuk mengelola layanan, instansi, user, dan memproses permohonan.
- Menghasilkan laporan ringkas dan eksport PDF.
- Mencapai dokumentasi KP yang mengikuti pedoman Universitas Medan Area.

## 5. Ruang Lingkup
1. Frontend React untuk UI.
2. Backend PHP native untuk API.
3. MySQL sebagai database.
4. Autentikasi berbasis session.
5. Upload lampiran dokumen dan hasil.
6. Report dashboard untuk admin dan user.
7. Export data laporan.

## 6. Stakeholder
- Mahasiswa pelaksana KP.
- Pembimbing KP prodi Informatika UMA.
- Dosen pembimbing lapangan.
- Pengguna akhir: staf OPD dan admin Diskominfo.

## 7. Manfaat
- Percepatan proses permohonan TI.
- Pelacakan status permohonan real time.
- Pengurangan penggunaan dokumen kertas.
- Kemudahan monitoring bagi admin.
- Arsitektur mudah dikembangkan untuk sistem serupa.

## 8. Fitur Utama
### 8.1 Autentikasi dan Profil
- Login menggunakan email dan password.
- Logout dan sesi user.
- Profil user dapat diperbarui.
- Role: `admin` dan `user`.

### 8.2 Modul User
- Dashboard ringkas dengan status permohonan.
- Pengajuan permohonan baru (`/permohonan/baru`).
- Daftar permohonan dengan filter status, prioritas, layanan.
- Detail permohonan.
- Edit permohonan jika masih `Pending`.

### 8.3 Modul Admin
- Dashboard admin dengan statistik dan grafik.
- Manajemen permohonan lengkap.
- CRUD jenis layanan.
- CRUD instansi.
- CRUD user.
- Laporan rekap data.
- Update status permohonan dan catatan admin.

### 8.4 Laporan dan Ekspor
- Ringkasan permohonan per instansi.
- Export data laporan dalam format PDF.
- Rekap berdasarkan filter tanggal dan tipe.

## 9. Use Case Utama
1. Pengguna login dan mengajukan permohonan.
2. Pengguna melihat status permohonan.
3. Admin memproses permohonan dan memperbarui status.
4. Admin menambah/mengedit layanan.
5. Admin menambah/mengedit instansi.
6. Admin menambah/mengedit user.
7. Sistem mengirimkan data JSON untuk frontend.

## 10. Arsitektur Sistem
### Frontend
- React 18 + Vite
- React Router Dom untuk routing
- Axios untuk koneksi API
- Lucide React untuk ikon
- Chart.js + react-chartjs-2 untuk grafik
- Vanilla CSS untuk styling

### Backend
- PHP native tanpa framework
- MySQL database
- Session-based auth
- File upload untuk lampiran dan dokumen hasil
- CORS dan JSON API

### Alur Data
- Frontend melakukan request ke API `http://localhost/silaras-backend/api`
- Backend memverifikasi session, memproses query ke database, lalu mengembalikan response JSON
- Frontend menampilkan daftar, detail, grafik, dan form berdasarkan response

## 11. Struktur Data & Endpoint
### 11.1 Tabel Kunci
- `users`
- `permohonan`
- `jenis_layanan`
- `instansi`
- `laporan`

### 11.2 Endpoint Utama
- `POST /auth/login.php`
- `POST /auth/logout.php`
- `GET/PUT /auth/profile.php`
- `GET /permohonan/index.php`
- `GET /permohonan/show.php?id=X`
- `POST /permohonan/store.php`
- `PUT /permohonan/update.php?id=X`
- `DELETE /permohonan/destroy.php?id=X`
- `POST /permohonan/status.php?id=X`
- `GET/POST/PUT/DELETE /layanan/index.php`
- `GET/POST/PUT/DELETE /instansi/index.php`
- `GET/POST/PUT/DELETE /users/index.php`
- `GET /laporan/index.php?type=...`

## 12. Diagram Modul Frontend
- `App.jsx`: router aplikasi
- `AuthContext.jsx`: state autentikasi dan profil user
- `Login.jsx` / `Register.jsx`: form auth
- `UserLayout.jsx` / `AdminLayout.jsx`: layout halaman
- `Dashboard.jsx`: ringkasan user/admin
- `PermohonanBaru.jsx`: form pengajuan baru
- `PermohonanList.jsx`: daftar permohonan
- `PermohonanDetail.jsx`: tampilan detail
- `PermohonanEdit.jsx`: edit form
- `Profil.jsx`: manajemen profil
- `JenisLayanan.jsx`, `Instansi.jsx`, `Users.jsx`, `Laporan.jsx`: CRUD admin

## 13. Implementasi & Teknologi
- `frontend/package.json` menggunakan React + Vite.
- `backend/config/bootstrap.php` mengatur CORS, session, dan JSON header.
- `frontend/src/api/axios.js` mengatur `withCredentials: true` agar session PHP berfungsi.
- `backend/api/auth/login.php` menggunakan `password_verify` dan session.
- `backend/api/permohonan/index.php` menyediakan query filter, pagination, dan role-based akses.

## 14. Kesesuaian dengan Pedoman KP UMA
Dokumen KP ini disusun mengikuti format BLP UMA:

### 14.1 Bagian Awal
1. Cover
2. Halaman Pengesahan
3. Berita Acara dan Nilai Seminar KP
4. Abstrak
5. Kata Pengantar
6. Daftar Isi
7. Daftar Gambar (jika ada)
8. Daftar Tabel (jika ada)

### 14.2 Bagian Isi
1. **Abstrak**: ringkasan tujuan, metodologi, hasil.
2. **Bab I Pendahuluan**
   - Latar belakang
   - Rumusan masalah
   - Tujuan
   - Manfaat
   - Waktu dan tempat pelaksanaan
3. **Bab II Tinjauan Teori**
   - Teori terkait sistem informasi
   - Teori database dan CRUD
   - Teori keamanan dan session auth
   - UML, DFD, use case, ERD
4. **Bab III Pembahasan Hasil / Pelaksanaan KP**
   - Ruang lingkup kegiatan
   - Bentuk kegiatan
   - Hasil kerja praktek
     - Analisis sistem berjalan
     - Analisis sistem usulan
     - Desain dan perancangan (DFD, ERD, UML, use case, interface)
     - Struktur tabel database
     - Desain antarmuka sistem
     - Implementasi sistem
5. **Bab IV Penutup**
   - Kesimpulan
   - Saran
6. **Daftar Pustaka** (APA Style)

### 14.3 Bagian Akhir
- Dokumentasi kegiatan di lokasi
- Hasil Turnitin
- Form Berita Acara Bimbingan KP
- Form Penilaian Pembimbing Lapangan
- Form Penilaian Pembimbing Prodi
- Surat Pembimbing Kerja Praktek
- Surat Selesai Kerja Praktek

## 15. Catatan Khusus Untuk Laporan KP
- Gunakan font Times New Roman.
- Ukuran font BAB: 14 bold.
- Ukuran font sub-bab dan isi: 12.
- Line spacing 1.5.
- Margin: kiri 4 cm, atas-kanan-bawah 3 cm.
- Kertas: A4.
- Tabel dan gambar diberi keterangan.
- Upload final laporan ke: `https://bit.ly/LaporanKPinf` dan `http://sinditaka.uma.ac.id/`.

## 16. Rencana Pengujian
1. Uji login/logout untuk kedua role.
2. Uji form pengajuan permohonan dan upload lampiran.
3. Uji filter dan pagination permohonan.
4. Uji status update oleh admin.
5. Uji CRUD layanan, instansi, dan user.
6. Uji export laporan.
7. Uji proteksi API dengan role-based check.

## 17. Setup dan Deployment
1. Import database `database/silaras.sql` ke phpMyAdmin.
2. Salin folder `backend/` ke `C:\xampp\htdocs\silaras-backend\`.
3. Update `backend/config/database.php` jika diperlukan.
4. Jalankan `npm install` di folder `frontend`.
5. Jalankan `npm run dev` dan akses `http://localhost:5173`.
6. Pastikan backend dapat diakses di `http://localhost/silaras-backend/api`.

## 18. Kelebihan Proyek
- Implementasi end-to-end dengan frontend dan backend.
- Role-based akses dan session auth.
- Modul dashboard dan laporan.
- Sistem modular untuk pengembangan berikutnya.

## 19. Rekomendasi Perbaikan Selanjutnya
- Tambahkan notifikasi email/sms.
- Tambahkan audit log aktivitas user.
- Tambahkan manajemen inventaris layanan.
- Migrasi API ke framework PHP atau Node.js untuk skalabilitas.
- Tambahkan unit test dan e2e test.

---

> Dokumen ini dibuat sebagai dasar PRD dan laporan KP sesuai pedoman Universitas Medan Area dan struktur BLP.
