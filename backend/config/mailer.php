<?php

declare(strict_types=1);

require_once __DIR__ . '/env.php';

$autoloadPath = __DIR__ . '/../vendor/autoload.php';

if (is_file($autoloadPath)) {
    require_once $autoloadPath;
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

function isMailEnabled(): bool
{
    return strtolower((string) envValue('MAIL_ENABLED', 'false')) === 'true';
}

function sendContactNotificationEmail(array $contact): array
{
    if (!isMailEnabled()) {
        return [
            'sent' => false,
            'status' => 'skipped',
            'message' => '메일 발송이 비활성화되어 있습니다.',
        ];
    }

    if (!class_exists(PHPMailer::class)) {
        error_log('[BDPRODUCTION Mailer Error] PHPMailer is not installed.');

        return [
            'sent' => false,
            'status' => 'missing_library',
            'message' => 'PHPMailer가 설치되어 있지 않습니다.',
        ];
    }

    $host = (string) envValue('MAIL_HOST', '');
    $port = (int) envValue('MAIL_PORT', '587');
    $secure = strtolower((string) envValue('MAIL_SECURE', 'tls'));
    $username = (string) envValue('MAIL_USERNAME', '');
    $password = (string) envValue('MAIL_PASSWORD', '');
    $fromAddress = (string) envValue('MAIL_FROM_ADDRESS', '');
    $fromName = (string) envValue('MAIL_FROM_NAME', 'BDPRODUCTION');
    $toAddressList = (string) envValue('MAIL_TO_ADDRESS', '');

    if ($host === '' || $fromAddress === '' || $toAddressList === '') {
        error_log('[BDPRODUCTION Mailer Error] Missing SMTP configuration.');

        return [
            'sent' => false,
            'status' => 'invalid_config',
            'message' => '메일 설정값이 부족합니다.',
        ];
    }

    try {
        $mail = new PHPMailer(true);

        $mail->CharSet = 'UTF-8';
        $mail->Encoding = 'base64';

        $mail->isSMTP();
        $mail->Host = $host;
        $mail->Port = $port;

        if ($username !== '' || $password !== '') {
            $mail->SMTPAuth = true;
            $mail->Username = $username;
            $mail->Password = $password;
        }

        if ($secure === 'tls') {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        } elseif ($secure === 'ssl') {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        }

        $mail->setFrom($fromAddress, $fromName);

        $recipients = array_filter(array_map('trim', explode(',', $toAddressList)));

        foreach ($recipients as $recipient) {
            $mail->addAddress($recipient);
        }

        $contactName = (string) ($contact['name'] ?? '이름 없음');

        $mail->Subject = '[BDPRODUCTION] 새 문의 접수 - ' . $contactName;
        $mail->isHTML(true);
        $mail->Body = buildContactNotificationHtml($contact);
        $mail->AltBody = buildContactNotificationText($contact);

        $mail->send();

        return [
            'sent' => true,
            'status' => 'sent',
            'message' => '메일이 발송되었습니다.',
        ];
    } catch (Exception $error) {
        error_log('[BDPRODUCTION Mailer PHPMailer Error] ' . $error->getMessage());

        return [
            'sent' => false,
            'status' => 'failed',
            'message' => '메일 발송에 실패했습니다.',
        ];
    } catch (Throwable $error) {
        error_log('[BDPRODUCTION Mailer Error] ' . $error->getMessage());

        return [
            'sent' => false,
            'status' => 'failed',
            'message' => '메일 발송 중 알 수 없는 오류가 발생했습니다.',
        ];
    }
}

function buildContactNotificationHtml(array $contact): string
{
    $rows = [
        '문의 ID' => (string) ($contact['id'] ?? '-'),
        '이름 / 회사명' => (string) ($contact['name'] ?? '-'),
        '연락처' => (string) ($contact['phone'] ?? '-'),
        '이메일' => (string) ($contact['email'] ?? '-'),
        '제작 유형' => (string) ($contact['production_type'] ?? '-'),
        '예산 범위' => (string) ($contact['budget_range'] ?? '-'),
        '상태' => (string) ($contact['status'] ?? 'new'),
        '접수 경로' => (string) ($contact['source'] ?? 'website'),
        '접수 시간' => (string) ($contact['created_at'] ?? date('Y-m-d H:i:s')),
    ];

    $htmlRows = '';

    foreach ($rows as $label => $value) {
        $htmlRows .= sprintf(
            '<tr><th style="text-align:left;padding:10px;border:1px solid #ddd;background:#f7f7f7;">%s</th><td style="padding:10px;border:1px solid #ddd;">%s</td></tr>',
            htmlspecialchars($label, ENT_QUOTES, 'UTF-8'),
            nl2br(htmlspecialchars($value, ENT_QUOTES, 'UTF-8'))
        );
    }

    $message = nl2br(htmlspecialchars((string) ($contact['message'] ?? '-'), ENT_QUOTES, 'UTF-8'));

    return <<<HTML
<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>BDPRODUCTION 새 문의 접수</title>
</head>
<body style="font-family:Arial, sans-serif; color:#222; line-height:1.6;">
  <h2 style="margin:0 0 16px;">BDPRODUCTION 새 문의가 접수되었습니다.</h2>

  <table style="border-collapse:collapse;width:100%;max-width:720px;margin-bottom:18px;">
    {$htmlRows}
  </table>

  <h3 style="margin:20px 0 8px;">문의 내용</h3>
  <div style="max-width:720px;padding:14px;border:1px solid #ddd;background:#fafafa;">
    {$message}
  </div>

  <p style="margin-top:20px;color:#666;font-size:13px;">
    관리자 페이지에서 문의 상태를 확인하고 처리해주세요.
  </p>
</body>
</html>
HTML;
}

function buildContactNotificationText(array $contact): string
{
    return implode(PHP_EOL, [
        'BDPRODUCTION 새 문의가 접수되었습니다.',
        '',
        '문의 ID: ' . (string) ($contact['id'] ?? '-'),
        '이름 / 회사명: ' . (string) ($contact['name'] ?? '-'),
        '연락처: ' . (string) ($contact['phone'] ?? '-'),
        '이메일: ' . (string) ($contact['email'] ?? '-'),
        '제작 유형: ' . (string) ($contact['production_type'] ?? '-'),
        '예산 범위: ' . (string) ($contact['budget_range'] ?? '-'),
        '상태: ' . (string) ($contact['status'] ?? 'new'),
        '접수 경로: ' . (string) ($contact['source'] ?? 'website'),
        '접수 시간: ' . (string) ($contact['created_at'] ?? date('Y-m-d H:i:s')),
        '',
        '문의 내용:',
        (string) ($contact['message'] ?? '-'),
    ]);
}

function sendAdminLoginLockAlertEmail(array $alert): array
{
    if (!isMailEnabled()) {
        return [
            'sent' => false,
            'status' => 'skipped',
            'message' => '메일 발송이 비활성화되어 있습니다.',
        ];
    }

    if (!class_exists(PHPMailer::class)) {
        error_log('[BDPRODUCTION Admin Security Mail Error] PHPMailer is not installed.');

        return [
            'sent' => false,
            'status' => 'missing_library',
            'message' => 'PHPMailer가 설치되어 있지 않습니다.',
        ];
    }

    $host = (string) envValue('MAIL_HOST', '');
    $port = (int) envValue('MAIL_PORT', '587');
    $secure = strtolower((string) envValue('MAIL_SECURE', 'tls'));
    $username = (string) envValue('MAIL_USERNAME', '');
    $password = (string) envValue('MAIL_PASSWORD', '');
    $fromAddress = (string) envValue('MAIL_FROM_ADDRESS', '');
    $fromName = (string) envValue('MAIL_FROM_NAME', 'BDPRODUCTION');

    // 문의 알림 수신자와 분리된 보안 알림 전용 수신자
    $toAddressList = (string) envValue('ADMIN_SECURITY_ALERT_TO_ADDRESS', '');

    if ($host === '' || $fromAddress === '' || $toAddressList === '') {
        error_log('[BDPRODUCTION Admin Security Mail Error] Missing security mail configuration.');

        return [
            'sent' => false,
            'status' => 'invalid_config',
            'message' => '보안 알림 메일 설정값이 부족합니다.',
        ];
    }

    try {
        $mail = new PHPMailer(true);

        $mail->CharSet = 'UTF-8';
        $mail->Encoding = 'base64';

        $mail->isSMTP();
        $mail->Host = $host;
        $mail->Port = $port;

        if ($username !== '' || $password !== '') {
            $mail->SMTPAuth = true;
            $mail->Username = $username;
            $mail->Password = $password;
        }

        if ($secure === 'tls') {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        } elseif ($secure === 'ssl') {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        }

        $mail->setFrom($fromAddress, $fromName);

        $recipients = array_filter(array_map('trim', explode(',', $toAddressList)));

        foreach ($recipients as $recipient) {
            $mail->addAddress($recipient);
        }

        $mail->Subject = '[BDPRODUCTION] 관리자 로그인 제한 알림';
        $mail->isHTML(true);
        $mail->Body = buildAdminLoginLockAlertHtml($alert);
        $mail->AltBody = buildAdminLoginLockAlertText($alert);

        $mail->send();

        return [
            'sent' => true,
            'status' => 'sent',
            'message' => '보안 알림 메일이 발송되었습니다.',
        ];
    } catch (Exception $error) {
        error_log('[BDPRODUCTION Admin Security Mail PHPMailer Error] ' . $error->getMessage());

        return [
            'sent' => false,
            'status' => 'failed',
            'message' => '보안 알림 메일 발송에 실패했습니다.',
        ];
    } catch (Throwable $error) {
        error_log('[BDPRODUCTION Admin Security Mail Error] ' . $error->getMessage());

        return [
            'sent' => false,
            'status' => 'failed',
            'message' => '보안 알림 메일 발송 중 알 수 없는 오류가 발생했습니다.',
        ];
    }
}

function buildAdminLoginLockAlertHtml(array $alert): string
{
    $rows = [
        '발생 시간' => (string) ($alert['occurred_at'] ?? date('Y-m-d H:i:s')),
        'IP 주소' => (string) ($alert['ip_address'] ?? '-'),
        '브라우저 정보' => (string) ($alert['user_agent'] ?? '-'),
        '실패 횟수' => (string) ($alert['failed_count'] ?? '-'),
        '잠금 시간' => (string) ($alert['lock_seconds'] ?? '-') . '초',
        '잠금 해제 예정' => (string) ($alert['locked_until'] ?? '-'),
    ];

    $htmlRows = '';

    foreach ($rows as $label => $value) {
        $htmlRows .= sprintf(
            '<tr><th style="text-align:left;padding:10px;border:1px solid #ddd;background:#f7f7f7;">%s</th><td style="padding:10px;border:1px solid #ddd;">%s</td></tr>',
            htmlspecialchars($label, ENT_QUOTES, 'UTF-8'),
            nl2br(htmlspecialchars($value, ENT_QUOTES, 'UTF-8'))
        );
    }

    return <<<HTML
<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>관리자 로그인 제한 알림</title>
</head>
<body style="font-family:Arial, sans-serif; color:#222; line-height:1.6;">
  <h2 style="margin:0 0 16px;">BDPRODUCTION 관리자 로그인 제한 알림</h2>

  <p>
    관리자 로그인 비밀번호가 여러 번 잘못 입력되어 로그인이 일시적으로 제한되었습니다.
  </p>

  <table style="border-collapse:collapse;width:100%;max-width:720px;margin-top:18px;">
    {$htmlRows}
  </table>

  <p style="margin-top:20px;color:#b00020;font-size:13px;">
    본인이 시도한 것이 아니라면 관리자 비밀번호 변경과 서버 접근 기록 확인을 권장합니다.
  </p>
</body>
</html>
HTML;
}

function buildAdminLoginLockAlertText(array $alert): string
{
    return implode(PHP_EOL, [
        'BDPRODUCTION 관리자 로그인 제한 알림',
        '',
        '관리자 로그인 비밀번호가 여러 번 잘못 입력되어 로그인이 일시적으로 제한되었습니다.',
        '',
        '발생 시간: ' . (string) ($alert['occurred_at'] ?? date('Y-m-d H:i:s')),
        'IP 주소: ' . (string) ($alert['ip_address'] ?? '-'),
        '브라우저 정보: ' . (string) ($alert['user_agent'] ?? '-'),
        '실패 횟수: ' . (string) ($alert['failed_count'] ?? '-'),
        '잠금 시간: ' . (string) ($alert['lock_seconds'] ?? '-') . '초',
        '잠금 해제 예정: ' . (string) ($alert['locked_until'] ?? '-'),
        '',
        '본인이 시도한 것이 아니라면 관리자 비밀번호 변경과 서버 접근 기록 확인을 권장합니다.',
    ]);
}

function sendAdminUnlockCodeEmail(array $alert): array
{
    if (!isMailEnabled()) {
        return [
            'sent' => false,
            'status' => 'skipped',
            'message' => '메일 발송이 비활성화되어 있습니다.',
        ];
    }

    if (!class_exists(PHPMailer::class)) {
        error_log('[BDPRODUCTION Admin Unlock Mail Error] PHPMailer is not installed.');

        return [
            'sent' => false,
            'status' => 'missing_library',
            'message' => 'PHPMailer가 설치되어 있지 않습니다.',
        ];
    }

    $host = (string)envValue('MAIL_HOST', '');
    $port = (int)envValue('MAIL_PORT', '587');
    $secure = strtolower((string)envValue('MAIL_SECURE', 'tls'));
    $username = (string)envValue('MAIL_USERNAME', '');
    $password = (string)envValue('MAIL_PASSWORD', '');
    $fromAddress = (string)envValue('MAIL_FROM_ADDRESS', '');
    $fromName = (string)envValue('MAIL_FROM_NAME', 'BDPRODUCTION');
    $toAddressList = (string)envValue('ADMIN_SECURITY_ALERT_TO_ADDRESS', '');

    if ($host === '' || $fromAddress === '' || $toAddressList === '') {
        error_log('[BDPRODUCTION Admin Unlock Mail Error] Missing security mail configuration.');

        return [
            'sent' => false,
            'status' => 'invalid_config',
            'message' => '보안 알림 메일 설정값이 부족합니다.',
        ];
    }

    try {
        $mail = new PHPMailer(true);

        $mail->CharSet = 'UTF-8';
        $mail->Encoding = 'base64';

        $mail->isSMTP();
        $mail->Host = $host;
        $mail->Port = $port;

        if ($username !== '' || $password !== '') {
            $mail->SMTPAuth = true;
            $mail->Username = $username;
            $mail->Password = $password;
        }

        if ($secure === 'tls') {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        } elseif ($secure === 'ssl') {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        }

        $mail->setFrom($fromAddress, $fromName);

        $recipients = array_filter(array_map('trim', explode(',', $toAddressList)));

        foreach ($recipients as $recipient) {
            $mail->addAddress($recipient);
        }

        $mail->Subject = '[BDPRODUCTION] 관리자 로그인 잠금 해제 코드';
        $mail->isHTML(true);
        $mail->Body = buildAdminUnlockCodeHtml($alert);
        $mail->AltBody = buildAdminUnlockCodeText($alert);

        $mail->send();

        return [
            'sent' => true,
            'status' => 'sent',
            'message' => '잠금 해제 코드 메일이 발송되었습니다.',
        ];
    } catch (Exception $error) {
        error_log('[BDPRODUCTION Admin Unlock Mail PHPMailer Error] ' . $error->getMessage());

        return [
            'sent' => false,
            'status' => 'failed',
            'message' => '잠금 해제 코드 메일 발송에 실패했습니다.',
        ];
    } catch (Throwable $error) {
        error_log('[BDPRODUCTION Admin Unlock Mail Error] ' . $error->getMessage());

        return [
            'sent' => false,
            'status' => 'failed',
            'message' => '잠금 해제 코드 메일 발송 중 알 수 없는 오류가 발생했습니다.',
        ];
    }
}

function buildAdminUnlockCodeHtml(array $alert): string
{
    $unlockCode = htmlspecialchars((string)($alert['unlock_code'] ?? '-'), ENT_QUOTES, 'UTF-8');

    $rows = [
        '발생 시간' => (string)($alert['occurred_at'] ?? date('Y-m-d H:i:s')),
        'IP 주소' => (string)($alert['ip_address'] ?? '-'),
        '브라우저 정보' => (string)($alert['user_agent'] ?? '-'),
        '실패 횟수' => (string)($alert['failed_count'] ?? '-'),
        '코드 만료 시간' => (string)($alert['expires_at'] ?? '-'),
    ];

    $htmlRows = '';

    foreach ($rows as $label => $value) {
        $htmlRows .= sprintf(
            '<tr><th style="text-align:left;padding:10px;border:1px solid #ddd;background:#f7f7f7;">%s</th><td style="padding:10px;border:1px solid #ddd;">%s</td></tr>',
            htmlspecialchars($label, ENT_QUOTES, 'UTF-8'),
            nl2br(htmlspecialchars($value, ENT_QUOTES, 'UTF-8'))
        );
    }

    return <<<HTML
<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>관리자 로그인 잠금 해제 코드</title>
</head>
<body style="font-family:Arial, sans-serif; color:#222; line-height:1.6;">
  <h2 style="margin:0 0 16px;">BDPRODUCTION 관리자 로그인 잠금</h2>

  <p>관리자 비밀번호가 여러 번 잘못 입력되어 로그인이 잠겼습니다.</p>

  <div style="max-width:420px;margin:20px 0;padding:18px;border:1px solid #d8b76a;background:#fff8e5;">
    <div style="font-size:13px;color:#666;margin-bottom:8px;">잠금 해제 코드</div>
    <div style="font-size:32px;font-weight:800;letter-spacing:4px;color:#111;">{$unlockCode}</div>
  </div>

  <table style="border-collapse:collapse;width:100%;max-width:720px;margin-top:18px;">
    {$htmlRows}
  </table>

  <p style="margin-top:20px;color:#b00020;font-size:13px;">
    이 코드는 로그인 잠금만 해제합니다. 잠금 해제 후 관리자 비밀번호로 다시 로그인해야 합니다.
    본인이 시도한 것이 아니라면 관리자 비밀번호 변경을 권장합니다.
  </p>
</body>
</html>
HTML;
}

function buildAdminUnlockCodeText(array $alert): string
{
    return implode(PHP_EOL, [
        'BDPRODUCTION 관리자 로그인 잠금 해제 코드',
        '',
        '관리자 비밀번호가 여러 번 잘못 입력되어 로그인이 잠겼습니다.',
        '',
        '잠금 해제 코드: ' . (string)($alert['unlock_code'] ?? '-'),
        '',
        '발생 시간: ' . (string)($alert['occurred_at'] ?? date('Y-m-d H:i:s')),
        'IP 주소: ' . (string)($alert['ip_address'] ?? '-'),
        '브라우저 정보: ' . (string)($alert['user_agent'] ?? '-'),
        '실패 횟수: ' . (string)($alert['failed_count'] ?? '-'),
        '코드 만료 시간: ' . (string)($alert['expires_at'] ?? '-'),
        '',
        '이 코드는 로그인 잠금만 해제합니다. 잠금 해제 후 관리자 비밀번호로 다시 로그인해야 합니다.',
    ]);
}