<?php

declare(strict_types=1);

require_once __DIR__ . '/env.php';

function getContactRateLimitFilePath(): string
{
    $storageDir = __DIR__ . '/../storage';

    if (!is_dir($storageDir)) {
        mkdir($storageDir, 0775, true);
    }

    return $storageDir . '/contact_submissions.json';
}

function getContactMaxAttempts(): int
{
    $maxAttempts = (int)envValue('CONTACT_MAX_ATTEMPTS', '5');

    if ($maxAttempts <= 0) {
        return 5;
    }

    return $maxAttempts;
}

function getContactRateLimitSeconds(): int
{
    $seconds = (int)envValue('CONTACT_RATE_LIMIT_SECONDS', '600');

    if ($seconds <= 0) {
        return 600;
    }

    return $seconds;
}

function getContactMessageMinLength(): int
{
    $length = (int)envValue('CONTACT_MESSAGE_MIN_LENGTH', '5');

    if ($length <= 0) {
        return 5;
    }

    return $length;
}

function getContactMessageMaxLength(): int
{
    $length = (int)envValue('CONTACT_MESSAGE_MAX_LENGTH', '2000');

    if ($length <= 0) {
        return 2000;
    }

    return $length;
}

function getContactClientKey(): string
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

    return hash('sha256', $ip);
}

function readContactSubmissions(): array
{
    $filePath = getContactRateLimitFilePath();

    if (!is_file($filePath)) {
        return [];
    }

    $contents = file_get_contents($filePath);

    if ($contents === false || trim($contents) === '') {
        return [];
    }

    $data = json_decode($contents, true);

    if (!is_array($data)) {
        return [];
    }

    return $data;
}

function writeContactSubmissions(array $submissions): void
{
    $filePath = getContactRateLimitFilePath();

    file_put_contents(
        $filePath,
        json_encode($submissions, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT),
        LOCK_EX
    );
}

function cleanupContactSubmissions(array $submissions): array
{
    $now = time();
    $limitSeconds = getContactRateLimitSeconds();

    foreach ($submissions as $key => $timestamps) {
        if (!is_array($timestamps)) {
            unset($submissions[$key]);
            continue;
        }

        $timestamps = array_values(array_filter($timestamps, static function ($timestamp) use ($now, $limitSeconds): bool {
            return is_numeric($timestamp) && ($now - (int)$timestamp) <= $limitSeconds;
        }));

        if (count($timestamps) === 0) {
            unset($submissions[$key]);
        } else {
            $submissions[$key] = $timestamps;
        }
    }

    return $submissions;
}

function getContactRateLimitStatus(): array
{
    $submissions = cleanupContactSubmissions(readContactSubmissions());
    writeContactSubmissions($submissions);

    $key = getContactClientKey();
    $timestamps = $submissions[$key] ?? [];

    if (!is_array($timestamps)) {
        $timestamps = [];
    }

    $count = count($timestamps);
    $maxAttempts = getContactMaxAttempts();
    $remainingAttempts = max(0, $maxAttempts - $count);

    $oldestTimestamp = $timestamps[0] ?? 0;
    $resetSeconds = 0;

    if ($oldestTimestamp > 0) {
        $resetSeconds = max(0, getContactRateLimitSeconds() - (time() - (int)$oldestTimestamp));
    }

    return [
        'limited' => $count >= $maxAttempts,
        'count' => $count,
        'remainingAttempts' => $remainingAttempts,
        'resetSeconds' => $resetSeconds,
    ];
}

function recordContactSubmission(): void
{
    $submissions = cleanupContactSubmissions(readContactSubmissions());

    $key = getContactClientKey();
    $timestamps = $submissions[$key] ?? [];

    if (!is_array($timestamps)) {
        $timestamps = [];
    }

    $timestamps[] = time();

    $submissions[$key] = $timestamps;

    writeContactSubmissions($submissions);
}

function formatContactRateLimitTime(int $seconds): string
{
    if ($seconds <= 60) {
        return $seconds . '초';
    }

    return (int)ceil($seconds / 60) . '분';
}