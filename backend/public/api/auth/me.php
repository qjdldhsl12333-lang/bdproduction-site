<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../config/db.php';
require_once __DIR__ . '/../../../config/customer_auth.php';

bdHandleCustomerCors();
bdStartCustomerSession();

$userId = (int) ($_SESSION['customer_user_id'] ?? 0);

if ($userId <= 0) {
    bdSendJson([
        'success' => true,
        'authenticated' => false,
        'user' => null,
    ]);
}

try {
    $pdo = getDatabaseConnection();

    $stmt = $pdo->prepare(
        'SELECT id, name, company, phone, email, provider, role, created_at
         FROM users
         WHERE id = :id AND is_active = 1
         LIMIT 1'
    );
    $stmt->execute(['id' => $userId]);
    $user = $stmt->fetch();

    if (!$user) {
        unset($_SESSION['customer_user_id']);

        bdSendJson([
            'success' => true,
            'authenticated' => false,
            'user' => null,
        ]);
    }

    bdSendJson([
        'success' => true,
        'authenticated' => true,
        'user' => bdPublicUser($user),
    ]);
} catch (Throwable $error) {
    error_log('Customer me error: ' . $error->getMessage());

    bdSendJson([
        'success' => false,
        'message' => '회원 정보를 확인하는 중 서버 오류가 발생했습니다.',
    ], 500);
}
