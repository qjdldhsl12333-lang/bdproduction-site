<?php

declare(strict_types=1);

function bdIsHttpsRequest(): bool
{
    if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
        return true;
    }

    $forwardedProto = strtolower((string)($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? ''));

    if ($forwardedProto === 'https') {
        return true;
    }

    $forwardedSsl = strtolower((string)($_SERVER['HTTP_X_FORWARDED_SSL'] ?? ''));

    if ($forwardedSsl === 'on') {
        return true;
    }

    $frontEndHttps = strtolower((string)($_SERVER['HTTP_FRONT_END_HTTPS'] ?? ''));

    return $frontEndHttps === 'on';
}