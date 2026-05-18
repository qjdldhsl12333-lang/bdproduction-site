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

$name = trim((string) ($input['name'] ?? ''));
$company = trim((string) ($input['company'] ?? ''));
$phone = trim((string) ($input['phone'] ?? ''));
$email = bdNormalizeEmail($input['email'] ?? '');
$password = (string) ($input['password'] ?? '');
$passwordConfirm = (string) ($input['passwordConfirm'] ?? '');
$agreed = (bool) ($input['agreed'] ?? false);

if ($name === '') {
    bdSendJson(['success' => false, 'message' => '이름을 입력해주세요.'], 422);
}

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    bdSendJson(['success' => false, 'message' => '올바른 이메일을 입력해주세요.'], 422);
}

if (mb_strlen($password, 'UTF-8') < 8) {
    bdSendJson(['success' => false, 'message' => '비밀번호는 8자 이상 입력해주세요.'], 422);
}

if ($password !== $passwordConfirm) {
    bdSendJson(['success' => false, 'message' => '비밀번호 확인이 일치하지 않습니다.'], 422);
}

if (!$agreed) {
    bdSendJson(['success' => false, 'message' => '회원정보 저장 및 개인정보 수집 동의가 필요합니다.'], 422);
}

try {
    $pdo = getDatabaseConnection();

    $checkStmt = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
    $checkStmt->execute(['email' => $email]);

    if ($checkStmt->fetch()) {
        bdSendJson(['success' => false, 'message' => '이미 가입된 이메일입니다.'], 409);
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare(
        'INSERT INTO users
          (name, company, phone, email, password_hash, provider, role, agreed_at, created_at, updated_at)
         VALUES
          (:name, :company, :phone, :email, :password_hash, :provider, :role, NOW(), NOW(), NOW())'
    );

    $stmt->execute([
        'name' => $name,
        'company' => $company !== '' ? $company : null,
        'phone' => $phone !== '' ? $phone : null,
        'email' => $email,
        'password_hash' => $passwordHash,
        'provider' => 'local',
        'role' => 'customer',
    ]);

    $userId = (int) $pdo->lastInsertId();

    $userStmt = $pdo->prepare(
        'SELECT id, name, company, phone, email, provider, role, created_at
         FROM users
         WHERE id = :id
         LIMIT 1'
    );
    $userStmt->execute(['id' => $userId]);
    $user = $userStmt->fetch();

    $_SESSION['customer_user_id'] = $userId;

    bdSendJson([
        'success' => true,
        'message' => '회원가입이 완료되었습니다.',
        'user' => bdPublicUser($user),
    ], 201);
} catch (Throwable $error) {
    error_log('Customer register error: ' . $error->getMessage());

    bdSendJson([
        'success' => false,
        'message' => '회원가입 처리 중 서버 오류가 발생했습니다.',
    ], 500);
}
