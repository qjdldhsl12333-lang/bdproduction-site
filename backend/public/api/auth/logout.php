<?php

declare(strict_types=1);

require_once __DIR__ . '/../_bootstrap.php';

bdRequireConfig('customer_auth.php');

bdHandleCustomerCors();
bdStartCustomerSession();

unset($_SESSION['customer_user_id']);

bdSendJson([
    'success' => true,
    'message' => '로그아웃되었습니다.',
]);
