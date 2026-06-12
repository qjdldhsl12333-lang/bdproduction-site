<?php

declare(strict_types=1);

require_once __DIR__ . '/../../_bootstrap.php';

bdRequireConfig('customer_auth.php');
bdRequireConfig('naver_oauth.php');

bdStartCustomerSession();

$clientId = bdNaverEnv('NAVER_CLIENT_ID');
$redirectUri = bdNaverEnv('NAVER_REDIRECT_URI');

if ($clientId === '' || $redirectUri === '') {
    http_response_code(500);
    echo 'Naver OAuth 설정이 없습니다. NAVER_CLIENT_ID / NAVER_REDIRECT_URI를 확인해주세요.';
    exit;
}

$state = bdNaverCreateState();

$_SESSION['naver_oauth_state'] = $state;
$_SESSION['naver_oauth_state_created_at'] = time();

$params = [
    'response_type' => 'code',
    'client_id' => $clientId,
    'redirect_uri' => $redirectUri,
    'state' => $state,
];

$authUrl = 'https://nid.naver.com/oauth2.0/authorize?' . http_build_query($params);

header('Location: ' . $authUrl, true, 302);
exit;