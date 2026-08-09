<?php
// =====================================================
// SILARAS - Jenis Layanan CRUD
// GET    /api/layanan/index.php         → list semua
// POST   /api/layanan/index.php         → tambah (admin)
// PUT    /api/layanan/index.php?id=X    → edit (admin)
// DELETE /api/layanan/index.php?id=X   → hapus (admin)
// =====================================================

require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/logger.php';
require_once __DIR__ . '/../../middleware/auth.php';

$currentUser = requireAuth();
$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// ── GET ────────────────────────────────────────────
if ($method === 'GET') {
    $statusFilter = $_GET['status'] ?? '';
    $where = $statusFilter ? "WHERE status = ?" : "WHERE 1=1";
    $params = $statusFilter ? [$statusFilter] : [];

    // User hanya dapat melihat yang aktif
    if ($currentUser['role'] === 'user') {
        $where = "WHERE status = 'aktif'";
        $params = [];
    }

    $stmt = $db->prepare("SELECT * FROM jenis_layanan $where ORDER BY nama_layanan ASC");
    $stmt->execute($params);
    sendSuccess($stmt->fetchAll());
}

// ── POST ───────────────────────────────────────────
if ($method === 'POST') {
    requireAdmin();
    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    $namaLayanan   = trim($input['nama_layanan'] ?? '');
    $deskripsi     = trim($input['deskripsi'] ?? '');
    $estimasiWaktu = trim($input['estimasi_waktu'] ?? '');
    $status        = $input['status'] ?? 'aktif';

    if (empty($namaLayanan)) sendError('Nama layanan wajib diisi');
    if (!in_array($status, ['aktif', 'nonaktif'])) sendError('Status tidak valid');

    $stmt = $db->prepare("
        INSERT INTO jenis_layanan (nama_layanan, deskripsi, estimasi_waktu, status, created_at)
        VALUES (?, ?, ?, ?, NOW())
    ");
    $stmt->execute([$namaLayanan, $deskripsi ?: null, $estimasiWaktu ?: null, $status]);
    $id = $db->lastInsertId();

    logActivity($db, $currentUser['id'], 'TAMBAH_LAYANAN', "Layanan: $namaLayanan");
    sendSuccess(['id' => $id], 'Jenis layanan berhasil ditambahkan', 201);
}

// ── PUT ────────────────────────────────────────────
if ($method === 'PUT') {
    requireAdmin();
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) sendError('ID tidak valid');

    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $namaLayanan   = trim($input['nama_layanan'] ?? '');
    $deskripsi     = trim($input['deskripsi'] ?? '');
    $estimasiWaktu = trim($input['estimasi_waktu'] ?? '');
    $status        = $input['status'] ?? 'aktif';

    if (empty($namaLayanan)) sendError('Nama layanan wajib diisi');

    $check = $db->prepare("SELECT id FROM jenis_layanan WHERE id = ?");
    $check->execute([$id]);
    if (!$check->fetch()) sendError('Jenis layanan tidak ditemukan', 404);

    $stmt = $db->prepare("
        UPDATE jenis_layanan SET nama_layanan = ?, deskripsi = ?, estimasi_waktu = ?, status = ?, updated_at = NOW()
        WHERE id = ?
    ");
    $stmt->execute([$namaLayanan, $deskripsi ?: null, $estimasiWaktu ?: null, $status, $id]);

    logActivity($db, $currentUser['id'], 'EDIT_LAYANAN', "Layanan ID $id diperbarui");
    sendSuccess(null, 'Jenis layanan berhasil diperbarui');
}

// ── DELETE ─────────────────────────────────────────
if ($method === 'DELETE') {
    requireAdmin();
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) sendError('ID tidak valid');

    // Cek apakah ada permohonan yang menggunakan layanan ini
    $checkUsed = $db->prepare("SELECT COUNT(*) FROM permohonan WHERE jenis_layanan_id = ?");
    $checkUsed->execute([$id]);
    if ((int)$checkUsed->fetchColumn() > 0) {
        sendError('Jenis layanan tidak dapat dihapus karena sudah digunakan pada permohonan. Nonaktifkan saja.');
    }

    $stmt = $db->prepare("DELETE FROM jenis_layanan WHERE id = ?");
    $stmt->execute([$id]);

    logActivity($db, $currentUser['id'], 'HAPUS_LAYANAN', "Layanan ID $id dihapus");
    sendSuccess(null, 'Jenis layanan berhasil dihapus');
}

sendError('Method tidak diizinkan', 405);
