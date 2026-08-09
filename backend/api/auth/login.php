<?php
// =====================================================
// SILARAS - Auth: Login
// POST /api/auth/login.php
// =====================================================

require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/logger.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method tidak diizinkan', 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$email    = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if (empty($email) || empty($password)) {
    sendError('Email dan password wajib diisi');
}

$db = getDB();
$stmt = $db->prepare("
    SELECT u.*, i.nama_instansi
    FROM users u
    LEFT JOIN instansi i ON u.instansi_id = i.id
    WHERE u.email = ? AND u.status = 'aktif'
    LIMIT 1
");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password'])) {
    sendError('Email atau password salah', 401);
}

// Buat session
session_regenerate_id(true);
$_SESSION['user_id']         = $user['id'];
$_SESSION['user_nama']       = $user['nama'];
$_SESSION['user_email']      = $user['email'];
$_SESSION['user_role']       = $user['role'];
$_SESSION['user_instansi_id']= $user['instansi_id'];

// Log aktivitas
logActivity($db, $user['id'], 'LOGIN', 'Login berhasil dari ' . ($_SERVER['REMOTE_ADDR'] ?? ''));

sendSuccess([
    'id'           => $user['id'],
    'nama'         => $user['nama'],
    'nip'          => $user['nip'],
    'email'        => $user['email'],
    'no_hp'        => $user['no_hp'],
    'instansi_id'  => $user['instansi_id'],
    'nama_instansi'=> $user['nama_instansi'],
    'role'         => $user['role'],
    'foto'         => $user['foto'],
], 'Login berhasil');
