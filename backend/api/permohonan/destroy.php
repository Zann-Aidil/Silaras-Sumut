<?php
// =====================================================
// SILARAS - Permohonan: Hapus
// DELETE /api/permohonan/destroy.php?id={id}
// =====================================================

require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/upload.php';
require_once __DIR__ . '/../../helpers/logger.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') sendError('Method tidak diizinkan', 405);

$currentUser = requireAuth();
$db = getDB();

$id = (int)($_GET['id'] ?? 0);
if (!$id) sendError('ID tidak valid');

$existing = $db->prepare("SELECT * FROM permohonan WHERE id = ?");
$existing->execute([$id]);
$permohonan = $existing->fetch();
if (!$permohonan) sendError('Permohonan tidak ditemukan', 404);

// Cek kepemilikan user
if ($currentUser['role'] === 'user' && $permohonan['user_id'] !== $currentUser['id']) {
    sendError('Akses ditolak', 403);
}

// Hanya bisa hapus jika Pending
if ($permohonan['status'] !== 'Pending') {
    sendError('Hanya permohonan dengan status Pending yang dapat dihapus');
}

// Hapus file lampiran jika ada
if ($permohonan['lampiran']) {
    deleteFile(LAMPIRAN_DIR . $permohonan['lampiran']);
}
if ($permohonan['dokumen_hasil']) {
    deleteFile(HASIL_DIR . $permohonan['dokumen_hasil']);
}

$stmt = $db->prepare("DELETE FROM permohonan WHERE id = ?");
$stmt->execute([$id]);

logActivity($db, $currentUser['id'], 'HAPUS_PERMOHONAN', "Permohonan {$permohonan['kode_tiket']} dihapus");
sendSuccess(null, 'Permohonan berhasil dihapus');
