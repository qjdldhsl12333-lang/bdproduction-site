<?php
require_once __DIR__.'/../../../../config/env.php';
$clientId=trim((string)envValue('GOOGLE_CLIENT_ID',''));
$redirectUri=trim((string)envValue('GOOGLE_REDIRECT_URI',''));
if($clientId===''||$redirectUri===''){
    http_response_code(500);
    echo 'Google OAuth is not configured.';
    exit;
}
$url='https://accounts.google.com/o/oauth2/v2/auth';
$url.='?client_id='.rawurlencode($clientId);
$url.='&redirect_uri='.rawurlencode($redirectUri);
$url.='&response_type=code';
$url.='&scope='.rawurlencode('openid email profile');
$url.='&prompt=select_account';
header('Location