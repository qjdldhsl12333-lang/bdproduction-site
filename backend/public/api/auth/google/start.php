<?php
require_once __DIR__.'/../../../../config/env.php';
$c=trim((string)envValue('GOOGLE_CLIENT_ID',''));
$r=trim((string)envValue('GOOGLE_REDIRECT_URI',''));
if($c===''||$r===''){http_response_code(500);die('Google OAuth is not configured.');}
$q=http_build_query(['client_id'=>$c,'redirect_uri'=>$r,'response_type'=>'code','scope'=>'openid email profile','prompt'=>'select_account']);
http