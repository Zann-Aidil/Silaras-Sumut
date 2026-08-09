<?php
// =====================================================
// SILARAS - Auth: Profil (GET + PUT)
// GET  /api/auth/profile.php  → ambil profil sendiri
// PUT  /api/auth/profile.php  → update profil / ganti password
// =====================================================

require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/upload.php';
require_once __DIR__ . '/../../middleware/auth.php';

$currentUser = requireAuth();
$db = getDB();

// ── GET: Ambil profil ──────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $db->prepare("
        SELECT u.id, u.nama, u.nip, u.email, u.no_hp, u.instansi_id,
               u.role, u.foto, u.status, u.created_at,
               i.nama_instansi, i.singkatan
        FROM users u
        LEFT JOIN instansi i ON u.instansi_id = i.id
        WHERE u.id = ?
    ");
    $stmt->execute([$currentUser['id']]);
    $user = $stmt->fetch();
    if (!$user) sendError('User tidak ditemukan', 404);
    sendSuccess($user);
}

// ── PUT: Update profil ────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Cek jika ada upload foto (multipart)
    $input = [];
    if (!empty($_FILES['foto'])) {
        $uploadResult = uploadFile($_FILES['foto'], FOTO_DIR, ['image/jpeg', 'image/png', 'image/gif']);
        if (!$uploadResult['success']) sendError($uploadResult['message']);
        $input['foto'] = $uploadResult['filename'];
    }

    // Baca JSON body
    $jsonInput = json_decode(file_get_contents('php://input'), true) ?? [];
    $input = array_merge($input, $jsonInput);

    $nama     = trim($input['nama'] ?? '');
    $nip      = trim($input['nip'] ?? '');
    $no_hp    = trim($input['no_hp'] ?? '');
    $instansiId = $input['instansi_id'] ?? null;

    if (empty($nama)) sendError('Nama tidak boleh kosong');

    // Cek ganti password
    $passwordClause = '';
    $params = [$nama, $nip ?: null, $no_hp ?: null, $instansiId ?: null];

    if (!empty($input['password_baru'])) {
        if (empty($input['password_lama'])) sendError('Password lama wajib diisi untuk mengganti password');

        // Verifikasi password lama
        $check = $db->prepare("SELECT password FROM users WHERE id = ?");
        $check->execute([$currentUser['id']]);
        $row = $check->fetch();
        if (!password_verify($input['password_lama'], $row['password'])) {
            sendError('Password lama tidak sesuai', 401);
        }
        if (strlen($input['password_baru']) < 6) sendError('Password baru minimal 6 karakter');

        $passwordClause = ', password = ?';
        $params[] = password_hash($input['password_baru'], PASSWORD_BCRYPT);
    }

    $fotoClause = '';
    if (!empty($input['foto'])) {
        $fotoClause = ', foto = ?';
        $params[] = $input['foto'];
    }

    $params[] = $currentUser['id'];
    $stmt = $db->prepare("
        UPDATE users SET nama = ?, nip = ?, no_hp = ?, instansi_id = ?
        $passwordClause $fotoClause, updated_at = NOW()
        WHERE id = ?
    ");
    $stmt->execute($params);

    // Update session
    $_SESSION['user_nama'] = $nama;

    sendSuccess(null, 'Profil berhasil diperbarui');
}

sendError('Method tidak diizinkan', 405);
