<?php
// =====================================================
// SILARAS - Laporan & Rekap (Admin)
// GET /api/laporan/index.php?type=...&date_from=...&date_to=...
// type: summary | by_status | by_layanan | by_instansi | by_period
// =====================================================

require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') sendError('Method tidak diizinkan', 405);

requireAdmin();
$db = getDB();

$type     = $_GET['type'] ?? 'summary';
$dateFrom = $_GET['date_from'] ?? date('Y-m-01'); // Awal bulan ini
$dateTo   = $_GET['date_to']   ?? date('Y-m-d');   // Hari ini

$dateFilter  = "DATE(p.created_at) BETWEEN ? AND ?";
$dateParams  = [$dateFrom, $dateTo];

switch ($type) {

    case 'summary':
        // Ringkasan statistik utama
        $stmt = $db->query("
            SELECT
                COUNT(*) AS total,
                SUM(status = 'Pending') AS pending,
                SUM(status = 'Diproses') AS diproses,
                SUM(status = 'Selesai') AS selesai,
                SUM(status = 'Ditolak') AS ditolak,
                SUM(prioritas = 'Tinggi') AS prioritas_tinggi,
                SUM(prioritas = 'Sedang') AS prioritas_sedang,
                SUM(prioritas = 'Rendah') AS prioritas_rendah
            FROM permohonan
        ");
        sendSuccess($stmt->fetch());

    case 'by_status':
        $stmt = $db->prepare("
            SELECT status, COUNT(*) AS jumlah
            FROM permohonan p
            WHERE $dateFilter
            GROUP BY status
            ORDER BY FIELD(status, 'Pending','Diproses','Selesai','Ditolak')
        ");
        $stmt->execute($dateParams);
        sendSuccess($stmt->fetchAll());

    case 'by_layanan':
        $stmt = $db->prepare("
            SELECT jl.nama_layanan, COUNT(p.id) AS jumlah,
                   SUM(p.status = 'Selesai') AS selesai,
                   SUM(p.status = 'Pending') AS pending
            FROM permohonan p
            JOIN jenis_layanan jl ON p.jenis_layanan_id = jl.id
            WHERE $dateFilter
            GROUP BY jl.id, jl.nama_layanan
            ORDER BY jumlah DESC
        ");
        $stmt->execute($dateParams);
        sendSuccess($stmt->fetchAll());

    case 'by_instansi':
        $stmt = $db->prepare("
            SELECT i.nama_instansi, i.singkatan, COUNT(p.id) AS jumlah,
                   SUM(p.status = 'Selesai') AS selesai
            FROM permohonan p
            JOIN users u ON p.user_id = u.id
            JOIN instansi i ON u.instansi_id = i.id
            WHERE $dateFilter
            GROUP BY i.id, i.nama_instansi, i.singkatan
            ORDER BY jumlah DESC
        ");
        $stmt->execute($dateParams);
        sendSuccess($stmt->fetchAll());

    case 'by_period':
        // Per bulan dalam rentang tanggal
        $stmt = $db->prepare("
            SELECT DATE_FORMAT(created_at, '%Y-%m') AS bulan,
                   DATE_FORMAT(created_at, '%b %Y') AS label,
                   COUNT(*) AS total,
                   SUM(status = 'Selesai') AS selesai,
                   SUM(status = 'Pending') AS pending,
                   SUM(status = 'Diproses') AS diproses,
                   SUM(status = 'Ditolak') AS ditolak
            FROM permohonan p
            WHERE $dateFilter
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY bulan ASC
        ");
        $stmt->execute($dateParams);
        sendSuccess($stmt->fetchAll());

    case 'detail':
        // Data lengkap untuk export PDF
        $page    = max(1, (int)($_GET['page'] ?? 1));
        $perPage = min(500, (int)($_GET['per_page'] ?? 100));
        $offset  = ($page - 1) * $perPage;

        $status     = $_GET['status'] ?? '';
        $instansiId = $_GET['instansi_id'] ?? '';

        $extraWhere = [];
        $extraParams = [];
        if (!empty($status))     { $extraWhere[] = "p.status = ?";              $extraParams[] = $status; }
        if (!empty($instansiId)) { $extraWhere[] = "u.instansi_id = ?";         $extraParams[] = (int)$instansiId; }

        $extraWhereStr = !empty($extraWhere) ? ' AND ' . implode(' AND ', $extraWhere) : '';

        $countStmt = $db->prepare("
            SELECT COUNT(*) FROM permohonan p
            JOIN users u ON p.user_id = u.id
            WHERE $dateFilter $extraWhereStr
        ");
        $countStmt->execute(array_merge($dateParams, $extraParams));
        $total = (int)$countStmt->fetchColumn();

        $dataStmt = $db->prepare("
            SELECT p.kode_tiket, p.prioritas, p.status, p.created_at, p.tanggal_selesai,
                   u.nama AS nama_pemohon, u.nip,
                   i.nama_instansi, i.singkatan,
                   jl.nama_layanan,
                   adm.nama AS ditangani_oleh
            FROM permohonan p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN instansi i ON u.instansi_id = i.id
            JOIN jenis_layanan jl ON p.jenis_layanan_id = jl.id
            LEFT JOIN users adm ON p.ditangani_oleh = adm.id
            WHERE $dateFilter $extraWhereStr
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        ");
        $dataStmt->execute(array_merge($dateParams, $extraParams, [$perPage, $offset]));
        sendPaginated($dataStmt->fetchAll(), $total, $page, $perPage);

    default:
        sendError('Tipe laporan tidak valid');
}
