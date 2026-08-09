<?php
// =====================================================
// SILARAS - Helper: Standard JSON Response
// =====================================================

function sendResponse(bool $success, $data = null, string $message = '', int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json');
    $response = [
        'success' => $success,
        'message' => $message,
    ];
    if ($data !== null) {
        $response['data'] = $data;
    }
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

function sendSuccess($data = null, string $message = 'Berhasil', int $code = 200): void {
    sendResponse(true, $data, $message, $code);
}

function sendError(string $message = 'Terjadi kesalahan', int $code = 400): void {
    sendResponse(false, null, $message, $code);
}

function sendPaginated(array $data, int $total, int $page, int $perPage): void {
    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode([
        'success'     => true,
        'data'        => $data,
        'pagination'  => [
            'total'        => $total,
            'per_page'     => $perPage,
            'current_page' => $page,
            'last_page'    => (int) ceil($total / $perPage),
        ],
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}
