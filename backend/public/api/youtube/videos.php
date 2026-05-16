<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../config/db.php';
require_once __DIR__ . '/../../../config/youtube.php';

$allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
}

header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJsonResponse(405, [
        'success' => false,
        'message' => 'GET 요청만 허용됩니다.',
    ]);
}

try {
    $pdo = getDatabaseConnection();

    $statement = $pdo->prepare(
        'SELECT
            video_id,
            title,
            description,
            thumbnail_url,
            channel_title,
            published_at,
            position,
            source,
            updated_at
        FROM youtube_videos
        WHERE is_active = 1
        ORDER BY position ASC, published_at DESC, id DESC
        LIMIT :limit'
    );

    $limit = getYoutubeMaxResults();
    $statement->bindValue(':limit', $limit, PDO::PARAM_INT);
    $statement->execute();

    $videos = $statement->fetchAll();

    if (count($videos) === 0) {
        sendJsonResponse(200, [
            'success' => true,
            'source' => 'mock',
            'message' => 'YouTube 연결 전 임시 포트폴리오 데이터입니다.',
            'videos' => getMockPortfolioVideos(),
        ]);
    }

    $videos = array_map(static function (array $video): array {
        $video['is_new'] = isYoutubeVideoNew($video['published_at'] ?? null);
        $video['embed_url'] = 'https://www.youtube.com/embed/' . $video['video_id'] . '?autoplay=1';
        $video['watch_url'] = 'https://www.youtube.com/watch?v=' . $video['video_id'];

        return $video;
    }, $videos);

    sendJsonResponse(200, [
        'success' => true,
        'source' => 'cache',
        'message' => '캐시된 YouTube 포트폴리오 목록입니다.',
        'videos' => $videos,
    ]);
} catch (PDOException $error) {
    error_log('[BDPRODUCTION YouTube Videos API DB Error] ' . $error->getMessage());

    sendJsonResponse(500, [
        'success' => false,
        'message' => '포트폴리오 목록을 불러오지 못했습니다.',
    ]);
} catch (Throwable $error) {
    error_log('[BDPRODUCTION YouTube Videos API Error] ' . $error->getMessage());

    sendJsonResponse(500, [
        'success' => false,
        'message' => '알 수 없는 서버 오류가 발생했습니다.',
    ]);
}

function getMockPortfolioVideos(): array
{
    return [
        [
            'video_id' => 'mock-gstar',
            'title' => 'G-STAR Global Game Exhibition',
            'description' => '게임 브랜드 영상 포트폴리오 샘플입니다.',
            'thumbnail_url' => 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
            'channel_title' => 'BDPRODUCTION',
            'published_at' => date('Y-m-d H:i:s'),
            'position' => 1,
            'source' => 'mock',
            'is_new' => true,
            'embed_url' => '',
            'watch_url' => '',
        ],
        [
            'video_id' => 'mock-cf',
            'title' => 'Commercial Film Portfolio',
            'description' => '광고/CF 포트폴리오 샘플입니다.',
            'thumbnail_url' => 'https://img.youtube.com/vi/ysz5S6PUM-U/hqdefault.jpg',
            'channel_title' => 'BDPRODUCTION',
            'published_at' => date('Y-m-d H:i:s', strtotime('-3 days')),
            'position' => 2,
            'source' => 'mock',
            'is_new' => true,
            'embed_url' => '',
            'watch_url' => '',
        ],
        [
            'video_id' => 'mock-music',
            'title' => 'Music Video Production',
            'description' => '뮤직비디오 포트폴리오 샘플입니다.',
            'thumbnail_url' => 'https://img.youtube.com/vi/jNQXAC9IVRw/hqdefault.jpg',
            'channel_title' => 'BDPRODUCTION',
            'published_at' => date('Y-m-d H:i:s', strtotime('-12 days')),
            'position' => 3,
            'source' => 'mock',
            'is_new' => false,
            'embed_url' => '',
            'watch_url' => '',
        ],
    ];
}

function sendJsonResponse(int $statusCode, array $payload): void
{
    http_response_code($statusCode);

    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    exit;
}