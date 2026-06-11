<?php
require_once __DIR__.'/../../../../config/env.php';
$clientId=trim((string)envValue('GOOGLE_CLIENT_ID',''));
$redirectUri=trim((string)envValue('GOOGLE_REDIRECT_URI',''));
if($clientId===''||$redirectUri===''){
    http_response_code(500);
    echo 'Google OAuth is not configured.';
    exit;
}
$query=http_build_query(array(
    'client_id'=>$clientId,
    'redirect_uri'=>$redirectUri,
    'response_type'=>'code',
    'scope'=>'openid email profile',
   