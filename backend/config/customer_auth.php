<?php

declare(strict_types=1);

require_once __DIR__ . '/env.php';

function bdHandleCustomerCors(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowedOrigins = array_map(
        'trim',
        explode(',', (string) envValue('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173'))
    );

    if ($origin !== '' && in_array($origin, $allowedOrigins, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
        header('Access-Control-Allow-Credentials: true');
    }

    header('Access-Control-Allow-Headers: Content-Type, Accept');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Content-Type: application/json; charset=utf-8');

    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function bdStartCustomerSession(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');

    session_set_cookie_params([
        'lifetime' => (int) envValue('CUSTOMER_SESSION_LIFETIME_SECONDS', '1209600'),
        'path' => '/',
        'secure' => $isHttps,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);

    session_name('BD_CUSTOMER_SESSION');
    session_start();
}

function bdReadJsonBody(): array
{
    $rawBody = file_get_contents('php://input');

    if ($rawBody === false || trim($rawBody) === '') {
        return [];
    }

    $decoded = json_decode($rawBody, true);

    if (!is_array($decoded)) {
        bdSendJson([
            'success' => false,
            'message' => '요청 데이터 형식이 올바르지 않습니다.',
        ], 400);
    }

    return $decoded;
}

function bdSendJson(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function bdNormalizeEmail(?string $email): string
{
    return mb_strtolower(trim((string) $email), 'UTF-8');
}

function bdPublicUser(array $user): array
{
    return [
        'id' => (int) $user['id'],
        'name' => (string) $user['name'],
        'company' => $user['company'] ?? null,
        'email' => (string) $user['email'],
        'phone' => $user['phone'] ?? null,
        'provider' => $user['provider'] ?? 'local',
        'createdAt' => $user['created_at'] ?? null,
    ];
}
