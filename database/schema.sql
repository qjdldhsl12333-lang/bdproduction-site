CREATE DATABASE IF NOT EXISTS bdproduction
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE bdproduction;

CREATE TABLE IF NOT EXISTS contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,

  name VARCHAR(100) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(150) NULL,

  production_type VARCHAR(100) NULL,
  budget_range VARCHAR(100) NULL,
  message TEXT NOT NULL,

  status VARCHAR(50) NOT NULL DEFAULT 'new',
  source VARCHAR(50) NOT NULL DEFAULT 'website',

  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

USE bdproduction;

CREATE TABLE IF NOT EXISTS contact_activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,

  contact_id INT NOT NULL,
  action VARCHAR(50) NOT NULL,

  previous_status VARCHAR(50) NULL,
  next_status VARCHAR(50) NULL,

  note VARCHAR(255) NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_contact_activity_contact_id (contact_id),
  INDEX idx_contact_activity_created_at (created_at),

  CONSTRAINT fk_contact_activity_contact
    FOREIGN KEY (contact_id)
    REFERENCES contacts(id)
    ON DELETE CASCADE
);

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

-- =========================================================
-- Portfolio CMS / YouTube portfolio scaffold
-- =========================================================

USE bdproduction;

CREATE TABLE IF NOT EXISTS portfolio_items (
  id INT AUTO_INCREMENT PRIMARY KEY,

  title VARCHAR(190) NOT NULL,
  client VARCHAR(190) NULL,
  category VARCHAR(100) NULL,
  description TEXT NULL,

  thumbnail_url VARCHAR(500) NULL,
  youtube_video_id VARCHAR(190) NULL,
  badge VARCHAR(50) NULL,

  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  featured_order INT NOT NULL DEFAULT 0,

  is_active TINYINT(1) NOT NULL DEFAULT 1,
  display_order INT NOT NULL DEFAULT 0,

  source VARCHAR(50) NOT NULL DEFAULT 'manual',
  published_at DATETIME NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_portfolio_active_order (is_active, display_order, id),
  INDEX idx_portfolio_featured_order (is_featured, featured_order, id),
  INDEX idx_portfolio_category (category),
  INDEX idx_portfolio_youtube_video_id (youtube_video_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO portfolio_items (
  title,
  client,
  category,
  description,
  thumbnail_url,
  youtube_video_id,
  badge,
  is_featured,
  featured_order,
  is_active,
  display_order,
  source
)
SELECT
  seed.title,
  seed.client,
  seed.category,
  seed.description,
  seed.thumbnail_url,
  seed.youtube_video_id,
  seed.badge,
  seed.is_featured,
  seed.featured_order,
  seed.is_active,
  seed.display_order,
  seed.source
FROM (
  SELECT
    'Warner Music Korea MV Production' AS title,
    '워너뮤직 코리아' AS client,
    'Music Video' AS category,
    '아티스트 콘셉트와 브랜드 톤을 반영한 뮤직비디오 제작 프로젝트입니다.' AS description,
    '' AS thumbnail_url,
    '' AS youtube_video_id,
    'MV' AS badge,
    1 AS is_featured,
    1 AS featured_order,
    1 AS is_active,
    1 AS display_order,
    'seed' AS source
  UNION ALL
  SELECT
    'Channel A Virtual Studio',
    '채널A',
    'Broadcast',
    '방송 프로그램 제작과 버추얼 스튜디오 기반 영상 제작 경험을 담은 프로젝트입니다.',
    '',
    '',
    'TV',
    1,
    2,
    1,
    2,
    'seed'
  UNION ALL
  SELECT
    'PUBG Official Brand Film',
    'PUBG',
    'Game',
    '게임 브랜드의 액션성과 몰입감을 강조한 공식 영상 제작 프로젝트입니다.',
    '',
    '',
    'GAME',
    1,
    3,
    1,
    3,
    'seed'
  UNION ALL
  SELECT
    'Ten Square CAR Tower OOH Film',
    '싱가포르 Ten Square CAR타워',
    'Outdoor AD',
    '해외 옥외 영상광고를 위한 고해상도 시네마틱 프로덕션 프로젝트입니다.',
    '',
    '',
    'OOH',
    1,
    4,
    1,
    4,
    'seed'
  UNION ALL
  SELECT
    'Automotive Brand Commercial',
    '타타대우 × KGM자동차',
    'Commercial',
    '자동차 브랜드의 신뢰감과 제품 이미지를 강화하는 광고 영상 제작 프로젝트입니다.',
    '',
    '',
    'CF',
    1,
    5,
    1,
    5,
    'seed'
  UNION ALL
  SELECT
    'Tourism Promotion Film',
    '한국관광공사 × 대만관광공사',
    'Promotion',
    '관광지의 감성과 국가 브랜드 이미지를 연결하는 해외 홍보 영상 프로젝트입니다.',
    '',
    '',
    'PR',
    1,
    6,
    1,
    6,
    'seed'
) AS seed
WHERE NOT EXISTS (
  SELECT 1 FROM portfolio_items
);
