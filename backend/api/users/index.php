<?php
// =====================================================
// SILARAS - Users CRUD (Admin Only)
// GET    /api/users/index.php         → list semua user
// POST   /api/users/index.php         → tambah user
// PUT    /api/users/index.php?id=X    → edit user
// DELETE /api/users/index.php?id=X   → nonaktifkan user
// =====================================================

require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/logger.php';
require_once __DIR__ . '/../../middleware/auth.php';

requireAdmin();
$currentUser = requireAuth(); // Already checked admin
$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// ── GET ────────────────────────────────────────────
if ($method === 'GET') {
    $page    = max(1, (int)($_GET['page'] ?? 1));
    $perPage = min(100, (int)($_GET['per_page'] ?? 10));
    $offset  = ($page - 1) * $perPage;
    $search  = trim($_GET['search'] ?? '');
    $role    = $_GET['role'] ?? '';
    $status  = $_GET['status'] ?? '';

    $where = ["u.id != 1"]; // Jangan tampilkan super admin pertama
    $params = [];

    if (!empty($search)) {
        $where[] = "(u.nama LIKE ? OR u.email LIKE ? OR u.nip LIKE ?)";
        $like = "%$search%";
        $params = array_merge($params, [$like, $like, $like]);
    }
    if (!empty($role))   { $where[] = "u.role = ?";   $params[] = $role; }
    if (!empty($status)) { $where[] = "u.status = ?"; $params[] = $status; }

    $whereStr = implode(' AND ', $where);

    $countStmt = $db->prepare("SELECT COUNT(*) FROM users u WHERE $whereStr");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $dataStmt = $db->prepare("
        SELECT u.id, u.nama, u.nip, u.email, u.no_hp, u.role, u.status, u.foto, u.created_at,
               i.nama_instansi, i.singkatan
        FROM users u
        LEFT JOIN instansi i ON u.instansi_id = i.id
        WHERE $whereStr
        ORDER BY u.created_at DESC
        LIMIT ? OFFSET ?
    ");
    $dataStmt->execute(array_merge($params, [$perPage, $offset]));
    $data = $dataStmt->fetchAll();

    sendPaginated($data, $total, $page, $perPage);
}

// ── POST ───────────────────────────────────────────
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    $nama       = trim($input['nama'] ?? '');
    $nip        = trim($input['nip'] ?? '');
    $email      = trim($input['email'] ?? '');
    $password   = $input['password'] ?? '';
    $noHp       = trim($input['no_hp'] ?? '');
    $instansiId = $input['instansi_id'] ?? null;
    $role       = $input['role'] ?? 'user';

    $errors = [];
    if (empty($nama))     $errors[] = 'Nama wajib diisi';
    if (empty($email))    $errors[] = 'Email wajib diisi';
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Format email tidak valid';
    if (empty($password)) $errors[] = 'Password wajib diisi';
    if (!in_array($role, ['user', 'admin'])) $errors[] = 'Role tidak valid';

    if (!empty($errors)) sendError(implode(', ', $errors));

    $check = $db->prepare("SELECT id FROM users WHERE email = ?");
    $check->execute([$email]);
    if ($check->fetch()) sendError('Email sudah terdaftar', 409);

    $stmt = $db->prepare("
        INSERT INTO users (nama, nip, email, password, no_hp, instansi_id, role, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'aktif', NOW())
    ");
    $stmt->execute([$nama, $nip ?: null, $email, password_hash($password, PASSWORD_BCRYPT), $noHp ?: null, $instansiId ?: null, $role]);
    $id = $db->lastInsertId();

    logActivity($db, $currentUser['id'], 'TAMBAH_USER', "User $email ditambahkan oleh admin");
    sendSuccess(['id' => $id], 'User berhasil ditambahkan', 201);
}

// ── PUT ────────────────────────────────────────────
if ($method === 'PUT') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) sendError('ID tidak valid');

    $check = $db->prepare("SELECT * FROM users WHERE id = ?");
    $check->execute([$id]);
    $user = $check->fetch();
    if (!$user) sendError('User tidak ditemukan', 404);

    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $nama       = trim($input['nama'] ?? $user['nama']);
    $nip        = trim($input['nip'] ?? '');
    $noHp       = trim($input['no_hp'] ?? '');
    $instansiId = $input['instansi_id'] ?? $user['instansi_id'];
    $role       = $input['role'] ?? $user['role'];
    $status     = $input['status'] ?? $user['status'];

    if (empty($nama)) sendError('Nama tidak boleh kosong');

    $passwordClause = '';
    $params = [$nama, $nip ?: null, $noHp ?: null, $instansiId ?: null, $role, $status];

    if (!empty($input['password'])) {
        $passwordClause = ', password = ?';
        $params[] = password_hash($input['password'], PASSWORD_BCRYPT);
    }

    $params[] = $id;
    $stmt = $db->prepare("
        UPDATE users SET nama = ?, nip = ?, no_hp = ?, instansi_id = ?, role = ?, status = ?
        $passwordClause, updated_at = NOW()
        WHERE id = ?
    ");
    $stmt->execute($params);

    logActivity($db, $currentUser['id'], 'EDIT_USER', "User ID $id diperbarui");
    sendSuccess(null, 'Data user berhasil diperbarui');
}

// ── DELETE (Nonaktifkan) ───────────────────────────
if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) sendError('ID tidak valid');
    if ($id === $currentUser['id']) sendError('Tidak dapat menonaktifkan akun sendiri');

    $stmt = $db->prepare("UPDATE users SET status = 'nonaktif', updated_at = NOW() WHERE id = ?");
    $stmt->execute([$id]);

    logActivity($db, $currentUser['id'], 'NONAKTIF_USER', "User ID $id dinonaktifkan");
    sendSuccess(null, 'User berhasil dinonaktifkan');
}

sendError('Method tidak diizinkan', 405);
