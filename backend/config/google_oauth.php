<?php

declare(strict_types=1);

require_once __DIR__ . '/env.php';

function bdGoogleEnv(string $key): string
{
    return trim((string) envValue($key, ''));
}
