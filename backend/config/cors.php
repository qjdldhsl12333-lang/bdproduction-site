<?php

declare(strict_types=1);

require_once __DIR__ . '/env.php';

function getCorsAllowedOrigins(): array
{
    $rawOrigins = (string)envValue(
        'CORS_ALLOWED_ORIGINS',
        'http://localhost:5173,http://127.0.0.1:5173'
    );

    return array_values(array_filter(array_map('trim', explode(',', $rawOrigins))));
}

function applyCorsHeaders(array $methods = ['GET', 'POST', 'OPTIONS'], bool $allowCredentials = false): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowedOrigins = getCorsAllowedOrigins();

    if ($origin !== '' && in_array($origin, $allowedOrigins, true)) {
        header("Access-Control-Allow-Origin: {$origin}");

        if ($allowCredentials) {
            header('Access-Control-Allow-Credentials: true');
        }
    }

    header('Access-Control-Allow-Methods: ' . implode(', ', $methods));
    header('Access-Control-Allow-Headers: Content-Type, Accept, X-Sync-Token');
    header('Content-Type: application/json; charset=utf-8');
}