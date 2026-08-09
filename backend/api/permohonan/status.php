<?php
// =====================================================
// SILARAS - Permohonan: Update Status (Admin)
// PUT /api/permohonan/status.php?id={id}
// Supports: status update, catatan_admin, upload dokumen_hasil
// =====================================================

require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/upload.php';
require_once __DIR__ . '/../../helpers/logger.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') sendError('Method tidak diizinkan', 405);

$currentUser = requireAdmin();
$db = getDB();

$id = (int)($_GET['id'] ?? 0);
if (!$id) sendError('ID tidak valid');

$existing = $db->prepare("SELECT * FROM permohonan WHERE id = ?");
$existing->execute([$id]);
$permohonan = $existing->fetch();
if (!$permohonan) sendError('Permohonan tidak ditemukan', 404);

// Baca input
$isMultipart = strpos($_SERVER['CONTENT_TYPE'] ?? '', 'multipart') !== false;
$input = $isMultipart ? $_POST : (json_decode(file_get_contents('php://input'), true) ?? []);

$newStatus    = $input['status'] ?? '';
$catatanAdmin = trim($input['catatan_admin'] ?? '');

$validStatuses = ['Pending', 'Diproses', 'Selesai', 'Ditolak'];
if (!in_array($newStatus, $validStatuses)) sendError('Status tidak valid');

// Upload dokumen hasil (opsional, biasanya saat Selesai)
$dokumenHasil = $permohonan['dokumen_hasil'];
if (!empty($_FILES['dokumen_hasil']) && $_FILES['dokumen_hasil']['error'] !== UPLOAD_ERR_NO_FILE) {
    $uploadResult = uploadFile($_FILES['dokumen_hasil'], HASIL_DIR);
    if (!$uploadResult['success']) sendError($uploadResult['message']);
    $dokumenHasil = $uploadResult['filename'];
}

$tanggalSelesai = null;
if ($newStatus === 'Selesai') {
    $tanggalSelesai = date('Y-m-d H:i:s');
}

// Update permohonan
$stmt = $db->prepare("
    UPDATE permohonan SET
        status = ?, catatan_admin = ?, dokumen_hasil = ?,
        ditangani_oleh = ?, tanggal_selesai = ?, updated_at = NOW()
    WHERE id = ?
");
$stmt->execute([$newStatus, $catatanAdmin ?: null, $dokumenHasil, $currentUser['id'], $tanggalSelesai, $id]);

// Catat riwayat status
$riwayatStmt = $db->prepare("
    INSERT INTO riwayat_status (permohonan_id, status_lama, status_baru, catatan, diubah_oleh, waktu)
    VALUES (?, ?, ?, ?, ?, NOW())
");
$riwayatStmt->execute([$id, $permohonan['status'], $newStatus, $catatanAdmin ?: null, $currentUser['id']]);

logActivity($db, $currentUser['id'], 'UPDATE_STATUS', "Status permohonan ID $id: {$permohonan['status']} → $newStatus");
sendSuccess(null, "Status berhasil diubah menjadi $newStatus");
