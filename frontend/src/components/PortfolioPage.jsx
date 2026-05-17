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
  const { videos, loading, errorMessage, source } = usePortfolioVideos();

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
          메인 페이지에는 대표작만 노출하고, 전체 작품은 별도 페이지에서 폴더형으로 관리합니다.
          목록에서는 썸네일과 요약 정보만 표시하고, 클릭 시 모달에서만 영상을 로드합니다.
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

      {source === 'fallback' && (
        <div className="portfolio-notice">
          현재는 기본 포트폴리오 데이터 또는 관리자 CMS 초기 데이터 기준입니다.
          관리자 포트폴리오 CMS에서 작품을 추가하면 이 목록에 반영됩니다.
        </div>
      )}

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
                <span>FOLDERS</span>
                <strong>카테고리별 보기</strong>
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
                <p className="eyebrow">SELECTED FOLDER</p>
                <h2>{selectedCategory}</h2>
              </div>

              <span className="portfolio-library-search-note">
                <Search size={16} />
                {filteredVideos.length}개 작품 표시 중
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
                          영상 보기
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="portfolio-state">
                현재 조건에 맞는 포트폴리오가 없습니다.
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
