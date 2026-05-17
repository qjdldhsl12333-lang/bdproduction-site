<?php

declare(strict_types=1);

require_once __DIR__ . '/env.php';

function isNotionEnabled(): bool
{
    return strtolower((string)envValue('NOTION_ENABLED', 'false')) === 'true';
}

function getNotionApiToken(): string
{
    return (string)envValue('NOTION_API_TOKEN', '');
}

function getNotionVersion(): string
{
    return (string)envValue('NOTION_VERSION', '2026-03-11');
}

function getNotionContactsParentType(): string
{
    $parentType = strtolower((string)envValue('NOTION_CONTACTS_PARENT_TYPE', 'data_source_id'));

    if (!in_array($parentType, ['data_source_id', 'database_id'], true)) {
        return 'data_source_id';
    }

    return $parentType;
}

function getNotionContactsParentId(): string
{
    return (string)envValue('NOTION_CONTACTS_PARENT_ID', '');
}

function sendContactToNotion(array $contact): array
{
    if (!isNotionEnabled()) {
        return [
            'sent' => false,
            'status' => 'skipped',
            'message' => 'Notion 연동이 비활성화되어 있습니다.',
        ];
    }

    $token = getNotionApiToken();
    $parentId = getNotionContactsParentId();

    if ($token === '' || $parentId === '') {
        error_log('[BDPRODUCTION Notion Error] Missing NOTION_API_TOKEN or NOTION_CONTACTS_PARENT_ID.');

        return [
            'sent' => false,
            'status' => 'invalid_config',
            'message' => 'Notion 설정값이 부족합니다.',
        ];
    }

    $payload = buildNotionContactPayload($contact);

    $response = requestNotionApi('/v1/pages', $payload);

    if (($response['success'] ?? false) !== true) {
        return [
            'sent' => false,
            'status' => $response['status'] ?? 'failed',
            'message' => $response['message'] ?? 'Notion 저장에 실패했습니다.',
        ];
    }

    return [
        'sent' => true,
        'status' => 'sent',
        'message' => 'Notion에 문의가 저장되었습니다.',
        'notionPageId' => $response['data']['id'] ?? null,
        'notionUrl' => $response['data']['url'] ?? null,
    ];
}

function buildNotionContactPayload(array $contact): array
{
    $parentType = getNotionContactsParentType();
    $parentId = getNotionContactsParentId();

    $name = (string)($contact['name'] ?? '이름 없음');
    $phone = (string)($contact['phone'] ?? '');
    $email = (string)($contact['email'] ?? '');
    $productionType = (string)($contact['production_type'] ?? '');
    $budgetRange = (string)($contact['budget_range'] ?? '');
    $message = (string)($contact['message'] ?? '');
    $status = (string)($contact['status'] ?? 'new');
    $source = (string)($contact['source'] ?? 'website');
    $createdAt = (string)($contact['created_at'] ?? date('Y-m-d H:i:s'));
    $contactId = (int)($contact['id'] ?? 0);

    $payload = [
        'parent' => [
            $parentType => $parentId,
        ],
        'properties' => [
            '이름/회사명' => [
                'title' => [
                    [
                        'text' => [
                            'content' => limitNotionText($name, 2000),
                        ],
                    ],
                ],
            ],
            '연락처' => [
                'phone_number' => limitNotionText($phone, 200),
            ],
            '이메일' => [
                'email' => $email !== '' ? limitNotionText($email, 200) : null,
            ],
            '제작 유형' => [
                'select' => $productionType !== ''
                    ? [
                        'name' => limitNotionSelectName($productionType),
                    ]
                    : null,
            ],
            '예산 범위' => [
                'rich_text' => buildNotionRichText($budgetRange),
            ],
            '문의 내용' => [
                'rich_text' => buildNotionRichText($message),
            ],
            '상태' => [
                'select' => [
                    'name' => mapContactStatusToNotionStatus($status),
                ],
            ],
            '접수 경로' => [
                'select' => [
                    'name' => limitNotionSelectName($source),
                ],
            ],
            '접수번호' => [
                'number' => $contactId > 0 ? $contactId : null,
            ],
            '접수일' => [
                'date' => [
                    'start' => formatNotionDate($createdAt),
                ],
            ],
        ],
    ];

    // Notion email property does not accept an empty string.
    if ($email === '') {
        unset($payload['properties']['이메일']);
    }

    if ($productionType === '') {
        unset($payload['properties']['제작 유형']);
    }

    if ($budgetRange === '') {
        unset($payload['properties']['예산 범위']);
    }

    return $payload;
}

function requestNotionApi(string $path, array $payload): array
{
    $url = 'https://api.notion.com' . $path;

    $headers = [
        'Authorization: Bearer ' . getNotionApiToken(),
        'Notion-Version: ' . getNotionVersion(),
        'Content-Type: application/json',
    ];

    $body = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    if ($body === false) {
        return [
            'success' => false,
            'status' => 'json_encode_failed',
            'message' => 'Notion 요청 데이터를 JSON으로 변환하지 못했습니다.',
        ];
    }

    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => implode("\r\n", $headers),
            'content' => $body,
            'timeout' => 12,
            'ignore_errors' => true,
        ],
    ]);

    $responseBody = file_get_contents($url, false, $context);
    $statusCode = parseHttpStatusCode($http_response_header ?? []);

    if ($responseBody === false) {
        error_log('[BDPRODUCTION Notion Error] Request failed.');

        return [
            'success' => false,
            'status' => 'request_failed',
            'message' => 'Notion API 요청에 실패했습니다.',
        ];
    }

    $data = json_decode($responseBody, true);

    if (!is_array($data)) {
        error_log('[BDPRODUCTION Notion Error] Invalid response: ' . $responseBody);

        return [
            'success' => false,
            'status' => 'invalid_response',
            'message' => 'Notion API 응답 형식이 올바르지 않습니다.',
        ];
    }

    if ($statusCode < 200 || $statusCode >= 300) {
        error_log('[BDPRODUCTION Notion API Error] HTTP ' . $statusCode . ' / ' . $responseBody);

        return [
            'success' => false,
            'status' => 'notion_error_' . $statusCode,
            'message' => $data['message'] ?? 'Notion API 오류가 발생했습니다.',
            'data' => $data,
        ];
    }

    return [
        'success' => true,
        'status' => 'sent',
        'message' => 'Notion API 요청이 성공했습니다.',
        'data' => $data,
    ];
}

function parseHttpStatusCode(array $headers): int
{
    if (!isset($headers[0])) {
        return 0;
    }

    if (preg_match('/HTTP\/\S+\s+(\d+)/', $headers[0], $matches)) {
        return (int)$matches[1];
    }

    return 0;
}

function buildNotionRichText(string $value): array
{
    if ($value === '') {
        return [];
    }

    return [
        [
            'text' => [
                'content' => limitNotionText($value, 2000),
            ],
        ],
    ];
}

function limitNotionText(string $value, int $maxLength): string
{
    $value = trim($value);

    if (function_exists('mb_substr')) {
        return mb_substr($value, 0, $maxLength);
    }

    return substr($value, 0, $maxLength);
}

function limitNotionSelectName(string $value): string
{
    return limitNotionText($value, 100);
}

function mapContactStatusToNotionStatus(string $status): string
{
    return match ($status) {
        'checked' => '확인 완료',
        'done' => '처리 완료',
        'archived' => '보관됨',
        default => '신규',
    };
}

function formatNotionDate(string $value): string
{
    $timestamp = strtotime($value);

    if ($timestamp === false) {
        return date('c');
    }

    return date('c', $timestamp);
}