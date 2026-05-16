<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../config/admin.php';
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

if ($attemptStatus['locked'] === true) {
    sendJsonResponse(423, [
        'success' => false,
        'locked' => true,
        'unlockCodeExpired' => $attemptStatus['unlockCodeExpired'],
        'unlockCodeRemainingSeconds' => $attemptStatus['unlockCodeRemainingSeconds'],
        'message' => $attemptStatus['unlockCodeExpired']
            ? '관리자 로그인이 잠겨 있습니다. 잠금 해제 코드가 만료되었습니다.'
            : '관리자 로그인이 잠겨 있습니다. 이메일로 발송된 잠금 해제 코드를 입력해주세요.',
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

$password = (string)($data['password'] ?? '');

if ($password === '') {
    sendJsonResponse(422, [
        'success' => false,
        'message' => '관리자 비밀번호를 입력해주세요.',
    ]);
}

if (!verifyAdminPassword($password)) {
    $failureStatus = recordAdminLoginFailure();

    if ($failureStatus['locked'] === true) {
        if (($failureStatus['lockJustCreated'] ?? false) === true && ($failureStatus['unlockCode'] ?? null) !== null) {
            sendAdminUnlockCodeEmail([
                'unlock_code' => $failureStatus['unlockCode'],
                'occurred_at' => date('Y-m-d H:i:s'),
                'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '-',
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '-',
                'failed_count' => getAdminLoginMaxAttempts(),
                'expires_at' => date('Y-m-d H:i:s', time() + getAdminUnlockCodeExpiresSeconds()),
            ]);
        }

        sendJsonResponse(423, [
            'success' => false,
            'locked' => true,
            'unlockCodeRemainingSeconds' => $failureStatus['unlockCodeRemainingSeconds'],
            'message' => '비밀번호를 여러 번 잘못 입력했습니다. 이메일로 발송된 잠금 해제 코드를 입력해주세요.',
        ]);
    }

    sendJsonResponse(401, [
        'success' => false,
        'locked' => false,
        'message' => '관리자 비밀번호가 올바르지 않습니다. 남은 시도 횟수: ' . $failureStatus['remainingAttempts'] . '회',
        'remainingAttempts' => $failureStatus['remainingAttempts'],
    ]);
}

clearAdminLoginFailures();
markAdminLoggedIn();

sendJsonResponse(200, [
    'success' => true,
    'message' => '관리자 로그인이 완료되었습니다.',
]);