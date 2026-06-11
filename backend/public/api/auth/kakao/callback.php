<?php

declare(strict_types=1);

require_once __DIR__ . '/../../_bootstrap.php';

bdRequireConfig('db.php');
bdRequireConfig('customer_auth.php');
bdRequireConfig('kakao_oauth.php');

bdStartCustomerSession();

$clientId = bdKakaoEnv('KAKAO_CLIENT_ID');
$clientSecret = bdKakaoEnv('KAKAO_CLIENT_SECRET');
$redirectUri = bdKakaoEnv('KAKAO_REDIRECT_URI');

if ($clientId === '' || $redirectUri === '') {
    bdKakaoFail('not_configured');
}

$error = trim((string) ($_GET['error'] ?? ''));

if ($error !== '') {
    error_log('Kakao OAuth error: ' . $error);
    bdKakaoFail('kakao_denied');
}

$code = trim((string) ($_GET['code'] ?? ''));
$state = trim((string) ($_GET['state'] ?? ''));

$storedState = (string) ($_SESSION['kakao_oauth_state'] ?? '');
$stateCreatedAt = (int) ($_SESSION['kakao_oauth_state_created_at'] ?? 0);

unset($_SESSION['kakao_oauth_state'], $_SESSION['kakao_oauth_state_created_at']);

if ($code === '') {
    bdKakaoFail('missing_code');
}

if ($state === '' || $storedState === '' || !hash_equals($storedState, $state)) {
    bdKakaoFail('invalid_state');
}

if ($stateCreatedAt <= 0 || time() - $stateCreatedAt > 600) {
    bdKakaoFail('expired_state');
}

try {
    $tokenPayload = [
        'grant_type' => 'authorization_code',
        'client_id' => $clientId,
        'redirect_uri' => $redirectUri,
        'code' => $code,
    ];

    if ($clientSecret !== '') {
        $tokenPayload['client_secret'] = $clientSecret;
    }

    $token = bdKakaoPostForm('https://kauth.kakao.com/oauth/token', $tokenPayload);
    $accessToken = (string) ($token['access_token'] ?? '');

    if ($accessToken === '') {
        throw new RuntimeException('Kakao token 응답에 access_token이 없습니다.');
    }

    $kakaoUser = bdKakaoGetJson('https://kapi.kakao.com/v2/user/me?secure_resource=true', $accessToken);

    $providerUserId = trim((string) ($kakaoUser['id'] ?? ''));

    if ($providerUserId === '') {
        throw new RuntimeException('Kakao userinfo 응답에 id 값이 없습니다.');
    }

    $kakaoAccount = is_array($kakaoUser['kakao_account'] ?? null) ? $kakaoUser['kakao_account'] : [];
    $profile = is_array($kakaoAccount['profile'] ?? null) ? $kakaoAccount['profile'] : [];
    $properties = is_array($kakaoUser['properties'] ?? null) ? $kakaoUser['properties'] : [];

    $email = bdNormalizeEmail($kakaoAccount['email'] ?? '');
    $isEmailValid = $kakaoAccount['is_email_valid'] ?? true;
    $isEmailVerified = $kakaoAccount['is_email_verified'] ?? true;

    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        bdKakaoFail('email_not_available');
    }

    if (
        !($isEmailValid === true || $isEmailValid === 'true' || $isEmailValid === 1 || $isEmailValid === '1') ||
        !($isEmailVerified === true || $isEmailVerified === 'true' || $isEmailVerified === 1 || $isEmailVerified === '1')
    ) {
        bdKakaoFail('email_not_verified');
    }

    $name = trim((string) ($profile['nickname'] ?? ''));

    if ($name === '') {
        $name = trim((string) ($properties['nickname'] ?? ''));
    }

    if ($name === '') {
        $name = explode('@', $email)[0] ?: 'Kakao User';
    }

    $pdo = getDatabaseConnection();
    $pdo->beginTransaction();

    $socialStmt = $pdo->prepare(
        'SELECT
            u.id,
            u.name,
            u.company,
            u.phone,
            u.email,
            u.provider,
            u.role,
            u.is_active,
            u.created_at
         FROM social_accounts sa
         INNER JOIN users u ON u.id = sa.user_id
         WHERE sa.provider = :provider
           AND sa.provider_user_id = :provider_user_id
         LIMIT 1'
    );

    $socialStmt->execute([
        'provider' => 'kakao',
        'provider_user_id' => $providerUserId,
    ]);

    $user = $socialStmt->fetch();

    if (!$user) {
        $userStmt = $pdo->prepare(
            'SELECT id, name, company, phone, email, provider, role, is_active, created_at
             FROM users
             WHERE email = :email
             LIMIT 1'
        );

        $userStmt->execute(['email' => $email]);
        $user = $userStmt->fetch();
    }

    if ($user && (int) $user['is_active'] !== 1) {
        $pdo->rollBack();
        bdKakaoFail('inactive_user');
    }

    if (!$user) {
        $insertUserStmt = $pdo->prepare(
            'INSERT INTO users (
                name,
                company,
                phone,
                email,
                password_hash,
                provider,
                role,
                is_active,
                agreed_at,
                last_login_at
             ) VALUES (
                :name,
                NULL,
                NULL,
                :email,
                NULL,
                :provider,
                :role,
                1,
                NOW(),
                NOW()
             )'
        );

        $insertUserStmt->execute([
            'name' => $name,
            'email' => $email,
            'provider' => 'kakao',
            'role' => 'customer',
        ]);

        $userId = (int) $pdo->lastInsertId();

        $user = [
            'id' => $userId,
            'name' => $name,
            'company' => null,
            'phone' => null,
            'email' => $email,
            'provider' => 'kakao',
            'role' => 'customer',
            'is_active' => 1,
            'created_at' => date('Y-m-d H:i:s'),
        ];
    } else {
        $userId = (int) $user['id'];

        $pdo->prepare(
            'UPDATE users
             SET last_login_at = NOW(),
                 updated_at = NOW()
             WHERE id = :id'
        )->execute(['id' => $userId]);
    }

    $upsertSocialStmt = $pdo->prepare(
        'INSERT INTO social_accounts (
            user_id,
            provider,
            provider_user_id,
            provider_email,
            access_token,
            refresh_token,
            token_expires_at
         ) VALUES (
            :user_id,
            :provider,
            :provider_user_id,
            :provider_email,
            NULL,
            NULL,
            NULL
         )
         ON DUPLICATE KEY UPDATE
            user_id = VALUES(user_id),
            provider_email = VALUES(provider_email),
            access_token = NULL,
            refresh_token = NULL,
            token_expires_at = NULL,
            updated_at = NOW()'
    );

    $upsertSocialStmt->execute([
        'user_id' => $userId,
        'provider' => 'kakao',
        'provider_user_id' => $providerUserId,
        'provider_email' => $email,
    ]);

    $pdo->commit();

    session_regenerate_id(true);
    $_SESSION['customer_user_id'] = $userId;

    bdKakaoRedirectToFrontend('/mypage', [
        'auth' => 'kakao_success',
    ]);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log('Kakao OAuth callback error: ' . $error->getMessage());

    bdKakaoFail('server_error');
}