<?php
// =====================================================
// SILARAS - Helper: File Upload Handler
// =====================================================

define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('LAMPIRAN_DIR', UPLOAD_DIR . 'lampiran/');
define('HASIL_DIR', UPLOAD_DIR . 'hasil/');
define('FOTO_DIR', UPLOAD_DIR . 'foto/');
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB

$allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'text/plain',
];

function ensureUploadDirs(): void {
    $dirs = [UPLOAD_DIR, LAMPIRAN_DIR, HASIL_DIR, FOTO_DIR];
    foreach ($dirs as $dir) {
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
    }
}

function uploadFile(array $file, string $targetDir, array $allowedTypes = []): array {
    ensureUploadDirs();
    global $allowedMimeTypes;

    if ($file['error'] !== UPLOAD_ERR_OK) {
        return ['success' => false, 'message' => getUploadError($file['error'])];
    }

    if ($file['size'] > MAX_FILE_SIZE) {
        return ['success' => false, 'message' => 'Ukuran file melebihi batas maksimal 5MB'];
    }

    $allowedCheck = !empty($allowedTypes) ? $allowedTypes : $allowedMimeTypes;
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, $allowedCheck)) {
        return ['success' => false, 'message' => 'Tipe file tidak diizinkan'];
    }

    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $newFilename = uniqid('', true) . '_' . time() . '.' . $ext;
    $targetPath = $targetDir . $newFilename;

    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        return ['success' => false, 'message' => 'Gagal menyimpan file'];
    }

    return [
        'success'   => true,
        'filename'  => $newFilename,
        'original'  => $file['name'],
        'size'      => $file['size'],
        'mime_type' => $mimeType,
    ];
}

function deleteFile(string $filepath): bool {
    if (file_exists($filepath)) {
        return unlink($filepath);
    }
    return false;
}

function getUploadError(int $code): string {
    $errors = [
        UPLOAD_ERR_INI_SIZE   => 'File terlalu besar (melebihi php.ini upload_max_filesize)',
        UPLOAD_ERR_FORM_SIZE  => 'File terlalu besar',
        UPLOAD_ERR_PARTIAL    => 'File hanya terupload sebagian',
        UPLOAD_ERR_NO_FILE    => 'Tidak ada file yang diupload',
        UPLOAD_ERR_NO_TMP_DIR => 'Folder sementara tidak ditemukan',
        UPLOAD_ERR_CANT_WRITE => 'Gagal menulis file ke disk',
        UPLOAD_ERR_EXTENSION  => 'Upload dihentikan oleh ekstensi PHP',
    ];
    return $errors[$code] ?? 'Error upload tidak diketahui';
}
