import { Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  PortfolioVideoGrid,
  PortfolioVideoModal,
  usePortfolioVideos,
} from './Portfolio.jsx';

function resolveCategories(videos) {
  const categories = videos
    .map((video) => video.category || video.channel_title || 'BDPRODUCTION')
    .filter(Boolean);

  return ['전체', ...Array.from(new Set(categories))];
}

function PortfolioPage() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const { videos, loading, errorMessage, source } = usePortfolioVideos();

  const categories = useMemo(() => resolveCategories(videos), [videos]);

  const filteredVideos = useMemo(() => {
    if (selectedCategory === '전체') {
      return videos;
    }

    return videos.filter((video) => (
      video.category || video.channel_title || 'BDPRODUCTION'
    ) === selectedCategory);
  }, [videos, selectedCategory]);

  return (
    <section className="portfolio-page-section">
      <div className="portfolio-page-hero">
        <p className="eyebrow">FULL PORTFOLIO</p>
        <h1>전체 포트폴리오</h1>
        <p>
          메인 페이지에는 대표작만 노출하고, 전체 작품은 별도 페이지에서 확인하는 구조입니다.
          영상은 목록에서 바로 재생하지 않고 클릭 시 모달에서만 로드하여 성능 부담을 줄입니다.
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
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={selectedCategory === category ? 'is-active' : ''}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {source === 'mock' && (
        <div className="portfolio-notice">
          현재는 YouTube 연결 전 임시 포트폴리오입니다. 실제 API 정보가 연결되면 전체 목록도 자동 데이터로 전환됩니다.
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

      {!loading && !errorMessage && filteredVideos.length > 0 && (
        <PortfolioVideoGrid videos={filteredVideos} onSelectVideo={setSelectedVideo} />
      )}

      {!loading && !errorMessage && filteredVideos.length === 0 && (
        <div className="portfolio-state">
          현재 조건에 맞는 포트폴리오가 없습니다.
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
