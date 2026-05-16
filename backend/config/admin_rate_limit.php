<?php

declare(strict_types=1);

require_once __DIR__ . '/admin.php';

function getAdminRateLimitFilePath(): string
{
    $storageDir = __DIR__ . '/../storage';

    if (!is_dir($storageDir)) {
        mkdir($storageDir, 0775, true);
    }

    return $storageDir . '/admin_login_attempts.json';
}

function getAdminLoginClientKey(): string
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';

    return hash('sha256', $ip . '|' . $userAgent);
}

function readAdminLoginAttempts(): array
{
    $filePath = getAdminRateLimitFilePath();

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

function writeAdminLoginAttempts(array $attempts): void
{
    $filePath = getAdminRateLimitFilePath();

    file_put_contents(
        $filePath,
        json_encode($attempts, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT),
        LOCK_EX
    );
}

function cleanupExpiredAdminLoginAttempts(array $attempts): array
{
    $now = time();

    foreach ($attempts as $key => $record) {
        $updatedAt = (int)($record['updated_at'] ?? 0);
        $isOldUnlockedRecord = empty($record['locked']) && $updatedAt > 0 && ($now - $updatedAt) > 86400;

        if ($isOldUnlockedRecord) {
            unset($attempts[$key]);
        }
    }

    return $attempts;
}

function createAdminUnlockCode(): string
{
    return (string)random_int(100000, 999999);
}

function getAdminLoginAttemptStatus(): array
{
    $attempts = cleanupExpiredAdminLoginAttempts(readAdminLoginAttempts());
    writeAdminLoginAttempts($attempts);

    $key = getAdminLoginClientKey();
    $record = $attempts[$key] ?? [];

    $now = time();
    $failedCount = (int)($record['failed_count'] ?? 0);
    $locked = (bool)($record['locked'] ?? false);
    $unlockCodeExpiresAt = (int)($record['unlock_code_expires_at'] ?? 0);
    $unlockCodeRemainingSeconds = max(0, $unlockCodeExpiresAt - $now);

    return [
        'locked' => $locked,
        'failedCount' => $failedCount,
        'remainingAttempts' => max(0, getAdminLoginMaxAttempts() - $failedCount),
        'unlockCodeExpired' => $locked && $unlockCodeRemainingSeconds <= 0,
        'unlockCodeRemainingSeconds' => $unlockCodeRemainingSeconds,
    ];
}

function recordAdminLoginFailure(): array
{
    $attempts = cleanupExpiredAdminLoginAttempts(readAdminLoginAttempts());

    $key = getAdminLoginClientKey();
    $now = time();

    $record = $attempts[$key] ?? [
        'failed_count' => 0,
        'locked' => false,
        'unlock_code_hash' => '',
        'unlock_code_expires_at' => 0,
        'locked_at' => 0,
        'updated_at' => $now,
    ];

    if ((bool)($record['locked'] ?? false) === true) {
        writeAdminLoginAttempts($attempts);

        $status = getAdminLoginAttemptStatus();
        $status['lockJustCreated'] = false;
        $status['unlockCode'] = null;

        return $status;
    }

    $failedCount = (int)($record['failed_count'] ?? 0) + 1;
    $lockJustCreated = false;
    $unlockCode = null;

    $record['failed_count'] = $failedCount;
    $record['updated_at'] = $now;

    if ($failedCount >= getAdminLoginMaxAttempts()) {
        $unlockCode = createAdminUnlockCode();
        $lockJustCreated = true;

        $record['locked'] = true;
        $record['locked_at'] = $now;
        $record['unlock_code_hash'] = password_hash($unlockCode, PASSWORD_DEFAULT);
        $record['unlock_code_expires_at'] = $now + getAdminUnlockCodeExpiresSeconds();
    }

    $attempts[$key] = $record;

    writeAdminLoginAttempts($attempts);

    $status = getAdminLoginAttemptStatus();
    $status['lockJustCreated'] = $lockJustCreated;
    $status['unlockCode'] = $unlockCode;

    return $status;
}

function verifyAdminUnlockCode(string $unlockCode): array
{
    $attempts = cleanupExpiredAdminLoginAttempts(readAdminLoginAttempts());

    $key = getAdminLoginClientKey();
    $record = $attempts[$key] ?? null;

    if (!is_array($record) || (bool)($record['locked'] ?? false) !== true) {
        return [
            'success' => false,
            'message' => '현재 잠금 상태가 아닙니다.',
        ];
    }

    $now = time();
    $unlockCodeExpiresAt = (int)($record['unlock_code_expires_at'] ?? 0);

    if ($unlockCodeExpiresAt <= 0 || $unlockCodeExpiresAt < $now) {
        return [
            'success' => false,
            'message' => '잠금 해제 코드가 만료되었습니다. 새 코드를 발급받아주세요.',
            'codeExpired' => true,
        ];
    }

    $unlockCodeHash = (string)($record['unlock_code_hash'] ?? '');

    if ($unlockCodeHash === '' || !password_verify($unlockCode, $unlockCodeHash)) {
        return [
            'success' => false,
            'message' => '잠금 해제 코드가 올바르지 않습니다.',
        ];
    }

    unset($attempts[$key]);
    writeAdminLoginAttempts($attempts);

    return [
        'success' => true,
        'message' => '로그인 잠금이 해제되었습니다. 관리자 비밀번호로 다시 로그인해주세요.',
    ];
}

function createAndStoreNewAdminUnlockCode(): array
{
    $attempts = cleanupExpiredAdminLoginAttempts(readAdminLoginAttempts());

    $key = getAdminLoginClientKey();
    $now = time();

    $record = $attempts[$key] ?? [
        'failed_count' => getAdminLoginMaxAttempts(),
        'locked' => true,
        'locked_at' => $now,
        'updated_at' => $now,
    ];

    $unlockCode = createAdminUnlockCode();

    $record['failed_count'] = max((int)($record['failed_count'] ?? 0), getAdminLoginMaxAttempts());
    $record['locked'] = true;
    $record['locked_at'] = (int)($record['locked_at'] ?? $now);
    $record['unlock_code_hash'] = password_hash($unlockCode, PASSWORD_DEFAULT);
    $record['unlock_code_expires_at'] = $now + getAdminUnlockCodeExpiresSeconds();
    $record['updated_at'] = $now;

    $attempts[$key] = $record;

    writeAdminLoginAttempts($attempts);

    return [
        'unlockCode' => $unlockCode,
        'unlockCodeExpiresAt' => $record['unlock_code_expires_at'],
        'unlockCodeRemainingSeconds' => getAdminUnlockCodeExpiresSeconds(),
        'failedCount' => (int)$record['failed_count'],
    ];
}

function clearAdminLoginFailures(): void
{
    $attempts = readAdminLoginAttempts();
    $key = getAdminLoginClientKey();

    if (isset($attempts[$key])) {
        unset($attempts[$key]);
        writeAdminLoginAttempts($attempts);
    }
}