<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../../config/db.php';
require_once __DIR__ . '/../../../../config/customer_auth.php';
require_once __DIR__ . '/../../../../config/google_oauth.php';

bdStartCustomerSession();

$clientId = bdGoogleEnv('GOOGLE_CLIENT_ID');
$clientSecret = bdGoogleEnv('GOOGLE_CLIENT_SECRET');
$redirectUri = bdGoogleEnv('GOOGLE_REDIRECT_URI');

if ($clientId === '' || $clientSecret === '' || $redirectUri === '') {
    bdGoogleFail('not_configured');
}

$error = trim((string) ($_GET['error'] ?? ''));

if ($error !== '') {
    error_log('Google OAuth error: ' . $error);
    bdGoogleFail('google_denied');
}

$code = trim((string) ($_GET['code'] ?? ''));
$state = trim((string) ($_GET['state'] ?? ''));

$storedState = (string) ($_SESSION['google_oauth_state'] ?? '');
$stateCreatedAt = (int) ($_SESSION['google_oauth_state_created_at'] ?? 0);

unset($_SESSION['google_oauth_state'], $_SESSION['google_oauth_state_created_at']);

if ($code === '') {
    bdGoogleFail('missing_code');
}

if ($state === '' || $storedState === '' || !hash_equals($storedState, $state)) {
    bdGoogleFail('invalid_state');
}

if ($stateCreatedAt <= 0 || time() - $stateCreatedAt > 600) {
    bdGoogleFail('expired_state');
}

try {
    $token = bdGooglePostForm('https://oauth2.googleapis.com/token', [
        'code' => $code,
        'client_id' => $clientId,
        'client_secret' => $clientSecret,
        'redirect_uri' => $redirectUri,
        'grant_type' => 'authorization_code',
    ]);

    $accessToken = (string) ($token['access_token'] ?? '');

    if ($accessToken === '') {
        throw new RuntimeException('Google token 응답에 access_token이 없습니다.');
    }

    $googleUser = bdGoogleGetJson('https://openidconnect.googleapis.com/v1/userinfo', $accessToken);

    $providerUserId = trim((string) ($googleUser['sub'] ?? ''));
    $email = bdNormalizeEmail($googleUser['email'] ?? '');
    $name = trim((string) ($googleUser['name'] ?? ''));
    $emailVerified = $googleUser['email_verified'] ?? false;

    if ($providerUserId === '') {
        throw new RuntimeException('Google userinfo 응답에 sub 값이 없습니다.');
    }

    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new RuntimeException('Google userinfo 응답에 올바른 email 값이 없습니다.');
    }

    if (!($emailVerified === true || $emailVerified === 'true' || $emailVerified === 1 || $emailVerified === '1')) {
        bdGoogleFail('email_not_verified');
    }

    if ($name === '') {
        $name = explode('@', $email)[0] ?: 'Google User';
    }

    $expiresAt = null;

    if (isset($token['expires_in']) && is_numeric($token['expires_in'])) {
        $expiresAt = date('Y-m-d H:i:s', time() + (int) $token['expires_in']);
    }

    $pdo = getDatabaseConnection();
    $pdo->beginTransaction();

    $user = null;

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
        'provider' => 'google',
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
        bdGoogleFail('inactive_user');
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
            'provider' => 'google',
            'role' => 'customer',
        ]);

        $userId = (int) $pdo->lastInsertId();

        $user = [
            'id' => $userId,
            'name' => $name,
            'company' => null,
            'phone' => null,
            'email' => $email,
            'provider' => 'google',
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
            :access_token,
            :refresh_token,
            :token_expires_at
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
        'user_id' => (int) $user['id'],
        'provider' => 'google',
        'provider_user_id' => $providerUserId,
        'provider_email' => $email,
        'access_token' => null,
        'refresh_token' => null,
        'token_expires_at' => null,
    ]);

    $pdo->commit();

    session_regenerate_id(true);
    $_SESSION['customer_user_id'] = (int) $user['id'];

    bdGoogleRedirectToFrontend('/mypage', [
        'auth' => 'google_success',
    ]);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log('Google OAuth callback error: ' . $error->getMessage());

    bdGoogleFail('server_error');
}
