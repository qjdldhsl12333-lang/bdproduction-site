<?php

declare(strict_types=1);

require_once __DIR__ . '/admin.php';

function applyAdminCorsHeaders(): void
{
    $allowedOrigins = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ];

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if (in_array($origin, $allowedOrigins, true)) {
        header("Access-Control-Allow-Origin: {$origin}");
        header('Access-Control-Allow-Credentials: true');
    }

    header('Access-Control-Allow-Headers: Content-Type, Accept');
    header('Content-Type: application/json; charset=utf-8');
}

function startAdminSession(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);

    session_start();
}

function markAdminLoggedIn(): void
{
    startAdminSession();

    session_regenerate_id(true);

    $_SESSION['bd_admin_logged_in'] = true;
    $_SESSION['bd_admin_login_at'] = time();
    $_SESSION['bd_admin_last_seen_at'] = time();
}

function clearAdminSession(): void
{
    startAdminSession();

    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();

        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params['path'] ?? '/',
            $params['domain'] ?? '',
            (bool)($params['secure'] ?? false),
            (bool)($params['httponly'] ?? true)
        );
    }

    session_destroy();
}

function isAdminSessionExpired(): bool
{
    startAdminSession();

    $lastSeenAt = (int)($_SESSION['bd_admin_last_seen_at'] ?? 0);

    if ($lastSeenAt <= 0) {
        return true;
    }

    return (time() - $lastSeenAt) > getAdminSessionLifetimeSeconds();
}

function isAdminLoggedIn(): bool
{
    startAdminSession();

    if (($_SESSION['bd_admin_logged_in'] ?? false) !== true) {
        return false;
    }

    if (isAdminSessionExpired()) {
        clearAdminSession();

        return false;
    }

    $_SESSION['bd_admin_last_seen_at'] = time();

    return true;
}

function requireAdminLogin(): void
{
    if (!isAdminLoggedIn()) {
        sendJsonResponse(401, [
            'success' => false,
            'message' => '관리자 로그인이 필요하거나 세션이 만료되었습니다.',
        ]);
    }
}

function sendJsonResponse(int $statusCode, array $payload): void
{
    http_response_code($statusCode);

    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    exit;
}