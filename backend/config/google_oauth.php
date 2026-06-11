<?php

declare(strict_types=1);

require_once __DIR__ . '/env.php';

function bdGoogleClientId(): string
{
    return trim((string) envValue('GOOGLE_CLIENT_ID', ''));
}

function bdGoogleClientSecret(): string
{
    return trim((string) envValue('GOOGLE_CLIENT_SECRET', ''));
}

function bdGoogleRedirectUri(): string
{
    return trim((string) envValue('GOOGLE_REDIRECT_URI', ''));
}

function bdRequireGoogleOAuthConfig(): void
{
