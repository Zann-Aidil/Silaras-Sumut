<?php
// =====================================================
// SILARAS - Helper: Log Aktivitas
// =====================================================

function logActivity(PDO $db, ?int $userId, string $aksi, string $detail): void {
    try {
        $ip = $_SERVER['REMOTE_ADDR'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? 'unknown';
        $stmt = $db->prepare("
            INSERT INTO log_aktivitas (user_id, aksi, detail, ip_address, waktu)
            VALUES (?, ?, ?, ?, NOW())
        ");
        $stmt->execute([$userId, $aksi, $detail, $ip]);
    } catch (Exception $e) {
        // Silent fail — log tidak boleh hentikan eksekusi utama
    }
}
