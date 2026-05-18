-- =========================================================
-- Customer auth / Phase 2 account scaffold
-- =========================================================

USE bdproduction;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,

  name VARCHAR(100) NOT NULL,
  company VARCHAR(150) NULL,
  phone VARCHAR(50) NULL,
  email VARCHAR(190) NOT NULL UNIQUE,

  password_hash VARCHAR(255) NULL,

  provider VARCHAR(40) NOT NULL DEFAULT 'local',
  role VARCHAR(40) NOT NULL DEFAULT 'customer',

  is_active TINYINT(1) NOT NULL DEFAULT 1,

  agreed_at DATETIME NULL,
  last_login_at DATETIME NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_users_email (email),
  INDEX idx_users_provider (provider),
  INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS social_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,

  user_id INT NOT NULL,
  provider VARCHAR(40) NOT NULL,
  provider_user_id VARCHAR(190) NOT NULL,
  provider_email VARCHAR(190) NULL,

  access_token TEXT NULL,
  refresh_token TEXT NULL,
  token_expires_at DATETIME NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uniq_social_provider_user (provider, provider_user_id),
  INDEX idx_social_accounts_user_id (user_id),

  CONSTRAINT fk_social_accounts_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
