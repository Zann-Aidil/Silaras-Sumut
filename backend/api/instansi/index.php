<?php
// =====================================================
// SILARAS - Instansi CRUD
// GET    /api/instansi/index.php         → list semua
// POST   /api/instansi/index.php         → tambah (admin)
// PUT    /api/instansi/index.php?id=X    → edit (admin)
// DELETE /api/instansi/index.php?id=X   → hapus (admin)
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
    $search = trim($_GET['search'] ?? '');
    $where = "WHERE 1=1";
    $params = [];
    if (!empty($search)) {
        $where .= " AND (nama_instansi LIKE ? OR singkatan LIKE ?)";
        $params = ["%$search%", "%$search%"];
    }
    if ($currentUser['role'] === 'user') {
        $where .= " AND status = 'aktif'";
    }

    $stmt = $db->prepare("SELECT * FROM instansi $where ORDER BY nama_instansi ASC");
    $stmt->execute($params);
    sendSuccess($stmt->fetchAll());
}

// ── POST ───────────────────────────────────────────
if ($method === 'POST') {
    requireAdmin();
    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    $namaInstansi = trim($input['nama_instansi'] ?? '');
    $singkatan    = trim($input['singkatan'] ?? '');
    $alamat       = trim($input['alamat'] ?? '');
    $noTelp       = trim($input['no_telp'] ?? '');
    $status       = $input['status'] ?? 'aktif';

    if (empty($namaInstansi)) sendError('Nama instansi wajib diisi');

    $stmt = $db->prepare("
        INSERT INTO instansi (nama_instansi, singkatan, alamat, no_telp, status, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
    ");
    $stmt->execute([$namaInstansi, $singkatan ?: null, $alamat ?: null, $noTelp ?: null, $status]);
    $id = $db->lastInsertId();

    logActivity($db, $currentUser['id'], 'TAMBAH_INSTANSI', "Instansi: $namaInstansi");
    sendSuccess(['id' => $id], 'Instansi berhasil ditambahkan', 201);
}

// ── PUT ────────────────────────────────────────────
if ($method === 'PUT') {
    requireAdmin();
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) sendError('ID tidak valid');

    $check = $db->prepare("SELECT id FROM instansi WHERE id = ?");
    $check->execute([$id]);
    if (!$check->fetch()) sendError('Instansi tidak ditemukan', 404);

    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $namaInstansi = trim($input['nama_instansi'] ?? '');
    if (empty($namaInstansi)) sendError('Nama instansi wajib diisi');

    $stmt = $db->prepare("
        UPDATE instansi SET nama_instansi = ?, singkatan = ?, alamat = ?, no_telp = ?, status = ?, updated_at = NOW()
        WHERE id = ?
    ");
    $stmt->execute([
        $namaInstansi,
        trim($input['singkatan'] ?? '') ?: null,
        trim($input['alamat'] ?? '') ?: null,
        trim($input['no_telp'] ?? '') ?: null,
        $input['status'] ?? 'aktif',
        $id
    ]);

    logActivity($db, $currentUser['id'], 'EDIT_INSTANSI', "Instansi ID $id diperbarui");
    sendSuccess(null, 'Instansi berhasil diperbarui');
}

// ── DELETE ─────────────────────────────────────────
if ($method === 'DELETE') {
    requireAdmin();
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) sendError('ID tidak valid');

    $checkUsed = $db->prepare("SELECT COUNT(*) FROM users WHERE instansi_id = ?");
    $checkUsed->execute([$id]);
    if ((int)$checkUsed->fetchColumn() > 0) {
        sendError('Instansi tidak dapat dihapus karena masih memiliki user terdaftar.');
    }

    $stmt = $db->prepare("DELETE FROM instansi WHERE id = ?");
    $stmt->execute([$id]);

    logActivity($db, $currentUser['id'], 'HAPUS_INSTANSI', "Instansi ID $id dihapus");
    sendSuccess(null, 'Instansi berhasil dihapus');
}

sendError('Method tidak diizinkan', 405);
