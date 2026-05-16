<?php

declare(strict_types=1);

require_once __DIR__ . '/env.php';

function isYoutubeEnabled(): bool
{
    return strtolower((string)envValue('YOUTUBE_ENABLED', 'false')) === 'true';
}

function getYoutubeApiKey(): string
{
    return (string)envValue('YOUTUBE_API_KEY', '');
}

function getYoutubePlaylistId(): string
{
    return (string)envValue('YOUTUBE_PLAYLIST_ID', '');
}

function getYoutubeMaxResults(): int
{
    $maxResults = (int)envValue('YOUTUBE_MAX_RESULTS', '6');

    if ($maxResults <= 0) {
        return 6;
    }

    return min($maxResults, 50);
}

function getYoutubeNewDays(): int
{
    $newDays = (int)envValue('YOUTUBE_NEW_DAYS', '7');

    if ($newDays <= 0) {
        return 7;
    }

    return $newDays;
}

function getYoutubeSyncToken(): string
{
    return (string)envValue('YOUTUBE_SYNC_TOKEN', '');
}

function fetchYoutubePlaylistItems(): array
{
    $apiKey = getYoutubeApiKey();
    $playlistId = getYoutubePlaylistId();
    $maxResults = getYoutubeMaxResults();

    if (!isYoutubeEnabled() || $apiKey === '' || $playlistId === '') {
        return [
            'success' => false,
            'status' => 'disabled_or_missing_config',
            'items' => [],
            'message' => 'YouTube 설정이 비활성화되어 있거나 API Key/Playlist ID가 없습니다.',
        ];
    }

    $query = http_build_query([
        'part' => 'snippet',
        'playlistId' => $playlistId,
        'maxResults' => $maxResults,
        'key' => $apiKey,
    ]);

    $url = 'https://www.googleapis.com/youtube/v3/playlistItems?' . $query;

    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'timeout' => 12,
            'ignore_errors' => true,
        ],
    ]);

    $responseBody = file_get_contents($url, false, $context);

    if ($responseBody === false) {
        return [
            'success' => false,
            'status' => 'request_failed',
            'items' => [],
            'message' => 'YouTube API 요청에 실패했습니다.',
        ];
    }

    $data = json_decode($responseBody, true);

    if (!is_array($data)) {
        return [
            'success' => false,
            'status' => 'invalid_response',
            'items' => [],
            'message' => 'YouTube API 응답 형식이 올바르지 않습니다.',
        ];
    }

    if (isset($data['error'])) {
        return [
            'success' => false,
            'status' => 'youtube_error',
            'items' => [],
            'message' => $data['error']['message'] ?? 'YouTube API 오류가 발생했습니다.',
        ];
    }

    return [
        'success' => true,
        'status' => 'fetched',
        'items' => $data['items'] ?? [],
        'message' => 'YouTube 영상 목록을 가져왔습니다.',
    ];
}

function normalizeYoutubePlaylistItem(array $item, int $position): ?array
{
    $snippet = $item['snippet'] ?? [];
    $resourceId = $snippet['resourceId'] ?? [];
    $videoId = (string)($resourceId['videoId'] ?? '');

    if ($videoId === '') {
        return null;
    }

    $thumbnails = $snippet['thumbnails'] ?? [];
    $thumbnailUrl =
        $thumbnails['maxres']['url']
        ?? $thumbnails['standard']['url']
        ?? $thumbnails['high']['url']
        ?? $thumbnails['medium']['url']
        ?? $thumbnails['default']['url']
        ?? null;

    return [
        'video_id' => $videoId,
        'title' => (string)($snippet['title'] ?? 'Untitled'),
        'description' => (string)($snippet['description'] ?? ''),
        'thumbnail_url' => $thumbnailUrl,
        'channel_title' => (string)($snippet['channelTitle'] ?? ''),
        'published_at' => normalizeYoutubeDateTime((string)($snippet['publishedAt'] ?? '')),
        'position' => $position,
    ];
}

function normalizeYoutubeDateTime(string $value): ?string
{
    if ($value === '') {
        return null;
    }

    $timestamp = strtotime($value);

    if ($timestamp === false) {
        return null;
    }

    return date('Y-m-d H:i:s', $timestamp);
}

function isYoutubeVideoNew(?string $publishedAt): bool
{
    if ($publishedAt === null || $publishedAt === '') {
        return false;
    }

    $timestamp = strtotime($publishedAt);

    if ($timestamp === false) {
        return false;
    }

    $newSeconds = getYoutubeNewDays() * 86400;

    return (time() - $timestamp) <= $newSeconds;
}
