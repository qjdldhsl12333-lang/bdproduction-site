<?php

declare(strict_types=1);

require_once __DIR__ . '/env.php';

function bdGoogleOAuthConfig(): array
{
    $clientId = trim((string) envValue('GOOGLE_CLIENT_ID', ''));
    $clientSecret = trim((string) envValue('GOOGLE_CLIENT_SECRET', ''));
    $redirectUri = trim((string) envValue('GOOGLE_REDIRECT_URI', ''));

    if ($clientId === '' || $clientSecret === '' || $redirectUri === '') {
        throw new RuntimeException('Google OAuth environment variables are not configured.');
    }

    return [
        'client