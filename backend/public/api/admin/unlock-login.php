<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../config/admin_guard.php';
require_once __DIR__ . '/../../../config/admin_rate_limit.php';

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

$rawBody = file_get_contents('php://input');
$data = json_decode($rawBody, true);

if (!is_array($data)) {
    sendJsonResponse(400, [
        'success' => false,
        'message' => '요청 데이터 형식이 올바르지 않습니다.',
    ]);
}

$unlockCode = trim((string)($data['unlockCode'] ?? ''));

if ($unlockCode === '') {
    sendJsonResponse(422, [
        'success' => false,
        'message' => '잠금 해제 코드를 입력해주세요.',
    ]);
}

$result = verifyAdminUnlockCode($unlockCode);

if (($result['success'] ?? false) !== true) {
    sendJsonResponse(422, [
        'success' => false,
        'message' => $result['message'] ?? '잠금 해제에 실패했습니다.',
        'codeExpired' => $result['codeExpired'] ?? false,
    ]);
}

sendJsonResponse(200, [
    'success' => true,
    'message' => '로그인 잠금이 해제되었습니다. 관리자 비밀번호로 다시 로그인해주세요.',
]);