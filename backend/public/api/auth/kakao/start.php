<?php

declare(strict_types=1);

require_once __DIR__ . '/../../_bootstrap.php';

bdRequireConfig('customer_auth.php');
bdRequireConfig('kakao_oauth.php');

bdStartCustomerSession();

$clientId = bdKakaoEnv('KAKAO_CLIENT_ID');
$redirectUri = bdKakaoEnv('KAKAO_REDIRECT_URI');

if ($clientId === '' || $redirectUri === '') {
    http_response_code(500);
    echo 'Kakao OAuth 설정이 없습니다. KAKAO_CLIENT_ID / KAKAO_REDIRECT_URI를 확인해주세요.';
    exit;
}

$state = bdKakaoCreateState();

$_SESSION['kakao_oauth_state'] = $state;
$_SESSION['kakao_oauth_state_created_at'] = time();

$params = [
    'client_id' => $clientId,
    'redirect_uri' => $redirectUri,
    'response_type' => 'code',
    'state' => $state,
    'prompt' => 'select_account',
];

$authUrl = 'https://kauth.kakao.com/oauth/authorize?' . http_build_query($params);

header('Location: ' . $authUrl, true, 302);
exit;