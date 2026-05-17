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

CREATE TABLE IF NOT EXISTS youtube_videos (
  id INT AUTO_INCREMENT PRIMARY KEY,

  video_id VARCHAR(80) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  thumbnail_url VARCHAR(600) NULL,
  channel_title VARCHAR(255) NULL,

  published_at DATETIME NULL,
  position INT NOT NULL DEFAULT 0,

  is_active TINYINT(1) NOT NULL DEFAULT 1,
  source VARCHAR(50) NOT NULL DEFAULT 'youtube',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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
