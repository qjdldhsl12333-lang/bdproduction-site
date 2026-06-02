<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../config/db.php';
require_once __DIR__ . '/../../../config/customer_auth.php';

bdHandleCustomerCors();
bdStartCustomerSession();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    bdSendJson([
        'success' => false,
        'message' => 'GET 요청만 지원합니다.',
    ], 405);
}

$userId = (int) ($_SESSION['customer_user_id'] ?? 0);

if ($userId <= 0) {
    bdSendJson([
        'success' => false,
        'message' => '로그인이 필요합니다.',
    ], 401);
}

try {
    $pdo = getDatabaseConnection();

    $userStatement = $pdo->prepare(
        'SELECT id, email
         FROM users
         WHERE id = :id AND is_active = 1
         LIMIT 1'
    );
    $userStatement->execute([':id' => $userId]);
    $user = $userStatement->fetch();

    if (!$user) {
        unset($_SESSION['customer_user_id']);

        bdSendJson([
            'success' => false,
            'message' => '회원 정보를 확인하지 못했습니다. 다시 로그인해주세요.',
        ], 401);
    }

    $statement = $pdo->prepare(
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
            created_at,
            updated_at
         FROM contacts
         WHERE user_id = :user_id
         ORDER BY id DESC
         LIMIT 100'
    );

    $statement->execute([
        ':user_id' => $userId,
    ]);

    $contacts = array_map('formatCustomerContact', $statement->fetchAll());

    bdSendJson([
        'success' => true,
        'contacts' => $contacts,
    ]);
} catch (PDOException $error) {
    error_log('[BDPRODUCTION Customer Contacts DB Error] ' . $error->getMessage());

    bdSendJson([
        'success' => false,
        'message' => '문의 내역을 불러오지 못했습니다.',
    ], 500);
} catch (Throwable $error) {
    error_log('[BDPRODUCTION Customer Contacts Error] ' . $error->getMessage());

    bdSendJson([
        'success' => false,
        'message' => '알 수 없는 서버 오류가 발생했습니다.',
    ], 500);
}

function formatCustomerContact(array $contact): array
{
    return [
        'id' => (int) $contact['id'],
        'name' => (string) ($contact['name'] ?? ''),
        'phone' => $contact['phone'] ?? null,
        'email' => $contact['email'] ?? null,
        'productionType' => $contact['production_type'] ?? null,
        'budgetRange' => $contact['budget_range'] ?? null,
        'message' => (string) ($contact['message'] ?? ''),
        'status' => (string) ($contact['status'] ?? 'new'),
        'source' => (string) ($contact['source'] ?? 'website'),
        'createdAt' => $contact['created_at'] ?? null,
        'updatedAt' => $contact['updated_at'] ?? null,
    ];
}
