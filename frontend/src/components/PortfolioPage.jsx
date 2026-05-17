import { FolderOpen, Loader2, Play, Search, Video } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  PortfolioVideoModal,
  usePortfolioVideos,
} from './Portfolio.jsx';

function resolveVideoCategory(video) {
  return video.category || video.channel_title || 'BDPRODUCTION';
}

function resolveVideoKey(video) {
  return video.video_id || video.id || video.title;
}

function resolveVideoTitle(video) {
  return video.title || 'BDPRODUCTION 포트폴리오';
}

function resolveVideoDescription(video) {
  return video.description || 'BDPRODUCTION 포트폴리오 영상입니다.';
}

function resolveVideoThumbnail(video) {
  return video.thumbnail_url || video.thumbnailUrl || '';
}

function resolveCategories(videos) {
  const categories = videos
    .map((video) => resolveVideoCategory(video))
    .filter(Boolean);

  return ['전체', ...Array.from(new Set(categories))];
}

function PortfolioPage() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const { videos, loading, errorMessage, source } = usePortfolioVideos();

  const categories = useMemo(() => resolveCategories(videos), [videos]);

  const categorySummaries = useMemo(() => (
    categories.map((category) => {
      if (category === '전체') {
        return {
          label: category,
          count: videos.length,
        };
      }

      return {
        label: category,
        count: videos.filter((video) => resolveVideoCategory(video) === category).length,
      };
    })
  ), [categories, videos]);

  const filteredVideos = useMemo(() => {
    if (selectedCategory === '전체') {
      return videos;
    }

    return videos.filter((video) => resolveVideoCategory(video) === selectedCategory);
  }, [videos, selectedCategory]);

  return (
    <section className="portfolio-page-section">
      <div className="portfolio-page-hero">
        <p className="eyebrow">FULL PORTFOLIO</p>
        <h1>전체 포트폴리오</h1>
        <p>
          메인 페이지에는 대표작만 노출하고, 전체 작품은 폴더형 목록에서 빠르게 탐색하는 구조입니다.
          목록에서는 썸네일만 표시하고, 영상을 선택했을 때만 모달에서 플레이어를 로드합니다.
        </p>

        <div className="portfolio-page-actions">
          <a className="secondary-button" href="/#portfolio">
            대표작 섹션으로 돌아가기
          </a>
          <a className="primary-button" href="/#contact">
            제작 문의하기
          </a>
        </div>
      </div>

      <div className="portfolio-page-toolbar">
        <div>
          <span>표시 중인 작품</span>
          <strong>{filteredVideos.length}개</strong>
        </div>

        <div className="portfolio-filter-tabs" aria-label="포트폴리오 카테고리 필터">
          {categorySummaries.map((category) => (
            <button
              key={category.label}
              type="button"
              className={selectedCategory === category.label ? 'is-active' : ''}
              onClick={() => setSelectedCategory(category.label)}
            >
              {category.label}
              <span>{category.count}</span>
            </button>
          ))}
        </div>
      </div>

      {source === 'mock' && (
        <div className="portfolio-notice">
          현재는 YouTube 연결 전 임시 포트폴리오입니다. 실제 API 정보가 연결되면 전체 목록도 자동 데이터로 전환됩니다.
        </div>
      )}

      <div className="portfolio-library-layout">
        <aside className="portfolio-folder-panel" aria-label="포트폴리오 폴더">
          <div className="portfolio-folder-heading">
            <FolderOpen size={20} />
            <div>
              <span>PORTFOLIO FOLDERS</span>
              <strong>카테고리 폴더</strong>
            </div>
          </div>

          <div className="portfolio-folder-list">
            {categorySummaries.map((category) => (
              <button
                key={category.label}
                type="button"
                className={`portfolio-folder-button ${selectedCategory === category.label ? 'is-active' : ''}`}
                onClick={() => setSelectedCategory(category.label)}
              >
                <span>
                  <FolderOpen size={16} />
                  {category.label}
                </span>
                <strong>{category.count}</strong>
              </button>
            ))}
          </div>
        </aside>

        <div className="portfolio-library-content">
          <div className="portfolio-library-header">
            <div>
              <p className="eyebrow">SELECTED FOLDER</p>
              <h2>{selectedCategory}</h2>
            </div>

            <div className="portfolio-library-search-note">
              <Search size={17} />
              <span>영상은 선택 시에만 모달에서 재생됩니다.</span>
            </div>
          </div>

          {loading && (
            <div className="portfolio-state">
              <Loader2 size={22} />
              전체 포트폴리오를 불러오는 중입니다.
            </div>
          )}

          {errorMessage && (
            <div className="portfolio-error">
              {errorMessage}
            </div>
          )}

          {!loading && !errorMessage && filteredVideos.length > 0 && (
            <ul className="portfolio-compact-list">
              {filteredVideos.map((video, index) => {
                const title = resolveVideoTitle(video);
                const category = resolveVideoCategory(video);
                const description = resolveVideoDescription(video);
                const thumbnailUrl = resolveVideoThumbnail(video);

                return (
                  <li className="portfolio-compact-item" key={`${resolveVideoKey(video)}-${index}`}>
                    <button
                      type="button"
                      className="portfolio-compact-thumb"
                      onClick={() => setSelectedVideo(video)}
                      aria-label={`${title} 영상 보기`}
                    >
                      {thumbnailUrl ? (
                        <img src={thumbnailUrl} alt={title} loading="lazy" />
                      ) : (
                        <span className="portfolio-compact-thumb-fallback">
                          <Video size={22} />
                        </span>
                      )}

                      <span className="portfolio-compact-play-icon">
                        <Play size={15} />
                      </span>
                    </button>

                    <div className="portfolio-compact-body">
                      <div className="portfolio-compact-meta">
                        <span>{category}</span>
                        {video.is_new && <strong>NEW</strong>}
                      </div>

                      <h3>{title}</h3>
                      <p>{description}</p>

                      <div className="portfolio-compact-footer">
                        <span>{video.client || video.channel_title || 'BDPRODUCTION'}</span>
                        <button type="button" onClick={() => setSelectedVideo(video)}>
                          영상 보기
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {!loading && !errorMessage && filteredVideos.length === 0 && (
            <div className="portfolio-state">
              현재 조건에 맞는 포트폴리오가 없습니다.
            </div>
          )}
        </div>
      </div>

      <PortfolioVideoModal
        selectedVideo={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </section>
  );
}

export default PortfolioPage;
