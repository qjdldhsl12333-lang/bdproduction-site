<?php

declare(strict_types=1);

require_once __DIR__ . '/../../_bootstrap.php';

bdRequireConfig('db.php');
bdRequireConfig('customer_auth.php');
bdRequireConfig('naver_oauth.php');

bdStartCustomerSession();

$clientId = bdNaverEnv('NAVER_CLIENT_ID');
$clientSecret = bdNaverEnv('NAVER_CLIENT_SECRET');
$redirectUri = bdNaverEnv('NAVER_REDIRECT_URI');

if ($clientId === '' || $clientSecret === '' || $redirectUri === '') {
    bdNaverFail('not_configured');
}

$error = trim((string) ($_GET['error'] ?? ''));

if ($error !== '') {
    error_log('Naver OAuth error: ' . $error);
    bdNaverFail('naver_denied');
}

$code = trim((string) ($_GET['code'] ?? ''));
$state = trim((string) ($_GET['state'] ?? ''));

$storedState = (string) ($_SESSION['naver_oauth_state'] ?? '');
$stateCreatedAt = (int) ($_SESSION['naver_oauth_state_created_at'] ?? 0);

unset($_SESSION['naver_oauth_state'], $_SESSION['naver_oauth_state_created_at']);

if ($code === '') {
    bdNaverFail('missing_code');
}

if ($state === '' || $storedState === '' || !hash_equals($storedState, $state)) {
    bdNaverFail('invalid_state');
}

if ($stateCreatedAt <= 0 || time() - $stateCreatedAt > 600) {
    bdNaverFail('expired_state');
}

try {
    $tokenParams = [
        'grant_type' => 'authorization_code',
        'client_id' => $clientId,
        'client_secret' => $clientSecret,
        'code' => $code,
        'state' => $state,
    ];

    $token = bdNaverGetJson('https://nid.naver.com/oauth2.0/token?' . http_build_query($tokenParams), [
        'Accept: application/json',
    ]);

    $accessToken = (string) ($token['access_token'] ?? '');

    if ($accessToken === '') {
        throw new RuntimeException('Naver token 응답에 access_token이 없습니다.');
    }

    $naverUser = bdNaverGetJson('https://openapi.naver.com/v1/nid/me', [
        'Authorization: Bearer ' . $accessToken,
        'Accept: application/json',
    ]);

    $response = is_array($naverUser['response'] ?? null) ? $naverUser['response'] : [];

    $providerUserId = trim((string) ($response['id'] ?? ''));

    if ($providerUserId === '') {
        throw new RuntimeException('Naver userinfo 응답에 id 값이 없습니다.');
    }

    $providerEmail = bdNormalizeEmail($response['email'] ?? '');
    $isEmailUsable = $providerEmail !== '' && filter_var($providerEmail, FILTER_VALIDATE_EMAIL);

    $safeProviderId = preg_replace('/[^A-Za-z0-9_-]/', '', $providerUserId);

    if ($safeProviderId === '') {
        throw new RuntimeException('Naver provider id 값을 계정 식별자로 사용할 수 없습니다.');
    }

    $email = $isEmailUsable
        ? $providerEmail
        : 'naver_' . $safeProviderId . '@social.bdproduction.local';

    $name = trim((string) ($response['name'] ?? ''));

    if ($name === '') {
        $name = trim((string) ($response['nickname'] ?? ''));
    }

    if ($name === '') {
        $name = $isEmailUsable ? explode('@', $providerEmail)[0] : 'Naver User';
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
        'provider' => 'naver',
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
        bdNaverFail('inactive_user');
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
            'provider' => 'naver',
            'role' => 'customer',
        ]);

        $userId = (int) $pdo->lastInsertId();

        $user = [
            'id' => $userId,
            'name' => $name,
            'company' => null,
            'phone' => null,
            'email' => $email,
            'provider' => 'naver',
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
        'provider' => 'naver',
        'provider_user_id' => $providerUserId,
        'provider_email' => $isEmailUsable ? $providerEmail : null,
    ]);

    $pdo->commit();

    session_regenerate_id(true);
    $_SESSION['customer_user_id'] = $userId;

    bdNaverRedirectToFrontend('/mypage', [
        'auth' => 'naver_success',
    ]);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log('Naver OAuth callback error: ' . $error->getMessage());

    bdNaverFail('server_error');
}