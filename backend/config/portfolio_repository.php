<?php

declare(strict_types=1);

function ensurePortfolioItemsTable(PDO $pdo): void
{
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS portfolio_items (
            id INT AUTO_INCREMENT PRIMARY KEY,

            title VARCHAR(255) NOT NULL,
            client VARCHAR(150) NULL,
            category VARCHAR(100) NULL,
            description TEXT NULL,

            thumbnail_url VARCHAR(600) NULL,
            youtube_video_id VARCHAR(80) NULL,
            badge VARCHAR(40) NULL,

            is_featured TINYINT(1) NOT NULL DEFAULT 0,
            featured_order INT NOT NULL DEFAULT 0,

            is_active TINYINT(1) NOT NULL DEFAULT 1,
            display_order INT NOT NULL DEFAULT 0,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

            INDEX idx_portfolio_active_order (is_active, display_order),
            INDEX idx_portfolio_featured_order (is_featured, featured_order),
            INDEX idx_portfolio_category (category)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $statement = $pdo->query('SELECT COUNT(*) AS total_count FROM portfolio_items');
    $row = $statement !== false ? $statement->fetch(PDO::FETCH_ASSOC) : ['total_count' => 0];

    if ((int)($row['total_count'] ?? 0) > 0) {
        return;
    }

    seedInitialPortfolioItems($pdo);
}

function seedInitialPortfolioItems(PDO $pdo): void
{
    $items = [
        [
            'title' => 'Warner Music Korea MV Production',
            'client' => '워너뮤직 코리아',
            'category' => 'Music Video',
            'description' => '아티스트 콘셉트와 브랜드 톤을 반영한 뮤직비디오 제작 프로젝트입니다.',
            'badge' => 'MV',
            'featured_order' => 1,
            'display_order' => 1,
        ],
        [
            'title' => 'Channel A Virtual Studio',
            'client' => '채널A',
            'category' => 'Broadcast',
            'description' => '방송 프로그램 제작과 버추얼 스튜디오 기반 영상 제작 경험을 담은 프로젝트입니다.',
            'badge' => 'TV',
            'featured_order' => 2,
            'display_order' => 2,
        ],
        [
            'title' => 'PUBG Official Brand Film',
            'client' => 'PUBG',
            'category' => 'Game',
            'description' => '게임 브랜드의 액션성과 몰입감을 강조한 공식 영상 제작 프로젝트입니다.',
            'badge' => 'GAME',
            'featured_order' => 3,
            'display_order' => 3,
        ],
        [
            'title' => 'Ten Square CAR Tower OOH Film',
            'client' => '싱가포르 Ten Square CAR타워',
            'category' => 'Outdoor AD',
            'description' => '해외 옥외 영상광고를 위한 고해상도 시네마틱 프로덕션 프로젝트입니다.',
            'badge' => 'OOH',
            'featured_order' => 4,
            'display_order' => 4,
        ],
        [
            'title' => 'Automotive Brand Commercial',
            'client' => '타타대우 × KGM자동차',
            'category' => 'Commercial',
            'description' => '자동차 브랜드의 신뢰감과 제품 이미지를 강화하는 광고 영상 제작 프로젝트입니다.',
            'badge' => 'CF',
            'featured_order' => 5,
            'display_order' => 5,
        ],
        [
            'title' => 'Tourism Promotion Film',
            'client' => '한국관광공사 × 대만관광공사',
            'category' => 'Promotion',
            'description' => '관광지의 감성과 국가 브랜드 이미지를 연결하는 해외 홍보 영상 프로젝트입니다.',
            'badge' => 'PR',
            'featured_order' => 6,
            'display_order' => 6,
        ],
    ];

    $statement = $pdo->prepare(
        'INSERT INTO portfolio_items
            (title, client, category, description, thumbnail_url, youtube_video_id, badge, is_featured, featured_order, is_active, display_order)
         VALUES
            (:title, :client, :category, :description, :thumbnail_url, :youtube_video_id, :badge, :is_featured, :featured_order, :is_active, :display_order)'
    );

    foreach ($items as $item) {
        $statement->execute([
            ':title' => $item['title'],
            ':client' => $item['client'],
            ':category' => $item['category'],
            ':description' => $item['description'],
            ':thumbnail_url' => '',
            ':youtube_video_id' => '',
            ':badge' => $item['badge'],
            ':is_featured' => 1,
            ':featured_order' => $item['featured_order'],
            ':is_active' => 1,
            ':display_order' => $item['display_order'],
        ]);
    }
}

function mapPortfolioItem(array $item): array
{
    $youtubeVideoId = trim((string)($item['youtube_video_id'] ?? ''));
    $thumbnailUrl = (string)($item['thumbnail_url'] ?? '');

    return [
        'id' => (int)($item['id'] ?? 0),
        'title' => (string)($item['title'] ?? ''),
        'client' => (string)($item['client'] ?? ''),
        'category' => (string)($item['category'] ?? ''),
        'description' => (string)($item['description'] ?? ''),
        'thumbnail_url' => $thumbnailUrl,
        'thumbnailUrl' => $thumbnailUrl,
        'youtube_video_id' => $youtubeVideoId,
        'youtubeVideoId' => $youtubeVideoId,
        'video_id' => $youtubeVideoId !== '' ? $youtubeVideoId : 'portfolio-' . (string)($item['id'] ?? ''),
        'badge' => (string)($item['badge'] ?? ''),
        'is_featured' => ((int)($item['is_featured'] ?? 0)) === 1,
        'isFeatured' => ((int)($item['is_featured'] ?? 0)) === 1,
        'featured_order' => (int)($item['featured_order'] ?? 0),
        'featuredOrder' => (int)($item['featured_order'] ?? 0),
        'is_active' => ((int)($item['is_active'] ?? 0)) === 1,
        'isActive' => ((int)($item['is_active'] ?? 0)) === 1,
        'display_order' => (int)($item['display_order'] ?? 0),
        'displayOrder' => (int)($item['display_order'] ?? 0),
        'embed_url' => $youtubeVideoId !== '' ? 'https://www.youtube.com/embed/' . rawurlencode($youtubeVideoId) : '',
        'embedUrl' => $youtubeVideoId !== '' ? 'https://www.youtube.com/embed/' . rawurlencode($youtubeVideoId) : '',
        'watch_url' => $youtubeVideoId !== '' ? 'https://www.youtube.com/watch?v=' . rawurlencode($youtubeVideoId) : '',
        'watchUrl' => $youtubeVideoId !== '' ? 'https://www.youtube.com/watch?v=' . rawurlencode($youtubeVideoId) : '',
        'channel_title' => (string)($item['client'] ?? 'BDPRODUCTION'),
        'created_at' => (string)($item['created_at'] ?? ''),
        'updated_at' => (string)($item['updated_at'] ?? ''),
    ];
}

function fetchPortfolioItems(PDO $pdo, bool $activeOnly = true, bool $featuredOnly = false): array
{
    $conditions = [];

    if ($activeOnly) {
        $conditions[] = 'is_active = 1';
    }

    if ($featuredOnly) {
        $conditions[] = 'is_featured = 1';
    }

    $whereClause = count($conditions) > 0
        ? 'WHERE ' . implode(' AND ', $conditions)
        : '';

    $statement = $pdo->query(
        "SELECT *
         FROM portfolio_items
         {$whereClause}
         ORDER BY
            CASE WHEN is_featured = 1 THEN featured_order ELSE display_order END ASC,
            display_order ASC,
            id DESC"
    );

    $items = $statement !== false ? $statement->fetchAll(PDO::FETCH_ASSOC) : [];

    return array_map('mapPortfolioItem', $items);
}
