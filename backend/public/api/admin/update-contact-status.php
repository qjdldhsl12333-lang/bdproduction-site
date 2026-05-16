<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../config/db.php';
require_once __DIR__ . '/../../../config/admin_guard.php';

applyAdminCorsHeaders();
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

requireAdminLogin();

$allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(405, [
        'success' => false,
        'message' => 'POST 요청만 허용됩니다.',
    ]);
}

$rawBody = file_get_contents('php://input');
$data = json_decode($rawBody, true);

if (!is_array($data)) {
    sendJsonResponse(400, [
        'success' => false,
        'message' => '요청 데이터 형식이 올바르지 않습니다.',
    ]);
}

$contactId = (int)($data['id'] ?? 0);
$status = trim((string)($data['status'] ?? ''));

$allowedStatuses = ['new', 'checked', 'done', 'archived'];

if ($contactId <= 0) {
    sendJsonResponse(422, [
        'success' => false,
        'message' => '문의 ID가 올바르지 않습니다.',
    ]);
}

if (!in_array($status, $allowedStatuses, true)) {
    sendJsonResponse(422, [
        'success' => false,
        'message' => '상태값이 올바르지 않습니다.',
    ]);
}

try {
    $pdo = getDatabaseConnection();

    $statement = $pdo->prepare(
        'UPDATE contacts
         SET status = :status
         WHERE id = :id'
    );

    $statement->execute([
        ':status' => $status,
        ':id' => $contactId,
    ]);

    if ($statement->rowCount() === 0) {
        sendJsonResponse(404, [
            'success' => false,
            'message' => '해당 문의를 찾을 수 없거나 이미 같은 상태입니다.',
        ]);
    }

    sendJsonResponse(200, [
        'success' => true,
        'message' => '문의 상태가 변경되었습니다.',
        'contactId' => $contactId,
        'status' => $status,
    ]);
} catch (PDOException $error) {
    error_log('[BDPRODUCTION Update Contact Status DB Error] ' . $error->getMessage());

    sendJsonResponse(500, [
        'success' => false,
        'message' => '문의 상태를 변경하지 못했습니다.',
    ]);
} catch (Throwable $error) {
    error_log('[BDPRODUCTION Update Contact Status Error] ' . $error->getMessage());

    sendJsonResponse(500, [
        'success' => false,
        'message' => '알 수 없는 서버 오류가 발생했습니다.',
    ]);
}
