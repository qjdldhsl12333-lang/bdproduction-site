USE bdproduction;

CREATE TABLE IF NOT EXISTS portfolio_items (
  id INT AUTO_INCREMENT PRIMARY KEY,

  title VARCHAR(255) NOT NULL,
  client VARCHAR(150) NULL,
  category VARCHAR(100) NULL,
  description TEXT NULL,

  thumbnail_url VARCHAR(600) NULL,
  youtube_video_id VARCHAR(80) NULL,
  badge VARCHAR(40) NULL,

  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  featured_order INT NOT NULL DEFAULT 0,

  is_active TINYINT(1) NOT NULL DEFAULT 1,
  display_order INT NOT NULL DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_portfolio_active_order (is_active, display_order),
  INDEX idx_portfolio_featured_order (is_featured, featured_order),
  INDEX idx_portfolio_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO portfolio_items
  (title, client, category, description, thumbnail_url, youtube_video_id, badge, is_featured, featured_order, is_active, display_order)
SELECT *
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
    1 AS display_order
  UNION ALL
  SELECT 'Channel A Virtual Studio', '채널A', 'Broadcast', '방송 프로그램 제작과 버추얼 스튜디오 기반 영상 제작 경험을 담은 프로젝트입니다.', '', '', 'TV', 1, 2, 1, 2
  UNION ALL
  SELECT 'PUBG Official Brand Film', 'PUBG', 'Game', '게임 브랜드의 액션성과 몰입감을 강조한 공식 영상 제작 프로젝트입니다.', '', '', 'GAME', 1, 3, 1, 3
  UNION ALL
  SELECT 'Ten Square CAR Tower OOH Film', '싱가포르 Ten Square CAR타워', 'Outdoor AD', '해외 옥외 영상광고를 위한 고해상도 시네마틱 프로덕션 프로젝트입니다.', '', '', 'OOH', 1, 4, 1, 4
  UNION ALL
  SELECT 'Automotive Brand Commercial', '타타대우 × KGM자동차', 'Commercial', '자동차 브랜드의 신뢰감과 제품 이미지를 강화하는 광고 영상 제작 프로젝트입니다.', '', '', 'CF', 1, 5, 1, 5
  UNION ALL
  SELECT 'Tourism Promotion Film', '한국관광공사 × 대만관광공사', 'Promotion', '관광지의 감성과 국가 브랜드 이미지를 연결하는 해외 홍보 영상 프로젝트입니다.', '', '', 'PR', 1, 6, 1, 6
) AS initial_items
WHERE NOT EXISTS (
  SELECT 1 FROM portfolio_items LIMIT 1
);
