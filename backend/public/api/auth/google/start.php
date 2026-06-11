<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../../config/customer_auth.php';
require_once __DIR__ . '/../../../../config/env.php';

bdStartCustomerSession();

$clientId = trim((string) envValue('GOOGLE_CLIENT_ID', ''));
$redirectUri = trim((string) envValue('GOOGLE_REDIRECT_URI', ''));

if ($clientId === '' || $redirectUri === '') {
    http_response_code(500);
    echo 'Google OAuth is not configured.';
    exit;
}

$state = md