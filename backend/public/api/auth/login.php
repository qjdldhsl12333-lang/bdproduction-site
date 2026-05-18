<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../config/db.php';
require_once __DIR__ . '/../../../config/customer_auth.php';

bdHandleCustomerCors();
bdStartCustomerSession();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    bdSendJson([
        'success' => false,
        'message' => 'POST 요청만 지원합니다.',
    ], 405);
}

$input = bdReadJsonBody();

$email = bdNormalizeEmail($input['email'] ?? '');
$password = (string) ($input['password'] ?? '');

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    bdSendJson(['success' => false, 'message' => '올바른 이메일을 입력해주세요.'], 422);
}

if ($password === '') {
    bdSendJson(['success' => false, 'message' => '비밀번호를 입력해주세요.'], 422);
}

try {
    $pdo = getDatabaseConnection();

    $stmt = $pdo->prepare(
        'SELECT id, name, company, phone, email, password_hash, provider, role, is_active, created_at
         FROM users
         WHERE email = :email
         LIMIT 1'
    );
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch();

    if (!$user || (int) $user['is_active'] !== 1) {
        bdSendJson(['success' => false, 'message' => '이메일 또는 비밀번호가 올바르지 않습니다.'], 401);
    }

    if (($user['provider'] ?? 'local') !== 'local' || empty($user['password_hash'])) {
        bdSendJson(['success' => false, 'message' => '소셜 계정으로 가입된 이메일입니다. 소셜 로그인을 이용해주세요.'], 401);
    }

    if (!password_verify($password, (string) $user['password_hash'])) {
        bdSendJson(['success' => false, 'message' => '이메일 또는 비밀번호가 올바르지 않습니다.'], 401);
    }

    $_SESSION['customer_user_id'] = (int) $user['id'];

    $pdo->prepare('UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = :id')
        ->execute(['id' => (int) $user['id']]);

    bdSendJson([
        'success' => true,
        'message' => '로그인되었습니다.',
        'user' => bdPublicUser($user),
    ]);
} catch (Throwable $error) {
    error_log('Customer login error: ' . $error->getMessage());

    bdSendJson([
        'success' => false,
        'message' => '로그인 처리 중 서버 오류가 발생했습니다.',
    ], 500);
}
