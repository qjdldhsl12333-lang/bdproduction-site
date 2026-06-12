<?php

declare(strict_types=1);

require_once __DIR__ . '/env.php';

function bdNaverEnv(string $key, string $default = ''): string
{
    return trim((string) envValue($key, $default));
}

function bdNaverFrontendBaseUrl(): string
{
    $baseUrl = bdNaverEnv('FRONTEND_APP_URL', 'http://localhost:5173');

    return rtrim($baseUrl, '/');
}

function bdNaverRedirectToFrontend(string $path = '/mypage', array $query = []): void
{
    $baseUrl = bdNaverFrontendBaseUrl();
    $path = '/' . ltrim($path, '/');

    $url = $baseUrl . $path;

    if ($query !== []) {
        $url .= '?' . http_build_query($query);
    }

    header('Location: ' . $url, true, 302);
    exit;
}

function bdNaverFail(string $reason): void
{
    bdNaverRedirectToFrontend('/', [
        'auth' => 'naver_error',
        'reason' => $reason,
    ]);
}

function bdNaverCreateState(): string
{
    return rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
}

function bdNaverHttpStatusFromHeaders(array $headers): int
{
    $statusCode = 0;

    foreach ($headers as $header) {
        if (preg_match('/^HTTP\/\S+\s+(\d+)/', $header, $matches) === 1) {
            $statusCode = (int) $matches[1];
        }
    }

    return $statusCode;
}

function bdNaverDecodeJson(string $body, string $context): array
{
    $decoded = json_decode($body, true);

    if (!is_array($decoded)) {
        throw new RuntimeException($context . ' 응답 JSON을 해석할 수 없습니다.');
    }

    return $decoded;
}

function bdNaverGetJson(string $url, array $headers = []): array
{
    if (function_exists('curl_init')) {
        $ch = curl_init($url);

        if ($ch === false) {
            throw new RuntimeException('cURL을 초기화할 수 없습니다.');
        }

        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 15,
        ]);

        $body = curl_exec($ch);
        $statusCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);

        curl_close($ch);

        if ($body === false) {
            throw new RuntimeException('Naver 요청 실패: ' . $error);
        }

        if ($statusCode < 200 || $statusCode >= 300) {
            throw new RuntimeException('Naver 요청 실패. HTTP ' . $statusCode . ' / ' . $body);
        }

        return bdNaverDecodeJson((string) $body, 'Naver');
    }

    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => implode("\r\n", $headers),
            'ignore_errors' => true,
            'timeout' => 15,
        ],
    ]);

    $body = file_get_contents($url, false, $context);

    if ($body === false) {
        throw new RuntimeException('Naver 요청에 실패했습니다.');
    }

    $statusCode = bdNaverHttpStatusFromHeaders($http_response_header ?? []);

    if ($statusCode < 200 || $statusCode >= 300) {
        throw new RuntimeException('Naver 요청 실패. HTTP ' . $statusCode . ' / ' . $body);
    }

    return bdNaverDecodeJson((string) $body, 'Naver');
}