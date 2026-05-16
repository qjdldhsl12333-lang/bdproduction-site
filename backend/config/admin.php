<?php

declare(strict_types=1);

require_once __DIR__ . '/env.php';

function getAdminPasswordHash(): string
{
    return (string)envValue('ADMIN_PASSWORD_HASH', '');
}

function getAdminSessionLifetimeSeconds(): int
{
    $lifetime = (int)envValue('ADMIN_SESSION_LIFETIME_SECONDS', '7200');

    if ($lifetime <= 0) {
        return 7200;
    }

    return $lifetime;
}

function getAdminLoginMaxAttempts(): int
{
    $maxAttempts = (int)envValue('ADMIN_LOGIN_MAX_ATTEMPTS', '5');

    if ($maxAttempts <= 0) {
        return 5;
    }

    return $maxAttempts;
}

function getAdminUnlockCodeExpiresSeconds(): int
{
    $expiresSeconds = (int)envValue('ADMIN_UNLOCK_CODE_EXPIRES_SECONDS', '600');

    if ($expiresSeconds <= 0) {
        return 600;
    }

    return $expiresSeconds;
}

function verifyAdminPassword(string $password): bool
{
    $passwordHash = getAdminPasswordHash();

    if ($passwordHash === '') {
        error_log('[BDPRODUCTION Admin Security Error] ADMIN_PASSWORD_HASH is missing.');

        return false;
    }

    return password_verify($password, $passwordHash);
}