<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../config/admin_guard.php';

applyAdminCorsHeaders();
header('Access-Control-Allow-Methods: POST, OPTIONS');

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

clearAdminSession();

sendJsonResponse(200, [
    'success' => true,
    'message' => '로그아웃되었습니다.',
]);