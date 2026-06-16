<?php

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

bdRequireConfig('cors.php');
bdRequireConfig('db.php');

applyCorsHeaders(['GET', 'OPTIONS'], false);
header('Content-Type: application/json; charset=utf-8');

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
    seedPortfolioItemsIfEmpty($pdo);

    $featuredOnly = ($_GET['featured'] ?? '') === '1';

    $where = 'WHERE is_active = 1';
    $orderBy = 'ORDER BY display_order ASC, id ASC';

    if ($featuredOnly) {
        $where .= ' AND is_featured = 1';
        $orderBy = 'ORDER BY featured_order ASC, display_order ASC, id ASC';
    }

    $statement = $pdo->query(
        'SELECT
            id,
            title,
            client,
            category,
            description,
            thumbnail_url,
            youtube_video_id,
            video_provider,
            source_url,
            badge,
            production_team,
            production_role,
            crew_names,
            work_year,
            is_featured,
            featured_order,
            is_active,
            display_order,
            source,
            published_at,
            created_at,
            updated_at
        FROM portfolio_items
        ' . $where . '
        ' . $orderBy
    );

    $items = array_map('normalizePortfolioItemForResponse', $statement->fetchAll());

    sendPortfolioJsonResponse(200, [
        'success' => true,
        'source' => 'database',
        'items' => $items,
        'videos' => $items,
    ]);
} catch (PDOException $error) {
    error_log('[BDPRODUCTION Portfolio API DB Error] ' . $error->getMessage());

    $fallbackItems = array_map('normalizePortfolioItemForResponse', getFallbackPortfolioItems());

    sendPortfolioJsonResponse(200, [
        'success' => true,
        'source' => 'fallback',
        'items' => $fallbackItems,
        'videos' => $fallbackItems,
        'message' => 'DB 포트폴리오 테이블을 사용할 수 없어 기본 포트폴리오 목록을 표시합니다.',
    ]);
} catch (Throwable $error) {
    error_log('[BDPRODUCTION Portfolio API Error] ' . $error->getMessage());

    sendPortfolioJsonResponse(500, [
        'success' => false,
        'message' => '포트폴리오 목록을 불러오지 못했습니다.',
    ]);
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
            video_provider VARCHAR(40) NULL DEFAULT "youtube",
            source_url VARCHAR(700) NULL,
            badge VARCHAR(50) NULL,
            production_team VARCHAR(120) NULL,
            production_role VARCHAR(190) NULL,
            crew_names TEXT NULL,
            work_year VARCHAR(20) NULL,

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

    ensurePortfolioMetadataColumns($pdo);
}

function ensurePortfolioColumn(PDO $pdo, string $columnName, string $definition): void
{
    $statement = $pdo->prepare('
        SELECT COUNT(*)
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = :table_name
          AND COLUMN_NAME = :column_name
    ');

    $statement->execute([
        ':table_name' => 'portfolio_items',
        ':column_name' => $columnName,
    ]);

    if ((int) $statement->fetchColumn() > 0) {
        return;
    }

    $pdo->exec('ALTER TABLE portfolio_items ADD COLUMN ' . $definition);
}

function ensurePortfolioMetadataColumns(PDO $pdo): void
{
    ensurePortfolioColumn($pdo, 'video_provider', 'video_provider VARCHAR(40) NULL DEFAULT "youtube" AFTER youtube_video_id');
    ensurePortfolioColumn($pdo, 'source_url', 'source_url VARCHAR(700) NULL AFTER video_provider');
    ensurePortfolioColumn($pdo, 'production_team', 'production_team VARCHAR(120) NULL AFTER badge');
    ensurePortfolioColumn($pdo, 'production_role', 'production_role VARCHAR(190) NULL AFTER production_team');
    ensurePortfolioColumn($pdo, 'crew_names', 'crew_names TEXT NULL AFTER production_role');
    ensurePortfolioColumn($pdo, 'work_year', 'work_year VARCHAR(20) NULL AFTER crew_names');
    ensurePortfolioColumn($pdo, 'source', 'source VARCHAR(50) NOT NULL DEFAULT "manual" AFTER display_order');
    ensurePortfolioColumn($pdo, 'published_at', 'published_at DATETIME NULL AFTER source');
    ensurePortfolioColumn($pdo, 'created_at', 'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER published_at');
    ensurePortfolioColumn($pdo, 'updated_at', 'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at');
}

function seedPortfolioItemsIfEmpty(PDO $pdo): void
{
    $count = (int) $pdo->query('SELECT COUNT(*) FROM portfolio_items')->fetchColumn();

    if ($count > 0) {
        return;
    }

    $statement = $pdo->prepare(
        'INSERT INTO portfolio_items (
            title,
            client,
            category,
            description,
            thumbnail_url,
            youtube_video_id,
            video_provider,
            source_url,
            badge,
            production_team,
            production_role,
            crew_names,
            work_year,
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
            :source
        )'
    );

    foreach (getFallbackPortfolioItems() as $item) {
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
            ':source' => $item['source'],
        ]);
    }
}

function getFallbackPortfolioItems(): array
{
    return [
        [
            'id' => 1,
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
            'source' => 'seed',
        ],
        [
            'id' => 2,
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
            'source' => 'seed',
        ],
        [
            'id' => 3,
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
            'source' => 'seed',
        ],
        [
            'id' => 4,
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
            'source' => 'seed',
        ],
        [
            'id' => 5,
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
            'source' => 'seed',
        ],
        [
            'id' => 6,
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
            'source' => 'seed',
        ],
    ];
}

function normalizePortfolioItemForResponse(array $item): array
{
    $youtubeVideoId = extractYouTubeVideoId((string) ($item['youtube_video_id'] ?? ''));
    $thumbnailUrl = trim((string) ($item['thumbnail_url'] ?? ''));

    if ($thumbnailUrl === '' && $youtubeVideoId !== '') {
        $thumbnailUrl = 'https://img.youtube.com/vi/' . $youtubeVideoId . '/hqdefault.jpg';
    }
    $sourceUrl = trim((string) ($item['source_url'] ?? ''));
    $videoProvider = trim((string) ($item['video_provider'] ?? 'youtube'));
    $watchUrl = $youtubeVideoId !== '' ? 'https://www.youtube.com/watch?v=' . $youtubeVideoId : $sourceUrl;

    return [
        'id' => isset($item['id']) ? (int) $item['id'] : null,
        'title' => (string) ($item['title'] ?? ''),
        'client' => (string) ($item['client'] ?? ''),
        'category' => (string) ($item['category'] ?? ''),
        'description' => (string) ($item['description'] ?? ''),
        'thumbnail_url' => $thumbnailUrl,
        'thumbnailUrl' => $thumbnailUrl,
        'youtube_video_id' => $youtubeVideoId,
        'youtubeVideoId' => $youtubeVideoId,
        'video_id' => $youtubeVideoId !== '' ? $youtubeVideoId : ($sourceUrl !== '' ? md5($sourceUrl) : ''),
        'video_provider' => $videoProvider,
        'videoProvider' => $videoProvider,
        'source_url' => $sourceUrl,
        'sourceUrl' => $sourceUrl,
        'badge' => (string) ($item['badge'] ?? ''),
        'production_team' => (string) ($item['production_team'] ?? ''),
        'productionTeam' => (string) ($item['production_team'] ?? ''),
        'production_role' => (string) ($item['production_role'] ?? ''),
        'productionRole' => (string) ($item['production_role'] ?? ''),
        'crew_names' => (string) ($item['crew_names'] ?? ''),
        'crewNames' => (string) ($item['crew_names'] ?? ''),
        'work_year' => (string) ($item['work_year'] ?? ''),
        'workYear' => (string) ($item['work_year'] ?? ''),
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
        'embed_url' => $youtubeVideoId !== '' ? 'https://www.youtube.com/embed/' . $youtubeVideoId : '',
        'embedUrl' => $youtubeVideoId !== '' ? 'https://www.youtube.com/embed/' . $youtubeVideoId : '',
        'watch_url' => $watchUrl,
        'watchUrl' => $watchUrl,
        'is_new' => false,
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

function sendPortfolioJsonResponse(int $statusCode, array $payload): void
{
    http_response_code($statusCode);

    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    exit;
}
