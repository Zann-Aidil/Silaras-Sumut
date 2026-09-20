# SILARAS — Panduan Instalasi & Setup Lokal

**Sistem Informasi Layanan dan Arsip Diskominfo Provinsi Sumatera Utara**

---

## Prasyarat

| Software | Versi | Link |
|---|---|---|
| XAMPP | 8.x | https://www.apachefriends.org |
| Node.js | 18+ | https://nodejs.org |
| PHP | 8.1+ | (sudah termasuk di XAMPP) |
| MySQL | 8.0+ | (sudah termasuk di XAMPP) |
| Browser | Chrome / Edge | — |

---

## LANGKAH 1 — Setup Database MySQL

1. **Buka XAMPP Control Panel**, Start **Apache** dan **MySQL**
2. Buka browser → http://localhost/phpmyadmin
3. Klik **Import** → Pilih file `database/silaras.sql` dari folder proyek ini
4. Klik **Go** — database `silaras_db` akan otomatis terbuat beserta tabel dan data contoh

---

## LANGKAH 2 — Setup Backend PHP

1. Salin folder `backend/` ke direktori XAMPP:
   ```
   C:\xampp\htdocs\silaras-backend\
   ```

2. **Verifikasi struktur folder:**
   ```
   C:\xampp\htdocs\silaras-backend\
   ├── config/
   │   ├── database.php
   │   └── bootstrap.php
   ├── api/
   │   ├── auth/
   │   ├── permohonan/
   │   ├── layanan/
   │   ├── instansi/
   │   ├── users/
   │   └── laporan/
   ├── middleware/
   ├── helpers/
   └── uploads/
   ```

3. **Konfigurasi database** (jika password MySQL berbeda):
   Edit file `config/database.php`:
   ```php
   define('DB_USER', 'root');
   define('DB_PASS', '');  // Ganti sesuai password MySQL Anda
   ```

4. **Pastikan folder uploads dapat ditulis** (write permission):
   Folder `uploads/lampiran/` dan `uploads/hasil/` akan otomatis dibuat saat pertama kali upload file.

---

## LANGKAH 3 — Setup Frontend React

1. **Install dependencies** (hanya sekali):
   ```bash
   cd frontend
   npm install
   ```

2. **Jalankan development server:**
   ```bash
   npm run dev
   ```

3. Buka browser → **http://localhost:5173**

---

## Akun Login Default (Seed Data)

> ⚠️ Semua akun di bawah menggunakan password: `password`

| Nama | Email | Role |
|---|---|---|
| Administrator SILARAS | admin@diskominfo.sumutprov.go.id | Admin |
| Petugas Teknis 1 | teknis1@diskominfo.sumutprov.go.id | Admin |
| Budi Santoso | budi.santoso@bappeda.sumutprov.go.id | User |
| Siti Rahayu | siti.rahayu@disdik.sumutprov.go.id | User |
| Ahmad Fauzi | ahmad.fauzi@bkd.sumutprov.go.id | User |



> 💡 **PENTING:** Ganti password semua akun setelah pertama kali login!

---

## Struktur Proyek

```
Helpdesk/
├── database/
│   └── silaras.sql           ← Import ke phpMyAdmin
├── backend/                  ← Salin ke htdocs/silaras-backend/
│   ├── config/
│   ├── api/
│   ├── middleware/
│   ├── helpers/
│   └── uploads/
└── frontend/                 ← Dijalankan dengan npm run dev
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   └── utils/
    └── package.json
```

---

## Konfigurasi URL Backend

Jika backend diletakkan di path berbeda dari `localhost/silaras-backend`, edit:
```
frontend/src/api/axios.js
```
Ubah baris:
```js
const API_BASE = 'http://localhost/silaras-backend/api';
```

---

## Troubleshooting

### CORS Error
Pastikan backend ada di `http://localhost/silaras-backend/` dan `config/bootstrap.php` sudah terkonfigurasi dengan benar.

### Session tidak tersimpan
Pastikan `withCredentials: true` ada di `axios.js` dan XAMPP sudah berjalan.

### Upload file gagal
Periksa `php.ini` XAMPP:
- `upload_max_filesize = 5M`
- `post_max_size = 10M`
Restart Apache setelah perubahan.

### Password salah saat login dengan akun seed
Hash password di seed data adalah hash dari string `password`. Pastikan ekstensi `bcrypt` PHP aktif.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Vanilla CSS (Design System Custom) |
| Charts | Chart.js + react-chartjs-2 |
| PDF Export | jsPDF + jspdf-autotable |
| Icons | Lucide React |
| HTTP Client | Axios |
| Backend | PHP 8.1 (Native, tanpa framework) |
| Database | MySQL 8.0 |
| Auth | PHP Session |
| File Upload | PHP Native Upload |

---

## API Endpoints

Backend berjalan di: `http://localhost/silaras-backend/api`

| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/auth/login.php` | Login |
| POST | `/auth/register.php` | Register |
| POST | `/auth/logout.php` | Logout |
| GET/PUT | `/auth/profile.php` | Profil |
| GET | `/permohonan/index.php` | List permohonan |
| GET | `/permohonan/show.php?id=X` | Detail permohonan |
| POST | `/permohonan/store.php` | Buat permohonan |
| PUT | `/permohonan/update.php?id=X` | Edit permohonan |
| DELETE | `/permohonan/destroy.php?id=X` | Hapus permohonan |
| POST | `/permohonan/status.php?id=X` | Update status (Admin) |
| GET/POST/PUT/DELETE | `/layanan/index.php` | CRUD jenis layanan |
| GET/POST/PUT/DELETE | `/instansi/index.php` | CRUD instansi |
| GET/POST/PUT/DELETE | `/users/index.php` | CRUD users (Admin) |
| GET | `/laporan/index.php?type=...` | Rekap laporan |
