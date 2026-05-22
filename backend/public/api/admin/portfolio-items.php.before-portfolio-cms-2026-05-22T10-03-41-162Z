<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../config/db.php';
require_once __DIR__ . '/../../../config/admin_guard.php';
require_once __DIR__ . '/../../../config/portfolio_repository.php';

applyAdminCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

requireAdminLogin();

try {
    $pdo = getDatabaseConnection();
    ensurePortfolioItemsTable($pdo);

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $items = fetchPortfolioItems($pdo, false, false);

        sendJsonResponse(200, [
            'success' => true,
            'items' => $items,
        ]);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendJsonResponse(405, [
            'success' => false,
            'message' => 'GET 또는 POST 요청만 허용됩니다.',
        ]);
    }

    $payload = json_decode((string)file_get_contents('php://input'), true);

    if (!is_array($payload)) {
        sendJsonResponse(400, [
            'success' => false,
            'message' => '요청 형식이 올바르지 않습니다.',
        ]);
    }

    $action = (string)($payload['action'] ?? '');

    if ($action === 'create') {
        $itemId = createPortfolioItem($pdo, $payload);

        sendJsonResponse(201, [
            'success' => true,
            'message' => '포트폴리오가 추가되었습니다.',
            'itemId' => $itemId,
        ]);
    }

    if ($action === 'update') {
        $itemId = (int)($payload['id'] ?? 0);

        if ($itemId <= 0) {
            sendJsonResponse(422, [
                'success' => false,
                'message' => '포트폴리오 ID가 올바르지 않습니다.',
            ]);
        }

        updatePortfolioItem($pdo, $itemId, $payload);

        sendJsonResponse(200, [
            'success' => true,
            'message' => '포트폴리오가 수정되었습니다.',
            'itemId' => $itemId,
        ]);
    }

    if ($action === 'hide') {
        $itemId = (int)($payload['id'] ?? 0);

        if ($itemId <= 0) {
            sendJsonResponse(422, [
                'success' => false,
                'message' => '포트폴리오 ID가 올바르지 않습니다.',
            ]);
        }

        setPortfolioActive($pdo, $itemId, false);

        sendJsonResponse(200, [
            'success' => true,
            'message' => '포트폴리오가 숨김 처리되었습니다.',
        ]);
    }

    if ($action === 'restore') {
        $itemId = (int)($payload['id'] ?? 0);

        if ($itemId <= 0) {
            sendJsonResponse(422, [
                'success' => false,
                'message' => '포트폴리오 ID가 올바르지 않습니다.',
            ]);
        }

        setPortfolioActive($pdo, $itemId, true);

        sendJsonResponse(200, [
            'success' => true,
            'message' => '포트폴리오가 노출 처리되었습니다.',
        ]);
    }

    sendJsonResponse(422, [
        'success' => false,
        'message' => '지원하지 않는 작업입니다.',
    ]);
} catch (PDOException $error) {
    error_log('[BDPRODUCTION Admin Portfolio DB Error] ' . $error->getMessage());

    sendJsonResponse(500, [
        'success' => false,
        'message' => '포트폴리오 관리 작업을 처리하지 못했습니다.',
    ]);
} catch (Throwable $error) {
    error_log('[BDPRODUCTION Admin Portfolio Error] ' . $error->getMessage());

    sendJsonResponse(500, [
        'success' => false,
        'message' => '알 수 없는 서버 오류가 발생했습니다.',
    ]);
}

function createPortfolioItem(PDO $pdo, array $payload): int
{
    $data = normalizePortfolioPayload($payload);

    $statement = $pdo->prepare(
        'INSERT INTO portfolio_items
            (title, client, category, description, thumbnail_url, youtube_video_id, badge, is_featured, featured_order, is_active, display_order)
         VALUES
            (:title, :client, :category, :description, :thumbnail_url, :youtube_video_id, :badge, :is_featured, :featured_order, :is_active, :display_order)'
    );

    $statement->execute($data);

    return (int)$pdo->lastInsertId();
}

function updatePortfolioItem(PDO $pdo, int $itemId, array $payload): void
{
    $data = normalizePortfolioPayload($payload);
    $data[':id'] = $itemId;

    $statement = $pdo->prepare(
        'UPDATE portfolio_items
         SET
            title = :title,
            client = :client,
            category = :category,
            description = :description,
            thumbnail_url = :thumbnail_url,
            youtube_video_id = :youtube_video_id,
            badge = :badge,
            is_featured = :is_featured,
            featured_order = :featured_order,
            is_active = :is_active,
            display_order = :display_order
         WHERE id = :id
         LIMIT 1'
    );

    $statement->execute($data);
}

function setPortfolioActive(PDO $pdo, int $itemId, bool $isActive): void
{
    $statement = $pdo->prepare(
        'UPDATE portfolio_items
         SET is_active = :is_active
         WHERE id = :id
         LIMIT 1'
    );

    $statement->execute([
        ':id' => $itemId,
        ':is_active' => $isActive ? 1 : 0,
    ]);
}

function normalizePortfolioPayload(array $payload): array
{
    $title = trim((string)($payload['title'] ?? ''));

    if ($title === '') {
        sendJsonResponse(422, [
            'success' => false,
            'message' => '제목을 입력해주세요.',
        ]);
    }

    $youtubeVideoId = normalizeYouTubeVideoId((string)($payload['youtube_video_id'] ?? $payload['youtubeVideoId'] ?? ''));

    return [
        ':title' => $title,
        ':client' => trim((string)($payload['client'] ?? '')),
        ':category' => trim((string)($payload['category'] ?? '')),
        ':description' => trim((string)($payload['description'] ?? '')),
        ':thumbnail_url' => trim((string)($payload['thumbnail_url'] ?? $payload['thumbnailUrl'] ?? '')),
        ':youtube_video_id' => $youtubeVideoId,
        ':badge' => trim((string)($payload['badge'] ?? '')),
        ':is_featured' => normalizeBoolean($payload['is_featured'] ?? $payload['isFeatured'] ?? false) ? 1 : 0,
        ':featured_order' => normalizeInteger($payload['featured_order'] ?? $payload['featuredOrder'] ?? 0),
        ':is_active' => normalizeBoolean($payload['is_active'] ?? $payload['isActive'] ?? true) ? 1 : 0,
        ':display_order' => normalizeInteger($payload['display_order'] ?? $payload['displayOrder'] ?? 0),
    ];
}

function normalizeBoolean(mixed $value): bool
{
    if (is_bool($value)) {
        return $value;
    }

    if (is_numeric($value)) {
        return ((int)$value) === 1;
    }

    $normalized = strtolower(trim((string)$value));

    return in_array($normalized, ['1', 'true', 'yes', 'on'], true);
}

function normalizeInteger(mixed $value): int
{
    if (is_numeric($value)) {
        return (int)$value;
    }

    return 0;
}

function normalizeYouTubeVideoId(string $value): string
{
    $value = trim($value);

    if ($value === '') {
        return '';
    }

    if (preg_match('/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{6,})/', $value, $matches) === 1) {
        return $matches[1];
    }

    return $value;
}
