<?php
// =====================================================
// SILARAS - Permohonan: Buat Baru
// POST /api/permohonan/store.php (multipart/form-data)
// =====================================================

require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/upload.php';
require_once __DIR__ . '/../../helpers/logger.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') sendError('Method tidak diizinkan', 405);

$currentUser = requireAuth();
$db = getDB();

// Bisa dari JSON atau multipart
$isMultipart = strpos($_SERVER['CONTENT_TYPE'] ?? '', 'multipart') !== false;
if ($isMultipart) {
    $input = $_POST;
} else {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
}

$jenisLayananId   = (int)($input['jenis_layanan_id'] ?? 0);
$deskripsiMasalah = trim($input['deskripsi_masalah'] ?? '');
$prioritas        = $input['prioritas'] ?? 'Sedang';

// Validasi
$errors = [];
if (!$jenisLayananId)       $errors[] = 'Jenis layanan wajib dipilih';
if (empty($deskripsiMasalah)) $errors[] = 'Deskripsi masalah wajib diisi';
if (!in_array($prioritas, ['Rendah', 'Sedang', 'Tinggi'])) $errors[] = 'Prioritas tidak valid';

// Cek jenis layanan aktif
if ($jenisLayananId) {
    $checkJL = $db->prepare("SELECT id FROM jenis_layanan WHERE id = ? AND status = 'aktif'");
    $checkJL->execute([$jenisLayananId]);
    if (!$checkJL->fetch()) $errors[] = 'Jenis layanan tidak tersedia';
}

if (!empty($errors)) sendError(implode(', ', $errors));

// Upload lampiran (opsional)
$lampiranFilename = null;
if (!empty($_FILES['lampiran']) && $_FILES['lampiran']['error'] !== UPLOAD_ERR_NO_FILE) {
    $uploadResult = uploadFile($_FILES['lampiran'], LAMPIRAN_DIR);
    if (!$uploadResult['success']) sendError($uploadResult['message']);
    $lampiranFilename = $uploadResult['filename'];
}

// Generate kode tiket: TKT-YYYYMMDD-XXXX
$today = date('Ymd');
$countStmt = $db->prepare("SELECT COUNT(*) FROM permohonan WHERE DATE(created_at) = CURDATE()");
$countStmt->execute();
$todayCount = (int)$countStmt->fetchColumn() + 1;
$kodeTiket = 'TKT-' . $today . '-' . str_pad($todayCount, 4, '0', STR_PAD_LEFT);

$stmt = $db->prepare("
    INSERT INTO permohonan (kode_tiket, user_id, jenis_layanan_id, deskripsi_masalah, prioritas, lampiran, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'Pending', NOW())
");
$stmt->execute([$kodeTiket, $currentUser['id'], $jenisLayananId, $deskripsiMasalah, $prioritas, $lampiranFilename]);
$permohonanId = $db->lastInsertId();

// Catat riwayat status awal
$riwayatStmt = $db->prepare("
    INSERT INTO riwayat_status (permohonan_id, status_lama, status_baru, catatan, diubah_oleh, waktu)
    VALUES (?, NULL, 'Pending', 'Permohonan dibuat', ?, NOW())
");
$riwayatStmt->execute([$permohonanId, $currentUser['id']]);

logActivity($db, $currentUser['id'], 'BUAT_PERMOHONAN', "Permohonan $kodeTiket berhasil dibuat");

sendSuccess([
    'id'          => $permohonanId,
    'kode_tiket'  => $kodeTiket,
], 'Permohonan berhasil diajukan', 201);
