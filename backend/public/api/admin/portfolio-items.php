<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../config/db.php';
require_once __DIR__ . '/../../../config/admin_guard.php';

applyAdminCorsHeaders();
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

requireAdminLogin();

try {
    $pdo = getDatabaseConnection();

    ensurePortfolioItemsTable($pdo);
    seedPortfolioItemsIfEmpty($pdo);

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $statement = $pdo->query(
            'SELECT
                id,
                title,
                client,
                category,
                description,
                thumbnail_url,
                youtube_video_id,
                badge,
                is_featured,
                featured_order,
                is_active,
                display_order,
                source,
                published_at,
                created_at,
                updated_at
            FROM portfolio_items
            ORDER BY display_order ASC, id ASC'
        );

        sendJsonResponse(200, [
            'success' => true,
            'items' => array_map('normalizePortfolioItemForAdminResponse', $statement->fetchAll()),
        ]);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendJsonResponse(405, [
            'success' => false,
            'message' => 'GET 또는 POST 요청만 허용됩니다.',
        ]);
    }

    $rawBody = file_get_contents('php://input');
    $data = json_decode($rawBody, true);

    if (!is_array($data)) {
        sendJsonResponse(400, [
            'success' => false,
            'message' => '요청 데이터 형식이 올바르지 않습니다.',
        ]);
    }

    $action = trim((string) ($data['action'] ?? ''));

    if ($action === 'create' || $action === 'update') {
        savePortfolioItem($pdo, $data, $action);
    }

    if ($action === 'hide' || $action === 'restore') {
        updatePortfolioVisibility($pdo, $data, $action === 'restore');
    }

    if ($action === 'delete') {
        deletePortfolioItem($pdo, $data);
    }

    sendJsonResponse(422, [
        'success' => false,
        'message' => '지원하지 않는 작업입니다.',
    ]);
} catch (PDOException $error) {
    error_log('[BDPRODUCTION Admin Portfolio API DB Error] ' . $error->getMessage());

    sendJsonResponse(500, [
        'success' => false,
        'message' => '포트폴리오 관리 데이터를 처리하지 못했습니다.',
    ]);
} catch (Throwable $error) {
    error_log('[BDPRODUCTION Admin Portfolio API Error] ' . $error->getMessage());

    sendJsonResponse(500, [
        'success' => false,
        'message' => '알 수 없는 서버 오류가 발생했습니다.',
    ]);
}

function savePortfolioItem(PDO $pdo, array $data, string $action): void
{
    $id = (int) ($data['id'] ?? 0);
    $title = trim((string) ($data['title'] ?? ''));
    $client = trim((string) ($data['client'] ?? ''));
    $category = trim((string) ($data['category'] ?? ''));
    $description = trim((string) ($data['description'] ?? ''));
    $thumbnailUrl = trim((string) ($data['thumbnail_url'] ?? $data['thumbnailUrl'] ?? ''));
    $youtubeVideoId = extractYouTubeVideoId((string) ($data['youtube_video_id'] ?? $data['youtubeVideoId'] ?? $data['video_id'] ?? ''));
    $badge = trim((string) ($data['badge'] ?? ''));

    $isFeatured = normalizeBoolean($data['is_featured'] ?? $data['isFeatured'] ?? false) ? 1 : 0;
    $isActive = normalizeBoolean($data['is_active'] ?? $data['isActive'] ?? true) ? 1 : 0;
    $featuredOrder = (int) ($data['featured_order'] ?? $data['featuredOrder'] ?? 0);
    $displayOrder = (int) ($data['display_order'] ?? $data['displayOrder'] ?? 0);

    if ($title === '') {
        sendJsonResponse(422, [
            'success' => false,
            'message' => '포트폴리오 제목을 입력해주세요.',
        ]);
    }

    if (stringLength($title) > 190) {
        sendJsonResponse(422, [
            'success' => false,
            'message' => '제목은 190자 이하로 입력해주세요.',
        ]);
    }

    if (stringLength($thumbnailUrl) > 500) {
        sendJsonResponse(422, [
            'success' => false,
            'message' => '썸네일 URL은 500자 이하로 입력해주세요.',
        ]);
    }

    if ($action === 'create') {
        $statement = $pdo->prepare(
            'INSERT INTO portfolio_items (
                title,
                client,
                category,
                description,
                thumbnail_url,
                youtube_video_id,
                badge,
                is_featured,
                featured_order,
                is_active,
                display_order,
                source
            ) VALUES (
                :title,
                :client,
                :category,
                :description,
                :thumbnail_url,
                :youtube_video_id,
                :badge,
                :is_featured,
                :featured_order,
                :is_active,
                :display_order,
                "manual"
            )'
        );

        $statement->execute([
            ':title' => $title,
            ':client' => $client !== '' ? $client : null,
            ':category' => $category !== '' ? $category : null,
            ':description' => $description !== '' ? $description : null,
            ':thumbnail_url' => $thumbnailUrl !== '' ? $thumbnailUrl : null,
            ':youtube_video_id' => $youtubeVideoId !== '' ? $youtubeVideoId : null,
            ':badge' => $badge !== '' ? $badge : null,
            ':is_featured' => $isFeatured,
            ':featured_order' => $featuredOrder,
            ':is_active' => $isActive,
            ':display_order' => $displayOrder,
        ]);

        $newId = (int) $pdo->lastInsertId();

        sendJsonResponse(201, [
            'success' => true,
            'message' => '포트폴리오가 추가되었습니다.',
            'item' => getPortfolioItemById($pdo, $newId),
        ]);
    }

    if ($id <= 0) {
        sendJsonResponse(422, [
            'success' => false,
            'message' => '수정할 포트폴리오 ID가 올바르지 않습니다.',
        ]);
    }

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
            display_order = :display_order,
            source = CASE WHEN source = "seed" THEN "manual" ELSE source END
        WHERE id = :id'
    );

    $statement->execute([
        ':id' => $id,
        ':title' => $title,
        ':client' => $client !== '' ? $client : null,
        ':category' => $category !== '' ? $category : null,
        ':description' => $description !== '' ? $description : null,
        ':thumbnail_url' => $thumbnailUrl !== '' ? $thumbnailUrl : null,
        ':youtube_video_id' => $youtubeVideoId !== '' ? $youtubeVideoId : null,
        ':badge' => $badge !== '' ? $badge : null,
        ':is_featured' => $isFeatured,
        ':featured_order' => $featuredOrder,
        ':is_active' => $isActive,
        ':display_order' => $displayOrder,
    ]);

    if ($statement->rowCount() === 0 && getPortfolioItemById($pdo, $id) === null) {
        sendJsonResponse(404, [
            'success' => false,
            'message' => '수정할 포트폴리오를 찾지 못했습니다.',
        ]);
    }

    sendJsonResponse(200, [
        'success' => true,
        'message' => '포트폴리오가 수정되었습니다.',
        'item' => getPortfolioItemById($pdo, $id),
    ]);
}

function updatePortfolioVisibility(PDO $pdo, array $data, bool $nextActive): void
{
    $id = (int) ($data['id'] ?? 0);

    if ($id <= 0) {
        sendJsonResponse(422, [
            'success' => false,
            'message' => '포트폴리오 ID가 올바르지 않습니다.',
        ]);
    }

    $statement = $pdo->prepare(
        'UPDATE portfolio_items
        SET is_active = :is_active
        WHERE id = :id'
    );

    $statement->execute([
        ':id' => $id,
        ':is_active' => $nextActive ? 1 : 0,
    ]);

    sendJsonResponse(200, [
        'success' => true,
        'message' => $nextActive ? '포트폴리오가 다시 노출되었습니다.' : '포트폴리오가 숨김 처리되었습니다.',
        'item' => getPortfolioItemById($pdo, $id),
    ]);
}

function deletePortfolioItem(PDO $pdo, array $data): void
{
    $id = (int) ($data['id'] ?? 0);

    if ($id <= 0) {
        sendJsonResponse(422, [
            'success' => false,
            'message' => '삭제할 포트폴리오 ID가 올바르지 않습니다.',
        ]);
    }

    $statement = $pdo->prepare('DELETE FROM portfolio_items WHERE id = :id');
    $statement->execute([':id' => $id]);

    sendJsonResponse(200, [
        'success' => true,
        'message' => '포트폴리오가 삭제되었습니다.',
    ]);
}

function getPortfolioItemById(PDO $pdo, int $id): ?array
{
    $statement = $pdo->prepare(
        'SELECT
            id,
            title,
            client,
            category,
            description,
            thumbnail_url,
            youtube_video_id,
            badge,
            is_featured,
            featured_order,
            is_active,
            display_order,
            source,
            published_at,
            created_at,
            updated_at
        FROM portfolio_items
        WHERE id = :id'
    );

    $statement->execute([':id' => $id]);
    $item = $statement->fetch();

    if (!$item) {
        return null;
    }

    return normalizePortfolioItemForAdminResponse($item);
}

function ensurePortfolioItemsTable(PDO $pdo): void
{
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS portfolio_items (
            id INT AUTO_INCREMENT PRIMARY KEY,

            title VARCHAR(190) NOT NULL,
            client VARCHAR(190) NULL,
            category VARCHAR(100) NULL,
            description TEXT NULL,

            thumbnail_url VARCHAR(500) NULL,
            youtube_video_id VARCHAR(190) NULL,
            badge VARCHAR(50) NULL,

            is_featured TINYINT(1) NOT NULL DEFAULT 0,
            featured_order INT NOT NULL DEFAULT 0,

            is_active TINYINT(1) NOT NULL DEFAULT 1,
            display_order INT NOT NULL DEFAULT 0,

            source VARCHAR(50) NOT NULL DEFAULT "manual",
            published_at DATETIME NULL,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

            INDEX idx_portfolio_active_order (is_active, display_order, id),
            INDEX idx_portfolio_featured_order (is_featured, featured_order, id),
            INDEX idx_portfolio_category (category),
            INDEX idx_portfolio_youtube_video_id (youtube_video_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );
}

function seedPortfolioItemsIfEmpty(PDO $pdo): void
{
    $count = (int) $pdo->query('SELECT COUNT(*) FROM portfolio_items')->fetchColumn();

    if ($count > 0) {
        return;
    }

    $items = [
        [
            'title' => 'Warner Music Korea MV Production',
            'client' => '워너뮤직 코리아',
            'category' => 'Music Video',
            'description' => '아티스트 콘셉트와 브랜드 톤을 반영한 뮤직비디오 제작 프로젝트입니다.',
            'thumbnail_url' => '',
            'youtube_video_id' => '',
            'badge' => 'MV',
            'is_featured' => 1,
            'featured_order' => 1,
            'is_active' => 1,
            'display_order' => 1,
        ],
        [
            'title' => 'Channel A Virtual Studio',
            'client' => '채널A',
            'category' => 'Broadcast',
            'description' => '방송 프로그램 제작과 버추얼 스튜디오 기반 영상 제작 경험을 담은 프로젝트입니다.',
            'thumbnail_url' => '',
            'youtube_video_id' => '',
            'badge' => 'TV',
            'is_featured' => 1,
            'featured_order' => 2,
            'is_active' => 1,
            'display_order' => 2,
        ],
        [
            'title' => 'PUBG Official Brand Film',
            'client' => 'PUBG',
            'category' => 'Game',
            'description' => '게임 브랜드의 액션성과 몰입감을 강조한 공식 영상 제작 프로젝트입니다.',
            'thumbnail_url' => '',
            'youtube_video_id' => '',
            'badge' => 'GAME',
            'is_featured' => 1,
            'featured_order' => 3,
            'is_active' => 1,
            'display_order' => 3,
        ],
        [
            'title' => 'Ten Square CAR Tower OOH Film',
            'client' => '싱가포르 Ten Square CAR타워',
            'category' => 'Outdoor AD',
            'description' => '해외 옥외 영상광고를 위한 고해상도 시네마틱 프로덕션 프로젝트입니다.',
            'thumbnail_url' => '',
            'youtube_video_id' => '',
            'badge' => 'OOH',
            'is_featured' => 1,
            'featured_order' => 4,
            'is_active' => 1,
            'display_order' => 4,
        ],
        [
            'title' => 'Automotive Brand Commercial',
            'client' => '타타대우 × KGM자동차',
            'category' => 'Commercial',
            'description' => '자동차 브랜드의 신뢰감과 제품 이미지를 강화하는 광고 영상 제작 프로젝트입니다.',
            'thumbnail_url' => '',
            'youtube_video_id' => '',
            'badge' => 'CF',
            'is_featured' => 1,
            'featured_order' => 5,
            'is_active' => 1,
            'display_order' => 5,
        ],
        [
            'title' => 'Tourism Promotion Film',
            'client' => '한국관광공사 × 대만관광공사',
            'category' => 'Promotion',
            'description' => '관광지의 감성과 국가 브랜드 이미지를 연결하는 해외 홍보 영상 프로젝트입니다.',
            'thumbnail_url' => '',
            'youtube_video_id' => '',
            'badge' => 'PR',
            'is_featured' => 1,
            'featured_order' => 6,
            'is_active' => 1,
            'display_order' => 6,
        ],
    ];

    $statement = $pdo->prepare(
        'INSERT INTO portfolio_items (
            title,
            client,
            category,
            description,
            thumbnail_url,
            youtube_video_id,
            badge,
            is_featured,
            featured_order,
            is_active,
            display_order,
            source
        ) VALUES (
            :title,
            :client,
            :category,
            :description,
            :thumbnail_url,
            :youtube_video_id,
            :badge,
            :is_featured,
            :featured_order,
            :is_active,
            :display_order,
            "seed"
        )'
    );

    foreach ($items as $item) {
        $statement->execute([
            ':title' => $item['title'],
            ':client' => $item['client'],
            ':category' => $item['category'],
            ':description' => $item['description'],
            ':thumbnail_url' => $item['thumbnail_url'],
            ':youtube_video_id' => $item['youtube_video_id'],
            ':badge' => $item['badge'],
            ':is_featured' => $item['is_featured'],
            ':featured_order' => $item['featured_order'],
            ':is_active' => $item['is_active'],
            ':display_order' => $item['display_order'],
        ]);
    }
}

function normalizePortfolioItemForAdminResponse(array $item): array
{
    $youtubeVideoId = extractYouTubeVideoId((string) ($item['youtube_video_id'] ?? ''));

    return [
        'id' => (int) ($item['id'] ?? 0),
        'title' => (string) ($item['title'] ?? ''),
        'client' => (string) ($item['client'] ?? ''),
        'category' => (string) ($item['category'] ?? ''),
        'description' => (string) ($item['description'] ?? ''),
        'thumbnail_url' => (string) ($item['thumbnail_url'] ?? ''),
        'thumbnailUrl' => (string) ($item['thumbnail_url'] ?? ''),
        'youtube_video_id' => $youtubeVideoId,
        'youtubeVideoId' => $youtubeVideoId,
        'video_id' => $youtubeVideoId,
        'badge' => (string) ($item['badge'] ?? ''),
        'is_featured' => (bool) ((int) ($item['is_featured'] ?? 0)),
        'isFeatured' => (bool) ((int) ($item['is_featured'] ?? 0)),
        'featured_order' => (int) ($item['featured_order'] ?? 0),
        'featuredOrder' => (int) ($item['featured_order'] ?? 0),
        'is_active' => (bool) ((int) ($item['is_active'] ?? 1)),
        'isActive' => (bool) ((int) ($item['is_active'] ?? 1)),
        'display_order' => (int) ($item['display_order'] ?? 0),
        'displayOrder' => (int) ($item['display_order'] ?? 0),
        'source' => (string) ($item['source'] ?? 'manual'),
        'published_at' => $item['published_at'] ?? null,
        'created_at' => $item['created_at'] ?? null,
        'updated_at' => $item['updated_at'] ?? null,
    ];
}

function extractYouTubeVideoId(string $value): string
{
    $value = trim($value);

    if ($value === '') {
        return '';
    }

    if (preg_match('/^[a-zA-Z0-9_-]{11}$/', $value) === 1) {
        return $value;
    }

    $patterns = [
        '/youtu\.be\/([a-zA-Z0-9_-]{11})/',
        '/youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/',
        '/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/',
        '/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/',
        '/[?&]v=([a-zA-Z0-9_-]{11})/',
    ];

    foreach ($patterns as $pattern) {
        if (preg_match($pattern, $value, $matches) === 1) {
            return $matches[1];
        }
    }

    return $value;
}

function normalizeBoolean(mixed $value): bool
{
    if ($value === true || $value === 1 || $value === '1' || $value === 'true') {
        return true;
    }

    if ($value === false || $value === 0 || $value === '0' || $value === 'false') {
        return false;
    }

    return false;
}

function stringLength(string $value): int
{
    if (function_exists('mb_strlen')) {
        return mb_strlen($value);
    }

    return strlen($value);
}
