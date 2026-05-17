<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../config/db.php';
require_once __DIR__ . '/../../../config/admin_guard.php';

applyAdminCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

requireAdminLogin();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJsonResponse(405, [
        'success' => false,
        'message' => 'GET 요청만 허용됩니다.',
    ]);
}

$contactId = (int)($_GET['contactId'] ?? 0);

if ($contactId <= 0) {
    sendJsonResponse(422, [
        'success' => false,
        'message' => '문의 ID가 올바르지 않습니다.',
    ]);
}

try {
    $pdo = getDatabaseConnection();

    $contactStatement = $pdo->prepare(
        'SELECT id
         FROM contacts
         WHERE id = :id
         LIMIT 1'
    );

    $contactStatement->execute([
        ':id' => $contactId,
    ]);

    if ($contactStatement->fetch() === false) {
        sendJsonResponse(404, [
            'success' => false,
            'message' => '해당 문의를 찾을 수 없습니다.',
        ]);
    }

    $statement = $pdo->prepare(
        'SELECT
            id,
            contact_id,
            action,
            previous_status,
            next_status,
            note,
            ip_address,
            user_agent,
            created_at
         FROM contact_activity_logs
         WHERE contact_id = :contact_id
         ORDER BY id DESC'
    );

    $statement->execute([
        ':contact_id' => $contactId,
    ]);

    sendJsonResponse(200, [
        'success' => true,
        'logs' => $statement->fetchAll(),
    ]);
} catch (PDOException $error) {
    error_log('[BDPRODUCTION Contact Activity Logs DB Error] ' . $error->getMessage());

    sendJsonResponse(500, [
        'success' => false,
        'message' => '문의 처리 이력을 불러오지 못했습니다.',
    ]);
} catch (Throwable $error) {
    error_log('[BDPRODUCTION Contact Activity Logs Error] ' . $error->getMessage());

    sendJsonResponse(500, [
        'success' => false,
        'message' => '알 수 없는 서버 오류가 발생했습니다.',
    ]);
}
