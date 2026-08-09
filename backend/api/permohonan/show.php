<?php
// =====================================================
// SILARAS - Permohonan: Detail
// GET /api/permohonan/show.php?id={id}
// =====================================================

require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') sendError('Method tidak diizinkan', 405);

$currentUser = requireAuth();
$db = getDB();

$id = (int)($_GET['id'] ?? 0);
if (!$id) sendError('ID permohonan tidak valid');

$stmt = $db->prepare("
    SELECT 
        p.*,
        u.nama AS nama_pemohon, u.nip, u.email AS email_pemohon, u.no_hp,
        i.nama_instansi, i.singkatan AS singkatan_instansi,
        jl.nama_layanan, jl.deskripsi AS deskripsi_layanan, jl.estimasi_waktu,
        adm.nama AS nama_admin, adm.no_hp AS hp_admin
    FROM permohonan p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN instansi i ON u.instansi_id = i.id
    LEFT JOIN jenis_layanan jl ON p.jenis_layanan_id = jl.id
    LEFT JOIN users adm ON p.ditangani_oleh = adm.id
    WHERE p.id = ?
");
$stmt->execute([$id]);
$permohonan = $stmt->fetch();

if (!$permohonan) sendError('Permohonan tidak ditemukan', 404);

// User hanya boleh lihat milik sendiri
if ($currentUser['role'] === 'user' && $permohonan['user_id'] !== $currentUser['id']) {
    sendError('Akses ditolak', 403);
}

// Ambil riwayat status
$riwayatStmt = $db->prepare("
    SELECT rs.*, u.nama AS nama_pengubah
    FROM riwayat_status rs
    LEFT JOIN users u ON rs.diubah_oleh = u.id
    WHERE rs.permohonan_id = ?
    ORDER BY rs.waktu ASC
");
$riwayatStmt->execute([$id]);
$permohonan['riwayat_status'] = $riwayatStmt->fetchAll();

sendSuccess($permohonan);
