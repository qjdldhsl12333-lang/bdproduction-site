<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../config/db.php';
require_once __DIR__ . '/../../../config/admin_guard.php';

applyAdminCorsHeaders();
header('Access-Control-Allow-Methods: GET, OPTIONS');

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

header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJsonResponse(405, [
        'success' => false,
        'message' => 'GET 요청만 허용됩니다.',
    ]);
}

try {
    $pdo = getDatabaseConnection();

    $statement = $pdo->query(
        'SELECT
            id,
            name,
            phone,
            email,
            production_type,
            budget_range,
            message,
            status,
            source,
            ip_address,
            user_agent,
            created_at,
            updated_at
        FROM contacts
        WHERE status != "archived"
        ORDER BY id DESC
        LIMIT 100'
    );

    $contacts = $statement->fetchAll();

    sendJsonResponse(200, [
        'success' => true,
        'contacts' => $contacts,
    ]);
} catch (PDOException $error) {
    error_log('[BDPRODUCTION Admin Contacts API DB Error] ' . $error->getMessage());

    sendJsonResponse(500, [
        'success' => false,
        'message' => '문의 목록을 불러오지 못했습니다.',
    ]);
} catch (Throwable $error) {
    error_log('[BDPRODUCTION Admin Contacts API Error] ' . $error->getMessage());

    sendJsonResponse(500, [
        'success' => false,
        'message' => '알 수 없는 서버 오류가 발생했습니다.',
    ]);
}