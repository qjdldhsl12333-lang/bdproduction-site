<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../config/db.php';
require_once __DIR__ . '/../../../config/youtube.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(405, [
        'success' => false,
        'message' => 'POST 요청만 허용됩니다.',
    ]);
}

$providedToken = $_SERVER['HTTP_X_SYNC_TOKEN'] ?? ($_GET['token'] ?? '');
$syncToken = getYoutubeSyncToken();

if ($syncToken === '' || !hash_equals($syncToken, (string)$providedToken)) {
    sendJsonResponse(401, [
        'success' => false,
        'message' => 'YouTube 동기화 권한이 없습니다.',
    ]);
}

$fetchResult = fetchYoutubePlaylistItems();

if (($fetchResult['success'] ?? false) !== true) {
    sendJsonResponse(200, [
        'success' => true,
        'synced' => false,
        'status' => $fetchResult['status'] ?? 'skipped',
        'message' => $fetchResult['message'] ?? 'YouTube 동기화를 건너뛰었습니다.',
    ]);
}

try {
    $pdo = getDatabaseConnection();
    $pdo->beginTransaction();

    $items = $fetchResult['items'] ?? [];
    $syncedCount = 0;

    foreach ($items as $index => $item) {
        $video = normalizeYoutubePlaylistItem($item, $index + 1);

        if ($video === null) {
            continue;
        }

        $statement = $pdo->prepare(
            'INSERT INTO youtube_videos (
                video_id,
                title,
                description,
                thumbnail_url,
                channel_title,
                published_at,
                position,
                is_active,
                source
            ) VALUES (
                :video_id,
                :title,
                :description,
                :thumbnail_url,
                :channel_title,
                :published_at,
                :position,
                1,
                "youtube"
            )
            ON DUPLICATE KEY UPDATE
                title = VALUES(title),
                description = VALUES(description),
                thumbnail_url = VALUES(thumbnail_url),
                channel_title = VALUES(channel_title),
                published_at = VALUES(published_at),
                position = VALUES(position),
                is_active = 1,
                source = "youtube",
                updated_at = CURRENT_TIMESTAMP'
        );

        $statement->execute([
            ':video_id' => $video['video_id'],
            ':title' => $video['title'],
            ':description' => $video['description'],
            ':thumbnail_url' => $video['thumbnail_url'],
            ':channel_title' => $video['channel_title'],
            ':published_at' => $video['published_at'],
            ':position' => $video['position'],
        ]);

        $syncedCount++;
    }

    $pdo->commit();

    sendJsonResponse(200, [
        'success' => true,
        'synced' => true,
        'count' => $syncedCount,
        'message' => 'YouTube 포트폴리오 동기화가 완료되었습니다.',
    ]);
} catch (PDOException $error) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log('[BDPRODUCTION YouTube Sync DB Error] ' . $error->getMessage());

    sendJsonResponse(500, [
        'success' => false,
        'message' => 'YouTube 포트폴리오 동기화 중 DB 오류가 발생했습니다.',
    ]);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log('[BDPRODUCTION YouTube Sync Error] ' . $error->getMessage());

    sendJsonResponse(500, [
        'success' => false,
        'message' => 'YouTube 포트폴리오 동기화 중 오류가 발생했습니다.',
    ]);
}

function sendJsonResponse(int $statusCode, array $payload): void
{
    http_response_code($statusCode);

    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    exit;
}