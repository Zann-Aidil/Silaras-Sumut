<?php
// =====================================================
// SILARAS - Instansi Public Endpoint (tanpa auth)
// GET /api/instansi/public.php → list instansi aktif
// Digunakan untuk halaman registrasi publik
// =====================================================

require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method tidak diizinkan', 405);
}

$db = getDB();

$search = trim($_GET['search'] ?? '');
$where  = "WHERE status = 'aktif'";
$params = [];

if (!empty($search)) {
    $where .= " AND (nama_instansi LIKE ? OR singkatan LIKE ?)";
    $params = ["%$search%", "%$search%"];
}

$stmt = $db->prepare("SELECT id, nama_instansi, singkatan FROM instansi $where ORDER BY nama_instansi ASC");
$stmt->execute($params);

sendSuccess($stmt->fetchAll());
