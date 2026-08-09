<?php
// =====================================================
// SILARAS - Permohonan: Edit
// PUT /api/permohonan/update.php?id={id}
// User hanya bisa edit jika status masih Pending
// =====================================================

require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/upload.php';
require_once __DIR__ . '/../../helpers/logger.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') sendError('Method tidak diizinkan', 405);

$currentUser = requireAuth();
$db = getDB();

$id = (int)($_GET['id'] ?? 0);
if (!$id) sendError('ID tidak valid');

// Ambil data existing
$existing = $db->prepare("SELECT * FROM permohonan WHERE id = ?");
$existing->execute([$id]);
$permohonan = $existing->fetch();
if (!$permohonan) sendError('Permohonan tidak ditemukan', 404);

// Cek kepemilikan untuk user
if ($currentUser['role'] === 'user' && $permohonan['user_id'] !== $currentUser['id']) {
    sendError('Akses ditolak', 403);
}

// User hanya bisa edit jika masih Pending
if ($currentUser['role'] === 'user' && $permohonan['status'] !== 'Pending') {
    sendError('Permohonan yang sudah diproses tidak dapat diedit');
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];

$jenisLayananId   = (int)($input['jenis_layanan_id'] ?? $permohonan['jenis_layanan_id']);
$deskripsiMasalah = trim($input['deskripsi_masalah'] ?? $permohonan['deskripsi_masalah']);
$prioritas        = $input['prioritas'] ?? $permohonan['prioritas'];

if (!in_array($prioritas, ['Rendah', 'Sedang', 'Tinggi'])) sendError('Prioritas tidak valid');
if (empty($deskripsiMasalah)) sendError('Deskripsi masalah tidak boleh kosong');

$stmt = $db->prepare("
    UPDATE permohonan SET jenis_layanan_id = ?, deskripsi_masalah = ?, prioritas = ?, updated_at = NOW()
    WHERE id = ?
");
$stmt->execute([$jenisLayananId, $deskripsiMasalah, $prioritas, $id]);

logActivity($db, $currentUser['id'], 'EDIT_PERMOHONAN', "Permohonan ID $id diperbarui");
sendSuccess(null, 'Permohonan berhasil diperbarui');
