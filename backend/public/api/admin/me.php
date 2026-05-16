<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../config/admin_guard.php';

applyAdminCorsHeaders();
header('Access-Control-Allow-Methods: GET, OPTIONS');

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

$loggedIn = isAdminLoggedIn();

sendJsonResponse(200, [
    'success' => true,
    'loggedIn' => $loggedIn,
    'sessionExpiresInSeconds' => $loggedIn
        ? getAdminSessionLifetimeSeconds()
        : 0,
]);