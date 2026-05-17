<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/mailer.php';
require_once __DIR__ . '/../../config/notion.php';

applyCorsHeaders(['POST', 'OPTIONS'], false);

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

$name = trim((string) ($data['name'] ?? ''));
$phone = trim((string) ($data['phone'] ?? ''));
$email = trim((string) ($data['email'] ?? ''));
$productionType = trim((string) ($data['productionType'] ?? $data['production_type'] ?? ''));
$budgetRange = trim((string) ($data['budget'] ?? $data['budget_range'] ?? ''));
$message = trim((string) ($data['message'] ?? ''));

$errors = [];

if ($name === '') {
    $errors['name'] = '이름 또는 회사명을 입력해주세요.';
}

if ($phone === '') {
    $errors['phone'] = '연락처를 입력해주세요.';
}

if ($message === '') {
    $errors['message'] = '문의 내용을 입력해주세요.';
}

if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = '이메일 형식이 올바르지 않습니다.';
}

if (mb_strlen($name) > 100) {
    $errors['name'] = '이름 또는 회사명은 100자 이하로 입력해주세요.';
}

if (mb_strlen($phone) > 50) {
    $errors['phone'] = '연락처는 50자 이하로 입력해주세요.';
}

if (mb_strlen($email) > 150) {
    $errors['email'] = '이메일은 150자 이하로 입력해주세요.';
}

if ($errors !== []) {
    sendJsonResponse(422, [
        'success' => false,
        'message' => '입력값을 확인해주세요.',
        'errors' => $errors,
    ]);
}

try {
    $pdo = getDatabaseConnection();

    $statement = $pdo->prepare(
        'INSERT INTO contacts (
            name,
            phone,
            email,
            production_type,
            budget_range,
            message,
            status,
            source,
            ip_address,
            user_agent
        ) VALUES (
            :name,
            :phone,
            :email,
            :production_type,
            :budget_range,
            :message,
            :status,
            :source,
            :ip_address,
            :user_agent
        )'
    );

    $statement->execute([
        ':name' => $name,
        ':phone' => $phone,
        ':email' => $email !== '' ? $email : null,
        ':production_type' => $productionType !== '' ? $productionType : null,
        ':budget_range' => $budgetRange !== '' ? $budgetRange : null,
        ':message' => $message,
        ':status' => 'new',
        ':source' => 'website',
        ':ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
        ':user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null,
    ]);

    $contactId = (int) $pdo->lastInsertId();

    // Send contact notification email
    $contact = [
        'id' => $contactId,
        'name' => $name,
        'phone' => $phone,
        'email' => $email,
        'production_type' => $productionType,
        'budget_range' => $budgetRange,
        'message' => $message,
        'status' => 'new',
        'source' => 'website',
        'created_at' => date('Y-m-d H:i:s'),
    ];

    $contactPayload = [
    'id' => $contactId,
    'name' => $name,
    'phone' => $phone,
    'email' => $email !== '' ? $email : null,
    'production_type' => $productionType !== '' ? $productionType : null,
    'budget_range' => $budgetRange !== '' ? $budgetRange : null,
    'message' => $message,
    'status' => 'new',
    'source' => 'website',
    'created_at' => date('Y-m-d H:i:s'),
];

$mailResult = sendContactNotificationEmail($contactPayload);
$notionResult = sendContactToNotion($contactPayload);

sendJsonResponse(201, [
    'success' => true,
    'message' => '문의가 정상적으로 접수되었습니다.',
    'contactId' => $contactId,
    'mailStatus' => $mailResult['status'] ?? 'unknown',
    'notionStatus' => $notionResult['status'] ?? 'unknown',
]);

} catch (PDOException $error) {
    error_log('[BDPRODUCTION Contact API DB Error] ' . $error->getMessage());

    sendJsonResponse(500, [
        'success' => false,
        'message' => '서버에서 문의를 저장하지 못했습니다. 잠시 후 다시 시도해주세요.',
    ]);
    
} catch (Throwable $error) {
    error_log('[BDPRODUCTION Contact API Error] ' . $error->getMessage());

    sendJsonResponse(500, [
        'success' => false,
        'message' => '알 수 없는 서버 오류가 발생했습니다.',
    ]);
}

function sendJsonResponse(int $statusCode, array $payload): void
{
    http_response_code($statusCode);

    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    exit;
}