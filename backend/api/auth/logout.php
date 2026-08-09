<?php
// =====================================================
// SILARAS - Auth: Logout
// POST /api/auth/logout.php
// =====================================================

require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/logger.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method tidak diizinkan', 405);
}

if (isset($_SESSION['user_id'])) {
    $db = getDB();
    logActivity($db, $_SESSION['user_id'], 'LOGOUT', 'Logout dari sistem');
}

$_SESSION = [];
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}
session_destroy();

sendSuccess(null, 'Logout berhasil');
