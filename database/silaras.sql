-- =====================================================
-- SILARAS - Sistem Informasi Layanan dan Arsip
-- Diskominfo Provinsi Sumatera Utara
-- Database: silaras_db
-- =====================================================

CREATE DATABASE IF NOT EXISTS silaras_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE silaras_db;

SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- Tabel: instansi
-- =====================================================
CREATE TABLE IF NOT EXISTS instansi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_instansi VARCHAR(150) NOT NULL,
  singkatan VARCHAR(50),
  alamat TEXT,
  no_telp VARCHAR(20),
  status ENUM('aktif','nonaktif') DEFAULT 'aktif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabel: users
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  nip VARCHAR(30),
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  no_hp VARCHAR(20),
  instansi_id INT,
  role ENUM('user','admin') DEFAULT 'user',
  foto VARCHAR(255),
  status ENUM('aktif','nonaktif') DEFAULT 'aktif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  FOREIGN KEY (instansi_id) REFERENCES instansi(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabel: jenis_layanan
-- =====================================================
CREATE TABLE IF NOT EXISTS jenis_layanan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_layanan VARCHAR(100) NOT NULL,
  deskripsi TEXT,
  estimasi_waktu VARCHAR(50),
  status ENUM('aktif','nonaktif') DEFAULT 'aktif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabel: permohonan
-- =====================================================
CREATE TABLE IF NOT EXISTS permohonan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kode_tiket VARCHAR(20) UNIQUE,
  user_id INT NOT NULL,
  jenis_layanan_id INT NOT NULL,
  deskripsi_masalah TEXT NOT NULL,
  prioritas ENUM('Rendah','Sedang','Tinggi') DEFAULT 'Sedang',
  lampiran VARCHAR(255),
  status ENUM('Pending','Diproses','Selesai','Ditolak') DEFAULT 'Pending',
  catatan_admin TEXT,
  dokumen_hasil VARCHAR(255),
  ditangani_oleh INT,
  tanggal_selesai DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (jenis_layanan_id) REFERENCES jenis_layanan(id) ON DELETE RESTRICT,
  FOREIGN KEY (ditangani_oleh) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabel: riwayat_status
-- =====================================================
CREATE TABLE IF NOT EXISTS riwayat_status (
  id INT AUTO_INCREMENT PRIMARY KEY,
  permohonan_id INT NOT NULL,
  status_lama VARCHAR(50),
  status_baru VARCHAR(50),
  catatan TEXT,
  diubah_oleh INT,
  waktu DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (permohonan_id) REFERENCES permohonan(id) ON DELETE CASCADE,
  FOREIGN KEY (diubah_oleh) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabel: log_aktivitas
-- =====================================================
CREATE TABLE IF NOT EXISTS log_aktivitas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  aksi VARCHAR(100),
  detail TEXT,
  ip_address VARCHAR(50),
  waktu DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabel: sessions (PHP Session storage)
-- =====================================================
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(128) PRIMARY KEY,
  user_id INT,
  data TEXT,
  last_activity DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- SEED DATA: Instansi OPD Sumatera Utara
-- =====================================================
INSERT INTO instansi (nama_instansi, singkatan, alamat, no_telp, status) VALUES
('Dinas Komunikasi dan Informatika Provinsi Sumatera Utara', 'Diskominfo Sumut', 'Jl. Diponegoro No. 30, Medan', '061-4515251', 'aktif'),
('Badan Perencanaan Pembangunan Daerah Provinsi Sumatera Utara', 'Bappeda Sumut', 'Jl. P. Diponegoro No. 21A, Medan', '061-4514440', 'aktif'),
('Dinas Pendidikan Provinsi Sumatera Utara', 'Disdik Sumut', 'Jl. T.M. Pahlawan No. 17, Medan', '061-4143944', 'aktif'),
('Dinas Kesehatan Provinsi Sumatera Utara', 'Dinkes Sumut', 'Jl. Cik Ditiro No. 2, Medan', '061-4522544', 'aktif'),
('Badan Kepegawaian Daerah Provinsi Sumatera Utara', 'BKD Sumut', 'Jl. Diponegoro No. 30, Medan', '061-4153879', 'aktif'),
('Dinas Keuangan dan Aset Daerah Provinsi Sumatera Utara', 'DKAD Sumut', 'Jl. Diponegoro No. 30, Medan', '061-4513261', 'aktif'),
('Biro Humas dan Protokol Sekretariat Daerah Provinsi Sumatera Utara', 'Biro Humas', 'Jl. Diponegoro No. 30, Medan', '061-4153081', 'aktif'),
('Dinas Perindustrian dan Perdagangan Provinsi Sumatera Utara', 'Disperindag Sumut', 'Jl. Putri Hijau No. 14, Medan', '061-4154671', 'aktif'),
('Inspektorat Daerah Provinsi Sumatera Utara', 'Inspektorat Sumut', 'Jl. Diponegoro No. 30, Medan', '061-4512831', 'aktif'),
('Badan Pengelola Pajak dan Retribusi Daerah Provinsi Sumatera Utara', 'BPPRD Sumut', 'Jl. Sisingamangaraja No. 81, Medan', '061-7865031', 'aktif');

-- =====================================================
-- SEED DATA: Jenis Layanan TI
-- =====================================================
INSERT INTO jenis_layanan (nama_layanan, deskripsi, estimasi_waktu, status) VALUES
('Perbaikan Jaringan', 'Perbaikan koneksi jaringan LAN/WAN, WiFi, dan infrastruktur jaringan di OPD', '1-3 Hari Kerja', 'aktif'),
('Instalasi Software', 'Instalasi dan konfigurasi perangkat lunak aplikasi perkantoran dan sistem operasi', '1-2 Hari Kerja', 'aktif'),
('Perbaikan Hardware', 'Perbaikan perangkat keras komputer, printer, dan perangkat TI lainnya', '2-5 Hari Kerja', 'aktif'),
('Konsultasi IT', 'Konsultasi teknis terkait perencanaan dan pengembangan sistem informasi', '1 Hari Kerja', 'aktif'),
('Pengembangan Aplikasi', 'Pengembangan dan modifikasi aplikasi sistem informasi internal OPD', '14-30 Hari Kerja', 'aktif'),
('Pengelolaan Server', 'Konfigurasi, pemeliharaan, dan troubleshooting server dan hosting', '1-3 Hari Kerja', 'aktif'),
('Backup dan Recovery Data', 'Backup data penting dan pemulihan data yang hilang atau rusak', '1-2 Hari Kerja', 'aktif'),
('Keamanan Siber', 'Audit keamanan sistem, penanganan insiden keamanan, dan pemasangan antivirus', '2-5 Hari Kerja', 'aktif'),
('Pelatihan Pengguna', 'Pelatihan penggunaan aplikasi dan sistem informasi bagi pegawai OPD', '1-3 Hari Kerja', 'aktif'),
('Permintaan Akun & Akses', 'Pembuatan akun email dinas, VPN, dan hak akses sistem informasi', '1 Hari Kerja', 'aktif');

-- =====================================================
-- SEED DATA: Users (Admin + Contoh User)
-- =====================================================
-- Password: Admin@1234 (bcrypt hashed)
INSERT INTO users (nama, nip, email, password, no_hp, instansi_id, role, status) VALUES
('Administrator SILARAS', '199001012020011001', 'admin@diskominfo.sumutprov.go.id', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '081234567890', 1, 'admin', 'aktif'),
('Petugas Teknis 1', '199203052019021001', 'teknis1@diskominfo.sumutprov.go.id', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '081234567891', 1, 'admin', 'aktif');

-- Password: User@1234 (bcrypt hashed) 
INSERT INTO users (nama, nip, email, password, no_hp, instansi_id, role, status) VALUES
('Budi Santoso', '198905102015031002', 'budi.santoso@bappeda.sumutprov.go.id', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '081298765432', 2, 'user', 'aktif'),
('Siti Rahayu', '199112202018032001', 'siti.rahayu@disdik.sumutprov.go.id', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '082198765433', 3, 'user', 'aktif'),
('Ahmad Fauzi', '198703152016031003', 'ahmad.fauzi@bkd.sumutprov.go.id', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '083198765434', 5, 'user', 'aktif');

-- NOTE: Password hash di atas adalah hash dari string 'password' menggunakan bcrypt
-- Untuk demo, password semua user adalah: password
-- Ganti dengan hash yang benar setelah setup

-- =====================================================
-- SEED DATA: Contoh Permohonan
-- =====================================================
INSERT INTO permohonan (kode_tiket, user_id, jenis_layanan_id, deskripsi_masalah, prioritas, status, catatan_admin, ditangani_oleh, tanggal_selesai, created_at) VALUES
('TKT-20260801-0001', 3, 1, 'Jaringan internet di ruang rapat lantai 3 tidak dapat terhubung sejak kemarin. Sudah dicoba restart router namun tetap tidak bisa terhubung.', 'Tinggi', 'Selesai', 'Ditemukan kabel LAN yang putus di patch panel. Sudah diperbaiki dan koneksi sudah normal kembali.', 2, '2026-08-03 14:30:00', '2026-08-01 09:15:00'),
('TKT-20260802-0001', 4, 2, 'Mohon instalasi Microsoft Office 365 di 5 unit komputer baru di ruang kerja Kepala Bidang. Komputer sudah tersedia, tinggal memerlukan software.', 'Sedang', 'Selesai', 'Instalasi Microsoft Office 365 berhasil dilakukan di 5 unit komputer. License telah diaktifkan.', 2, '2026-08-04 16:00:00', '2026-08-02 10:30:00'),
('TKT-20260803-0001', 5, 3, 'Printer HP LaserJet di ruang arsip mengalami paper jam yang tidak bisa diatasi secara mandiri. Printer sudah tidak bisa digunakan.', 'Sedang', 'Diproses', 'Sedang dalam proses pemeriksaan. Diperkirakan perlu penggantian roller kertas.', 2, NULL, '2026-08-03 11:00:00'),
('TKT-20260804-0001', 3, 4, 'Membutuhkan konsultasi terkait rencana pembangunan sistem informasi perencanaan berbasis web untuk kebutuhan internal Bappeda.', 'Rendah', 'Pending', NULL, NULL, NULL, '2026-08-04 08:45:00'),
('TKT-20260805-0001', 4, 10, 'Mohon pembuatan akun email dinas untuk 3 pegawai baru yang baru bergabung di Dinas Pendidikan bulan ini.', 'Sedang', 'Pending', NULL, NULL, NULL, '2026-08-05 09:00:00'),
('TKT-20260806-0001', 5, 8, 'Komputer di ruang server terdeteksi adanya virus/malware. Antivirus sudah expired dan perlu penanganan segera.', 'Tinggi', 'Ditolak', 'Permohonan ditolak karena ruang server BKD bukan dalam wilayah penanganan Diskominfo Provinsi. Harap menghubungi IT internal BKD.', 1, NULL, '2026-08-06 07:30:00');

-- =====================================================
-- SEED DATA: Riwayat Status
-- =====================================================
INSERT INTO riwayat_status (permohonan_id, status_lama, status_baru, catatan, diubah_oleh, waktu) VALUES
(1, NULL, 'Pending', 'Permohonan dibuat oleh pemohon', 3, '2026-08-01 09:15:00'),
(1, 'Pending', 'Diproses', 'Permohonan diterima dan mulai ditangani', 2, '2026-08-02 08:00:00'),
(1, 'Diproses', 'Selesai', 'Perbaikan selesai. Kabel LAN di patch panel sudah diganti.', 2, '2026-08-03 14:30:00'),
(2, NULL, 'Pending', 'Permohonan dibuat oleh pemohon', 4, '2026-08-02 10:30:00'),
(2, 'Pending', 'Diproses', 'Sedang menyiapkan license dan media instalasi', 2, '2026-08-03 09:00:00'),
(2, 'Diproses', 'Selesai', 'Instalasi berhasil di semua unit. License Office 365 telah diaktifkan.', 2, '2026-08-04 16:00:00'),
(3, NULL, 'Pending', 'Permohonan dibuat oleh pemohon', 5, '2026-08-03 11:00:00'),
(3, 'Pending', 'Diproses', 'Teknisi sudah dikirim untuk pemeriksaan', 2, '2026-08-04 10:00:00'),
(4, NULL, 'Pending', 'Permohonan dibuat oleh pemohon', 3, '2026-08-04 08:45:00'),
(5, NULL, 'Pending', 'Permohonan dibuat oleh pemohon', 4, '2026-08-05 09:00:00'),
(6, NULL, 'Pending', 'Permohonan dibuat oleh pemohon', 5, '2026-08-06 07:30:00'),
(6, 'Pending', 'Ditolak', 'Bukan dalam wilayah penanganan Diskominfo Provinsi', 1, '2026-08-06 09:00:00');
