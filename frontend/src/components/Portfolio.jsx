import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, Loader2, Play, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { apiUrl } from '../config/api.js';

function normalizeBoolean(value, fallback = false) {
  if (value === true || value === 1 || value === '1' || value === 'true') {
    return true;
  }

  if (value === false || value === 0 || value === '0' || value === 'false') {
    return false;
  }

  return fallback;
}

function normalizeVideo(video) {
  return {
    ...video,
    id: video.id ?? video.video_id,
    video_id: video.video_id ?? video.youtubeVideoId ?? video.youtube_id ?? video.id,
    title: video.title || 'BDPRODUCTION Portfolio',
    description: video.description || 'BDPRODUCTION 포트폴리오 영상입니다.',
    thumbnail_url: video.thumbnail_url || video.thumbnailUrl || '',
    embed_url: video.embed_url || video.embedUrl || '',
    watch_url: video.watch_url || video.watchUrl || '',
    channel_title: video.channel_title || video.channelTitle || 'BDPRODUCTION',
    category: video.category || video.channel_title || video.channelTitle || 'BDPRODUCTION',
    is_new: normalizeBoolean(video.is_new, false),
    is_featured: normalizeBoolean(video.is_featured ?? video.isFeatured, false),
    is_active: normalizeBoolean(video.is_active ?? video.isActive, true),
    featured_order: Number(video.featured_order ?? video.featuredOrder ?? 9999),
    display_order: Number(video.display_order ?? video.displayOrder ?? 9999),
  };
}

function sortPortfolioVideos(videos) {
  return [...videos].sort((first, second) => {
    const firstOrder = Number.isFinite(first.display_order) ? first.display_order : 9999;
    const secondOrder = Number.isFinite(second.display_order) ? second.display_order : 9999;

    if (firstOrder !== secondOrder) {
      return firstOrder - secondOrder;
    }

    return String(first.title).localeCompare(String(second.title), 'ko');
  });
}

function selectFeaturedVideos(videos) {
  const activeVideos = videos.filter((video) => video.is_active !== false);
  const featuredVideos = activeVideos
    .filter((video) => video.is_featured)
    .sort((first, second) => first.featured_order - second.featured_order);

  if (featuredVideos.length > 0) {
    return featuredVideos.slice(0, 6);
  }

  return sortPortfolioVideos(activeVideos).slice(0, 6);
}

export function usePortfolioVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [source, setSource] = useState('');

  useEffect(() => {
    const loadVideos = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const response = await fetch(apiUrl('/api/youtube/videos.php'), {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          setErrorMessage(result.message || '포트폴리오 영상을 불러오지 못했습니다.');
          return;
        }

        const normalizedVideos = (result.videos || [])
          .map(normalizeVideo)
          .filter((video) => video.is_active !== false);

        setVideos(sortPortfolioVideos(normalizedVideos));
        setSource(result.source || '');
      } catch (error) {
        console.error('Portfolio videos API error:', error);
        setErrorMessage('포트폴리오 API와 연결할 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, []);

  return {
    videos,
    loading,
    errorMessage,
    source,
  };
}

export function PortfolioVideoGrid({ videos, onSelectVideo }) {
  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <div className="portfolio-youtube-grid">
      {videos.map((video, index) => (
        <motion.article
          className="portfolio-youtube-card"
          key={video.video_id || video.id}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, delay: index * 0.05 }}
        >
          <button
            type="button"
            className="portfolio-youtube-thumb"
            onClick={() => onSelectVideo(video)}
          >
            {video.thumbnail_url ? (
              <img src={video.thumbnail_url} alt={video.title} loading="lazy" />
            ) : (
              <div className="portfolio-thumb-fallback">BD</div>
            )}

            <span className="portfolio-play-badge">
              <Play size={18} />
            </span>

            {video.is_new && <span className="portfolio-new-badge">NEW</span>}
          </button>

          <div className="portfolio-youtube-body">
            <span>{video.category || video.channel_title || 'BDPRODUCTION'}</span>
            <h3>{video.title}</h3>
            <p>{video.description || 'BDPRODUCTION 포트폴리오 영상입니다.'}</p>
          </div>
        </motion.article>
      ))}
    </div>
  );
}

export function PortfolioVideoModal({ selectedVideo, onClose }) {
  return (
    <AnimatePresence>
      {selectedVideo && (
        <motion.div
          className="youtube-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="youtube-modal"
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="youtube-modal-header">
              <div>
                <span>{selectedVideo.category || selectedVideo.channel_title || 'BDPRODUCTION'}</span>
                <h3>{selectedVideo.title}</h3>
              </div>

              <button type="button" onClick={onClose} aria-label="영상 모달 닫기">
                <X size={20} />
              </button>
            </div>

            <div className="youtube-modal-player">
              {selectedVideo.embed_url ? (
                <iframe
                  title={selectedVideo.title}
                  src={selectedVideo.embed_url}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="youtube-modal-placeholder">
                  <p>아직 실제 YouTube 영상이 연결되지 않았습니다.</p>
                  <span>API Key와 Playlist ID를 등록하면 이 영역에서 영상이 재생됩니다.</span>
                </div>
              )}
            </div>

            {selectedVideo.watch_url && (
              <a
                className="youtube-modal-link"
                href={selectedVideo.watch_url}
                target="_blank"
                rel="noreferrer"
              >
                YouTube에서 보기
                <ExternalLink size={16} />
              </a>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Portfolio() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const { videos, loading, errorMessage, source } = usePortfolioVideos();

  const featuredVideos = useMemo(() => selectFeaturedVideos(videos), [videos]);

  return (
    <section id="portfolio" className="section portfolio-section">
      <div className="portfolio-section-header">
        <div className="section-heading">
          <p className="eyebrow">PORTFOLIO</p>
          <h2>FEATURED PROJECT</h2>
          <p>
            메인 페이지에는 대표 포트폴리오만 가볍게 노출합니다.
            전체 포트폴리오는 별도 페이지에서 확인할 수 있도록 확장 구조를 준비했습니다.
          </p>
        </div>

        <div className="portfolio-section-actions">
          <a className="secondary-button" href="/portfolio">
            전체 포트폴리오 보기
          </a>
          <span>
            목록에서는 썸네일만 표시하고, 영상은 클릭 시 모달에서만 불러옵니다.
          </span>
        </div>
      </div>

      {source === 'mock' && (
        <div className="portfolio-notice">
          현재는 YouTube 연결 전 임시 포트폴리오입니다. API Key와 Playlist ID를 등록하면 실제 영상으로 자동 전환됩니다.
        </div>
      )}

      {loading && (
        <div className="portfolio-state">
          <Loader2 size={22} />
          포트폴리오 영상을 불러오는 중입니다.
        </div>
      )}

      {errorMessage && (
        <div className="portfolio-error">
          {errorMessage}
        </div>
      )}

      {!loading && !errorMessage && featuredVideos.length > 0 && (
        <PortfolioVideoGrid videos={featuredVideos} onSelectVideo={setSelectedVideo} />
      )}

      {!loading && !errorMessage && featuredVideos.length === 0 && (
        <div className="portfolio-state">
          현재 표시할 대표 포트폴리오가 없습니다.
        </div>
      )}

      <PortfolioVideoModal
        selectedVideo={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </section>
  );
}

export default Portfolio;
