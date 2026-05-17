import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, Loader2, Play, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { apiUrl } from '../config/api.js';
import { portfolioItems } from '../data/portfolio.js';

function normalizeBoolean(value, fallback = false) {
  if (value === true || value === 1 || value === '1' || value === 'true') {
    return true;
  }

  if (value === false || value === 0 || value === '0' || value === 'false') {
    return false;
  }

  return fallback;
}

function normalizeFallbackItem(item) {
  const youtubeVideoId = item.youtubeVideoId || item.youtube_video_id || item.video_id || '';
  const thumbnailUrl = item.thumbnailUrl || item.thumbnail_url || '';

  return {
    id: item.id,
    title: item.title || 'BDPRODUCTION Portfolio',
    client: item.client || 'BDPRODUCTION',
    category: item.category || 'BDPRODUCTION',
    description: item.description || 'BDPRODUCTION 포트폴리오 영상입니다.',
    thumbnail_url: thumbnailUrl,
    thumbnailUrl,
    youtube_video_id: youtubeVideoId,
    youtubeVideoId,
    video_id: youtubeVideoId || `fallback-${item.id}`,
    badge: item.badge || '',
    is_featured: normalizeBoolean(item.isFeatured ?? item.is_featured, true),
    isFeatured: normalizeBoolean(item.isFeatured ?? item.is_featured, true),
    featured_order: Number(item.featuredOrder ?? item.featured_order ?? 0),
    featuredOrder: Number(item.featuredOrder ?? item.featured_order ?? 0),
    is_active: normalizeBoolean(item.isActive ?? item.is_active, true),
    isActive: normalizeBoolean(item.isActive ?? item.is_active, true),
    display_order: Number(item.displayOrder ?? item.display_order ?? 0),
    displayOrder: Number(item.displayOrder ?? item.display_order ?? 0),
    embed_url: youtubeVideoId ? `https://www.youtube.com/embed/${youtubeVideoId}` : '',
    embedUrl: youtubeVideoId ? `https://www.youtube.com/embed/${youtubeVideoId}` : '',
    watch_url: youtubeVideoId ? `https://www.youtube.com/watch?v=${youtubeVideoId}` : '',
    watchUrl: youtubeVideoId ? `https://www.youtube.com/watch?v=${youtubeVideoId}` : '',
    channel_title: item.client || 'BDPRODUCTION',
    is_new: false,
  };
}

export function normalizePortfolioVideo(video) {
  const youtubeVideoId = video.youtube_video_id || video.youtubeVideoId || video.video_id || '';
  const thumbnailUrl = video.thumbnail_url || video.thumbnailUrl || '';

  return {
    ...video,
    id: video.id ?? video.video_id,
    title: video.title || 'BDPRODUCTION Portfolio',
    client: video.client || video.channel_title || 'BDPRODUCTION',
    category: video.category || video.channel_title || 'BDPRODUCTION',
    description: video.description || 'BDPRODUCTION 포트폴리오 영상입니다.',
    thumbnail_url: thumbnailUrl,
    thumbnailUrl,
    youtube_video_id: youtubeVideoId,
    youtubeVideoId,
    video_id: youtubeVideoId || video.video_id || `portfolio-${video.id ?? video.title}`,
    badge: video.badge || '',
    is_featured: normalizeBoolean(video.is_featured ?? video.isFeatured, false),
    isFeatured: normalizeBoolean(video.is_featured ?? video.isFeatured, false),
    featured_order: Number(video.featured_order ?? video.featuredOrder ?? 0),
    featuredOrder: Number(video.featured_order ?? video.featuredOrder ?? 0),
    is_active: normalizeBoolean(video.is_active ?? video.isActive, true),
    isActive: normalizeBoolean(video.is_active ?? video.isActive, true),
    display_order: Number(video.display_order ?? video.displayOrder ?? 0),
    displayOrder: Number(video.display_order ?? video.displayOrder ?? 0),
    embed_url: video.embed_url || video.embedUrl || (youtubeVideoId ? `https://www.youtube.com/embed/${youtubeVideoId}` : ''),
    embedUrl: video.embed_url || video.embedUrl || (youtubeVideoId ? `https://www.youtube.com/embed/${youtubeVideoId}` : ''),
    watch_url: video.watch_url || video.watchUrl || (youtubeVideoId ? `https://www.youtube.com/watch?v=${youtubeVideoId}` : ''),
    watchUrl: video.watch_url || video.watchUrl || (youtubeVideoId ? `https://www.youtube.com/watch?v=${youtubeVideoId}` : ''),
    channel_title: video.channel_title || video.client || 'BDPRODUCTION',
    is_new: Boolean(video.is_new),
  };
}

const fallbackVideos = portfolioItems
  .map(normalizeFallbackItem)
  .filter((item) => item.is_active)
  .sort((a, b) => a.display_order - b.display_order);

export function usePortfolioVideos(options = {}) {
  const { featuredOnly = false } = options;
  const [videos, setVideos] = useState(featuredOnly ? fallbackVideos.filter((video) => video.is_featured) : fallbackVideos);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [source, setSource] = useState('fallback');

  useEffect(() => {
    let ignore = false;

    const loadVideos = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const endpoint = featuredOnly
          ? apiUrl('/api/portfolio-items.php?featured=1')
          : apiUrl('/api/portfolio-items.php');

        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || '포트폴리오를 불러오지 못했습니다.');
        }

        const normalizedVideos = (result.videos || result.items || [])
          .map(normalizePortfolioVideo)
          .filter((video) => video.is_active !== false)
          .sort((a, b) => {
            if (featuredOnly) {
              return a.featured_order - b.featured_order;
            }

            return a.display_order - b.display_order;
          });

        if (!ignore) {
          setVideos(normalizedVideos);
          setSource(result.source || 'database');
        }
      } catch (error) {
        console.error('Portfolio API error:', error);

        if (!ignore) {
          const nextFallbackVideos = featuredOnly
            ? fallbackVideos.filter((video) => video.is_featured).sort((a, b) => a.featured_order - b.featured_order)
            : fallbackVideos;

          setVideos(nextFallbackVideos);
          setSource('fallback');
          setErrorMessage('');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadVideos();

    return () => {
      ignore = true;
    };
  }, [featuredOnly]);

  return {
    videos,
    loading,
    errorMessage,
    source,
  };
}

export function PortfolioVideoGrid({ videos, onSelectVideo }) {
  return (
    <div className="portfolio-youtube-grid">
      {videos.map((video, index) => (
        <motion.article
          className="portfolio-youtube-card"
          key={video.id || video.video_id || video.title}
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

              <button type="button" onClick={onClose}>
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
                  <span>관리자 포트폴리오 CMS에서 YouTube ID를 입력하면 이 영역에서 재생됩니다.</span>
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
  const { videos, loading, errorMessage, source } = usePortfolioVideos({ featuredOnly: true });

  const featuredVideos = useMemo(() => videos.slice(0, 6), [videos]);

  return (
    <section id="portfolio" className="section portfolio-section">
      <div className="portfolio-section-header">
        <div className="section-heading">
          <p className="eyebrow">PORTFOLIO</p>
          <h2>FEATURED PROJECT</h2>
          <p>
            메인에는 대표 포트폴리오만 가볍게 노출하고,
            전체 작품은 별도 페이지에서 폴더형으로 탐색할 수 있도록 분리했습니다.
          </p>
        </div>

        <div className="portfolio-section-actions">
          <a className="secondary-button" href="/portfolio">
            전체 포트폴리오 보기
          </a>
          <span>관리자 CMS에서 대표작 여부와 노출 순서를 조정할 수 있는 구조입니다.</span>
        </div>
      </div>

      {source === 'fallback' && (
        <div className="portfolio-notice">
          현재는 기본 포트폴리오 데이터 또는 관리자 CMS 초기 데이터 기준입니다.
        </div>
      )}

      {loading && (
        <div className="portfolio-state">
          <Loader2 size={22} />
          포트폴리오를 불러오는 중입니다.
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
          대표 포트폴리오가 아직 설정되지 않았습니다.
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
