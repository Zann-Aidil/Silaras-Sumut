<?php
// =====================================================
// SILARAS - Auth: Register
// POST /api/auth/register.php
// =====================================================

require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/logger.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method tidak diizinkan', 405);
}

$input = json_decode(file_get_contents('php://input'), true);

$nama        = trim($input['nama'] ?? '');
$nip         = trim($input['nip'] ?? '');
$email       = trim($input['email'] ?? '');
$password    = $input['password'] ?? '';
$no_hp       = trim($input['no_hp'] ?? '');
$instansi_id = $input['instansi_id'] ?? null;

// Validasi
$errors = [];
if (empty($nama))     $errors[] = 'Nama wajib diisi';
if (empty($email))    $errors[] = 'Email wajib diisi';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Format email tidak valid';
if (empty($password)) $errors[] = 'Password wajib diisi';
if (strlen($password) < 6) $errors[] = 'Password minimal 6 karakter';

if (!empty($errors)) {
    sendError(implode(', ', $errors));
}

$db = getDB();

// Cek email duplikat
$check = $db->prepare("SELECT id FROM users WHERE email = ?");
$check->execute([$email]);
if ($check->fetch()) {
    sendError('Email sudah terdaftar', 409);
}

$hashed = password_hash($password, PASSWORD_BCRYPT);

$stmt = $db->prepare("
    INSERT INTO users (nama, nip, email, password, no_hp, instansi_id, role, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'user', 'aktif', NOW())
");
$stmt->execute([$nama, $nip ?: null, $email, $hashed, $no_hp ?: null, $instansi_id ?: null]);
$userId = $db->lastInsertId();

logActivity($db, $userId, 'REGISTER', 'Akun baru didaftarkan: ' . $email);

sendSuccess(['id' => $userId, 'nama' => $nama, 'email' => $email], 'Registrasi berhasil. Silakan login.', 201);
