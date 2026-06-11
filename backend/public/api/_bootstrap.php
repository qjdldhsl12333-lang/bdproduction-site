<?php

declare(strict_types=1);

function bdApiConfigDir(): string
{
    static $configDir = null;

    if ($configDir !== null) {
        return $configDir;
    }

    $documentRoot = $_SERVER['DOCUMENT_ROOT'] ?? '';

    $candidates = [
        // Local source layout:
        // backend/public/api -> backend/config
        __DIR__ . '/../../config',

        // Cloudways layout:
        // public_html/api -> private_html/config
        __DIR__ . '/../../private_html/config',

        // Cloudways fallback based on DOCUMENT_ROOT:
        // /home/app/public_html -> /home/app/private_html/config
        $documentRoot !== '' ? dirname($documentRoot) . '/private_html/config' : null,
    ];

    foreach ($candidates as $candidate) {
        if (!is_string($candidate) || $candidate === '') {
            continue;
        }

        $normalized = str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $candidate);

        if (is_dir($normalized) && is_file($normalized . DIRECTORY_SEPARATOR . 'env.php')) {
            $resolved = realpath($normalized);
            $configDir = $resolved !== false ? $resolved : $normalized;

            return $configDir;
        }
    }

    throw new RuntimeException('BD config directory was not found.');
}

function bdConfigPath(string $file): string
{
    $path = bdApiConfigDir() . DIRECTORY_SEPARATOR . ltrim($file, '/\\');

    if (!is_file($path)) {
        throw new RuntimeException('BD config file was not found: ' . $file);
    }

    return $path;
}

function bdRequireConfig(string $file): void
{
    require_once bdConfigPath($file);
}