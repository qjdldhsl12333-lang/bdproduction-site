import { FolderOpen, Loader2, Play, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  PortfolioVideoModal,
  usePortfolioVideos,
} from './Portfolio.jsx';
import BdButton from './ui/BdButton.jsx';

function resolveVideoCategory(video) {
  return video.category || video.channel_title || 'BDPRODUCTION';
}

function resolveVideoKey(video) {
  return video.id || video.video_id || video.title;
}

function getCrewLabel(video) {
  const team = video.production_team || video.productionTeam || '';
  const crew = video.crew_names || video.crewNames || '';
  const description = (video.description || '').trim();

  if (team && crew) {
    return `${team} · ${crew}`;
  }

  if (team && description) {
    const match = description.match(/^(촬영팀|조명팀|VFX팀?|연출팀)\s+(.+?)\s*제작\.?$/);

    if (match) {
      return `${team} · ${match[2]}`;
    }
  }

  if (crew) {
    return crew;
  }

  if (team) {
    return team;
  }

  return '';
}

function resolveVideoThumbnail(video) {
  return video.thumbnail_url || video.thumbnailUrl || video.thumbnail || '';
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
                <BdButton
                  key={category}
                  type="button"
                  variant="portfolio-filter" className={`portfolio-folder-button ${selectedCategory === category ? 'is-active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  <span>
                    <FolderOpen size={15} />
                    {category}
                  </span>
                  <strong>{categoryCounts[category] || 0}</strong>
                </BdButton>
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
                    <BdButton variant="modal-icon"
                      type="button"
                      className={`portfolio-compact-thumb ${resolveVideoThumbnail(video) ? 'has-image' : ''}`}
                      onClick={() => setSelectedVideo(video)}
                      aria-label={`${video.title || 'BDPRODUCTION portfolio'} 보기`}
                      style={resolveVideoThumbnail(video) ? {
                        '--portfolio-thumb-image': `url("${resolveVideoThumbnail(video)}")`,
                      } : undefined}
                    >
                      {resolveVideoThumbnail(video) ? (
                        <img
                          className="portfolio-compact-thumb-image"
                          src={resolveVideoThumbnail(video)}
                          alt={`${video.title || 'BDPRODUCTION'} thumbnail`}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none';
                            event.currentTarget.closest('.portfolio-compact-thumb')?.classList.remove('has-image');
                          }}
                        />
                      ) : null}

                      <span className="portfolio-compact-thumb-brand">BD</span>

                      <span className="portfolio-compact-play-icon">
                        <Play size={16} />
                      </span>
                    </BdButton>

                    <div className="portfolio-compact-body">
                      <div className="portfolio-compact-meta">
                        <span>{resolveVideoCategory(video)}</span>
                        {video.badge && <strong>{video.badge}</strong>}
                      </div>

                      <h3>{video.title}</h3>
                      {getCrewLabel(video) && <p className="portfolio-compact-crew">{getCrewLabel(video)}</p>}
                      <p>{video.description || 'BDPRODUCTION 포트폴리오 영상입니다.'}</p>

                      <div className="portfolio-compact-footer">
                        <span>{video.client || video.channel_title || 'BDPRODUCTION'}</span>
                        <BdButton variant="portfolio-card" type="button" onClick={() => setSelectedVideo(video)}>
                          보기
                        </BdButton>
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
