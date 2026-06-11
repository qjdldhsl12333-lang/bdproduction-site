<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../../config/customer_auth.php';
require_once __DIR__ . '/../../../../config/google_oauth.php';

bdStartCustomerSession();

$clientId = bdGoogleEnv('GOOGLE_CLIENT_ID');
$redirectUri = bdGoogleEnv('GOOGLE_REDIRECT_URI');

if ($clientId === '' || $redirectUri === '') {
    http_response_code(500);
    echo 'Google OAuth 설정이 없습니다. GOOGLE_CLIENT_ID / GOOGLE_REDIRECT_URI를 확인해주세요.';
    exit;
}

$state = bdGoogleCreateState();

$_SESSION['google_oauth_state'] = $state;
$_SESSION['google_oauth_state_created_at'] = time();

$params = [
    'client_id' => $clientId,
    'redirect_uri' => $redirectUri,
    'response_type' => 'code',
    'scope' => 'openid email profile',
    'state' => $state,
    'prompt' => 'select_account',
];

$authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query($params);

header('Location: ' . $authUrl, true, 302);
exit;
