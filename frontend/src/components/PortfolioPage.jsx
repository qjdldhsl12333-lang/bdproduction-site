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
  return video.id || video.video_id || video.title;
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
  const { videos, loading, errorMessage } = usePortfolioVideos();

  const categories = useMemo(() => resolveCategories(videos), [videos]);

  const categoryCounts = useMemo(() => {
    return categories.reduce((counts, category) => {
      counts[category] = category === '전체'
        ? videos.length
        : videos.filter((video) => resolveVideoCategory(video) === category).length;

      return counts;
    }, {});
  }, [categories, videos]);

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
          BDPRODUCTION의 주요 작업을 카테고리별로 확인할 수 있습니다.
        </p>

        <div className="portfolio-page-actions">
          <a className="secondary-button" href="/#portfolio">
            대표작 보기
          </a>
          <a className="primary-button" href="/#contact">
            제작 문의
          </a>
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

      {!loading && !errorMessage && (
        <div className="portfolio-library-layout">
          <aside className="portfolio-folder-panel">
            <div className="portfolio-folder-heading">
              <FolderOpen size={22} />
              <div>
                <span>CATEGORY</span>
                <strong>카테고리</strong>
              </div>
            </div>

            <div className="portfolio-folder-list">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`portfolio-folder-button ${selectedCategory === category ? 'is-active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  <span>
                    <FolderOpen size={15} />
                    {category}
                  </span>
                  <strong>{categoryCounts[category] || 0}</strong>
                </button>
              ))}
            </div>
          </aside>

          <div className="portfolio-library-content">
            <div className="portfolio-library-header">
              <div>
                <p className="eyebrow">SELECTED</p>
                <h2>{selectedCategory}</h2>
              </div>

              <span className="portfolio-library-search-note">
                <Search size={16} />
                {filteredVideos.length}개 작품
              </span>
            </div>

            {filteredVideos.length > 0 ? (
              <ul className="portfolio-compact-list">
                {filteredVideos.map((video) => (
                  <li className="portfolio-compact-item" key={resolveVideoKey(video)}>
                    <button
                      type="button"
                      className="portfolio-compact-thumb"
                      onClick={() => setSelectedVideo(video)}
                    >
                      {video.thumbnail_url ? (
                        <img src={video.thumbnail_url} alt={video.title} loading="lazy" />
                      ) : (
                        <span className="portfolio-compact-thumb-fallback">
                          <Video size={28} />
                        </span>
                      )}

                      <span className="portfolio-compact-play-icon">
                        <Play size={16} />
                      </span>
                    </button>

                    <div className="portfolio-compact-body">
                      <div className="portfolio-compact-meta">
                        <span>{resolveVideoCategory(video)}</span>
                        {video.badge && <strong>{video.badge}</strong>}
                      </div>

                      <h3>{video.title}</h3>
                      <p>{video.description || 'BDPRODUCTION 포트폴리오 영상입니다.'}</p>

                      <div className="portfolio-compact-footer">
                        <span>{video.client || video.channel_title || 'BDPRODUCTION'}</span>
                        <button type="button" onClick={() => setSelectedVideo(video)}>
                          보기
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="portfolio-state">
                표시할 포트폴리오가 없습니다.
              </div>
            )}
          </div>
        </div>
      )}

      <PortfolioVideoModal
        selectedVideo={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </section>
  );
}

export default PortfolioPage;
