<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../config/customer_auth.php';

bdHandleCustomerCors();
bdStartCustomerSession();

unset($_SESSION['customer_user_id']);

bdSendJson([
    'success' => true,
    'message' => '로그아웃되었습니다.',
]);
