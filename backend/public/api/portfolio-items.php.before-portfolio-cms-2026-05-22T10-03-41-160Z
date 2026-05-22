<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/portfolio_repository.php';

applyPublicPortfolioCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendPortfolioJsonResponse(405, [
        'success' => false,
        'message' => 'GET 요청만 허용됩니다.',
    ]);
}

try {
    $pdo = getDatabaseConnection();
    ensurePortfolioItemsTable($pdo);

    $featuredOnly = isset($_GET['featured']) && (string)$_GET['featured'] === '1';
    $items = fetchPortfolioItems($pdo, true, $featuredOnly);

    sendPortfolioJsonResponse(200, [
        'success' => true,
        'source' => 'database',
        'videos' => $items,
        'items' => $items,
    ]);
} catch (PDOException $error) {
    error_log('[BDPRODUCTION Public Portfolio DB Error] ' . $error->getMessage());

    sendPortfolioJsonResponse(500, [
        'success' => false,
        'message' => '포트폴리오를 불러오지 못했습니다.',
    ]);
} catch (Throwable $error) {
    error_log('[BDPRODUCTION Public Portfolio Error] ' . $error->getMessage());

    sendPortfolioJsonResponse(500, [
        'success' => false,
        'message' => '알 수 없는 서버 오류가 발생했습니다.',
    ]);
}

function applyPublicPortfolioCorsHeaders(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    $allowedOrigins = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ];

    if (in_array($origin, $allowedOrigins, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
    }

    header('Vary: Origin');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Accept');
    header('Content-Type: application/json; charset=utf-8');
}

function sendPortfolioJsonResponse(int $statusCode, array $payload): void
{
    http_response_code($statusCode);

    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    exit;
}
