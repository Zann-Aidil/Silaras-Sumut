<?php
// =====================================================
// SILARAS - Middleware: Cek Autentikasi (Session)
// =====================================================

require_once __DIR__ . '/../helpers/response.php';

function requireAuth(): array {
    if (!isset($_SESSION['user_id'])) {
        sendError('Sesi tidak valid. Silakan login terlebih dahulu.', 401);
    }
    return [
        'id'         => $_SESSION['user_id'],
        'nama'       => $_SESSION['user_nama'],
        'email'      => $_SESSION['user_email'],
        'role'       => $_SESSION['user_role'],
        'instansi_id'=> $_SESSION['user_instansi_id'] ?? null,
    ];
}

function requireAdmin(): array {
    $user = requireAuth();
    if ($user['role'] !== 'admin') {
        sendError('Akses ditolak. Hanya admin yang dapat mengakses fitur ini.', 403);
    }
    return $user;
}
