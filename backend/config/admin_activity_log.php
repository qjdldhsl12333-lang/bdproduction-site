<?php

declare(strict_types=1);

function createAdminContactActivityLog(
    PDO $pdo,
    int $contactId,
    string $action,
    ?string $previousStatus,
    ?string $nextStatus,
    ?string $note = null
): void {
    $statement = $pdo->prepare(
        'INSERT INTO contact_activity_logs (
            contact_id,
            action,
            previous_status,
            next_status,
            note,
            ip_address,
            user_agent
        ) VALUES (
            :contact_id,
            :action,
            :previous_status,
            :next_status,
            :note,
            :ip_address,
            :user_agent
        )'
    );

    $statement->execute([
        ':contact_id' => $contactId,
        ':action' => $action,
        ':previous_status' => $previousStatus,
        ':next_status' => $nextStatus,
        ':note' => $note,
        ':ip_address' => getAdminActivityClientIp(),
        ':user_agent' => getAdminActivityUserAgent(),
    ]);
}

function resolveContactActivityAction(string $previousStatus, string $nextStatus): string
{
    if ($nextStatus === 'archived') {
        return 'archive';
    }

    if ($previousStatus === 'archived' && $nextStatus === 'new') {
        return 'restore';
    }

    return 'status_change';
}

function resolveContactActivityNote(string $previousStatus, string $nextStatus): string
{
    return match (resolveContactActivityAction($previousStatus, $nextStatus)) {
        'archive' => '문의가 보관 처리되었습니다.',
        'restore' => '보관된 문의가 신규 상태로 복구되었습니다.',
        default => '문의 상태가 변경되었습니다.',
    };
}

function getAdminActivityClientIp(): string
{
    $forwardedFor = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';

    if ($forwardedFor !== '') {
        $parts = array_map('trim', explode(',', $forwardedFor));
        $firstIp = $parts[0] ?? '';

        if ($firstIp !== '') {
            return substr($firstIp, 0, 45);
        }
    }

    $clientIp = $_SERVER['HTTP_CF_CONNECTING_IP']
        ?? $_SERVER['HTTP_X_REAL_IP']
        ?? $_SERVER['REMOTE_ADDR']
        ?? 'unknown';

    return substr((string)$clientIp, 0, 45);
}

function getAdminActivityUserAgent(): string
{
    return substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 1000);
}
