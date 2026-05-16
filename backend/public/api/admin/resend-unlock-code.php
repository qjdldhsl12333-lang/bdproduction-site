<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../config/admin_guard.php';
require_once __DIR__ . '/../../../config/admin_rate_limit.php';
require_once __DIR__ . '/../../../config/mailer.php';

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

$attemptStatus = getAdminLoginAttemptStatus();

if ($attemptStatus['locked'] !== true) {
    sendJsonResponse(400, [
        'success' => false,
        'message' => '현재 로그인 잠금 상태가 아닙니다.',
    ]);
}

$unlockStatus = createAndStoreNewAdminUnlockCode();

$mailResult = sendAdminUnlockCodeEmail([
    'unlock_code' => $unlockStatus['unlockCode'],
    'occurred_at' => date('Y-m-d H:i:s'),
    'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '-',
    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '-',
    'failed_count' => $unlockStatus['failedCount'],
    'expires_at' => date('Y-m-d H:i:s', $unlockStatus['unlockCodeExpiresAt']),
]);

sendJsonResponse(200, [
    'success' => true,
    'message' => '잠금 해제 코드를 다시 발송했습니다.',
    'mailStatus' => $mailResult['status'] ?? 'unknown',
    'unlockCodeRemainingSeconds' => $unlockStatus['unlockCodeRemainingSeconds'],
]);