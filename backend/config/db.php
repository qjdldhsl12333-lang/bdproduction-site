<?php

declare(strict_types=1);

require_once __DIR__ . '/env.php';

function getDatabaseConnection(): PDO
{
    $host = envValue('DB_HOST', 'localhost');
    $port = envValue('DB_PORT', '3306');
    $database = envValue('DB_NAME', 'bdproduction');
    $username = envValue('DB_USER', 'root');
    $password = envValue('DB_PASS', '');
    $charset = 'utf8mb4';

    $dsn = "mysql:host={$host};port={$port};dbname={$database};charset={$charset}";

    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];

    return new PDO($dsn, (string)$username, (string)$password, $options);
}