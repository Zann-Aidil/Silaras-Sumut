<?php
// =====================================================
// SILARAS - Permohonan: List
// GET /api/permohonan/index.php
// Query params: page, per_page, status, prioritas, jenis_layanan_id,
//               search, date_from, date_to, user_id (admin only)
// =====================================================

require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') sendError('Method tidak diizinkan', 405);

$currentUser = requireAuth();
$db = getDB();

// Pagination
$page    = max(1, (int)($_GET['page'] ?? 1));
$perPage = min(100, max(1, (int)($_GET['per_page'] ?? 10)));
$offset  = ($page - 1) * $perPage;

// Filters
$search         = trim($_GET['search'] ?? '');
$status         = $_GET['status'] ?? '';
$prioritas      = $_GET['prioritas'] ?? '';
$jenisLayananId = $_GET['jenis_layanan_id'] ?? '';
$dateFrom       = $_GET['date_from'] ?? '';
$dateTo         = $_GET['date_to'] ?? '';

$where = ['1=1'];
$params = [];

// User hanya lihat milik sendiri, Admin bisa filter by user_id
if ($currentUser['role'] === 'user') {
    $where[] = 'p.user_id = ?';
    $params[] = $currentUser['id'];
} elseif (!empty($_GET['user_id'])) {
    $where[] = 'p.user_id = ?';
    $params[] = (int)$_GET['user_id'];
}

if (!empty($search)) {
    $where[] = '(p.kode_tiket LIKE ? OR u.nama LIKE ? OR jl.nama_layanan LIKE ?)';
    $like = "%$search%";
    $params = array_merge($params, [$like, $like, $like]);
}
if (!empty($status))         { $where[] = 'p.status = ?';             $params[] = $status; }
if (!empty($prioritas))      { $where[] = 'p.prioritas = ?';          $params[] = $prioritas; }
if (!empty($jenisLayananId)) { $where[] = 'p.jenis_layanan_id = ?';   $params[] = (int)$jenisLayananId; }
if (!empty($dateFrom))       { $where[] = 'DATE(p.created_at) >= ?';  $params[] = $dateFrom; }
if (!empty($dateTo))         { $where[] = 'DATE(p.created_at) <= ?';  $params[] = $dateTo; }

$whereStr = implode(' AND ', $where);

// Count total
$countStmt = $db->prepare("
    SELECT COUNT(*) FROM permohonan p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN jenis_layanan jl ON p.jenis_layanan_id = jl.id
    WHERE $whereStr
");
$countStmt->execute($params);
$total = (int)$countStmt->fetchColumn();

// Ambil data
$dataStmt = $db->prepare("
    SELECT 
        p.id, p.kode_tiket, p.prioritas, p.status, p.lampiran,
        p.catatan_admin, p.dokumen_hasil, p.tanggal_selesai,
        p.created_at, p.updated_at,
        u.id AS user_id, u.nama AS nama_pemohon, u.nip,
        i.nama_instansi, i.singkatan AS singkatan_instansi,
        jl.id AS jenis_layanan_id, jl.nama_layanan, jl.estimasi_waktu,
        adm.nama AS nama_admin
    FROM permohonan p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN instansi i ON u.instansi_id = i.id
    LEFT JOIN jenis_layanan jl ON p.jenis_layanan_id = jl.id
    LEFT JOIN users adm ON p.ditangani_oleh = adm.id
    WHERE $whereStr
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
");
$dataStmt->execute(array_merge($params, [$perPage, $offset]));
$data = $dataStmt->fetchAll();

sendPaginated($data, $total, $page, $perPage);
