import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, Loader2, Play, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
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
    video_provider: item.videoProvider || item.video_provider || 'youtube',
    videoProvider: item.videoProvider || item.video_provider || 'youtube',
    source_url: item.sourceUrl || item.source_url || '',
    sourceUrl: item.sourceUrl || item.source_url || '',
    production_team: item.productionTeam || item.production_team || '',
    productionTeam: item.productionTeam || item.production_team || '',
    production_role: item.productionRole || item.production_role || '',
    productionRole: item.productionRole || item.production_role || '',
    crew_names: item.crewNames || item.crew_names || '',
    crewNames: item.crewNames || item.crew_names || '',
    work_year: item.workYear || item.work_year || '',
    workYear: item.workYear || item.work_year || '',
    embed_url: youtubeVideoId ? `https://www.youtube.com/embed/${youtubeVideoId}` : '',
    embedUrl: youtubeVideoId ? `https://www.youtube.com/embed/${youtubeVideoId}` : '',
    watch_url: youtubeVideoId ? `https://www.youtube.com/watch?v=${youtubeVideoId}` : (item.sourceUrl || item.source_url || ''),
    watchUrl: youtubeVideoId ? `https://www.youtube.com/watch?v=${youtubeVideoId}` : (item.sourceUrl || item.source_url || ''),
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
    video_provider: video.video_provider || video.videoProvider || 'youtube',
    videoProvider: video.video_provider || video.videoProvider || 'youtube',
    source_url: video.source_url || video.sourceUrl || '',
    sourceUrl: video.source_url || video.sourceUrl || '',
    production_team: video.production_team || video.productionTeam || '',
    productionTeam: video.production_team || video.productionTeam || '',
    production_role: video.production_role || video.productionRole || '',
    productionRole: video.production_role || video.productionRole || '',
    crew_names: video.crew_names || video.crewNames || '',
    crewNames: video.crew_names || video.crewNames || '',
    work_year: video.work_year || video.workYear || '',
    workYear: video.work_year || video.workYear || '',
    embed_url: video.embed_url || video.embedUrl || (youtubeVideoId ? `https://www.youtube.com/embed/${youtubeVideoId}` : ''),
    embedUrl: video.embed_url || video.embedUrl || (youtubeVideoId ? `https://www.youtube.com/embed/${youtubeVideoId}` : ''),
    watch_url: video.watch_url || video.watchUrl || (youtubeVideoId ? `https://www.youtube.com/watch?v=${youtubeVideoId}` : (video.source_url || video.sourceUrl || '')),
    watchUrl: video.watch_url || video.watchUrl || (youtubeVideoId ? `https://www.youtube.com/watch?v=${youtubeVideoId}` : (video.source_url || video.sourceUrl || '')),
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
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [source, setSource] = useState('fallback');

  useEffect(() => {
    let ignore = false;

    const loadVideos = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const cacheBust = Date.now();
        const endpoint = featuredOnly
          ? apiUrl(`/api/portfolio-items.php?featured=1&_=${cacheBust}`)
          : apiUrl(`/api/portfolio-items.php?_=${cacheBust}`);

        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          cache: 'no-store',
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

  // BDPRODUCTION portfolio 30-minute polling start
  useEffect(() => {
    let ignore = false;
    let pollTimerId = null;
    let lastLoadedAt = Date.now();
    const defaultPollIntervalMs = 30 * 60 * 1000;
    const testPollSeconds = (() => {
      if (typeof window === 'undefined') {
        return 0;
      }

      const searchParams = new URLSearchParams(window.location.search);
      const queryValue = searchParams.get('portfolioPollSeconds');
      const storageValue = window.localStorage?.getItem('portfolioPollSeconds');
      const parsedValue = Number(queryValue || storageValue || 0);

      if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
        return 0;
      }

      return Math.min(Math.max(parsedValue, 5), 3600);
    })();

    const pollIntervalMs = testPollSeconds > 0
      ? testPollSeconds * 1000
      : defaultPollIntervalMs;

    const refreshPortfolioVideos = async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }

      try {
        const cacheBuster = Date.now();
        const endpoint = featuredOnly
          ? apiUrl(`/api/portfolio-items.php?featured=1&ts=${cacheBuster}`)
          : apiUrl(`/api/portfolio-items.php?ts=${cacheBuster}`);

        const response = await fetch(endpoint, {
          method: 'GET',
          cache: 'no-store',
          headers: {
            Accept: 'application/json',
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
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
          lastLoadedAt = Date.now();
        }
      } catch (error) {
        console.error('Portfolio polling error:', error);
      }
    };

    const handleVisibilityChange = () => {
      if (typeof document === 'undefined' || document.visibilityState !== 'visible') {
        return;
      }

      if (Date.now() - lastLoadedAt >= pollIntervalMs) {
        refreshPortfolioVideos();
      }
    };

    if (typeof window !== 'undefined') {
      pollTimerId = window.setInterval(refreshPortfolioVideos, pollIntervalMs);
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      ignore = true;

      if (pollTimerId !== null && typeof window !== 'undefined') {
        window.clearInterval(pollTimerId);
      }

      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [featuredOnly]);
  // BDPRODUCTION portfolio 30-minute polling end

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
                  <p>영상 준비 중입니다.</p>
                  <span>곧 업데이트될 예정입니다.</span>
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


// Main portfolio responsive showcase final

function getVideoKey(video) {
  return video.id || video.video_id || video.youtubeVideoId || video.title;
}

function getAutoplayEmbedUrl(video) {
  const embedUrl = video.embed_url || video.embedUrl || '';

  if (!embedUrl) {
    return '';
  }

  const separator = embedUrl.includes('?') ? '&' : '?';

  return `${embedUrl}${separator}autoplay=1&playsinline=1&rel=0`;
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

function PortfolioShowcaseInfo({ video }) {
  if (!video) {
    return (
      <motion.aside
        className="portfolio-showcase-info is-guide"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.28 }}
        transition={{ duration: 0.52 }}
      >
        <span>PORTFOLIO GUIDE</span>
        <h3>{'\uB300\uD45C\uC791\uC744 \uC120\uD0DD\uD574 \uD504\uB85C\uC81D\uD2B8\uC758 \uBD84\uC704\uAE30\uC640 \uC124\uBA85\uC744 \uD655\uC778\uD574 \uBCF4\uC138\uC694.'}</h3>
        <p>
          {'\uCE74\uB4DC\uC5D0 \uB9C8\uC6B0\uC2A4\uB97C \uC62C\uB9AC\uBA74 \uD574\uB2F9 \uD3EC\uD2B8\uD3F4\uB9AC\uC624\uC758 \uC81C\uC791 \uC720\uD615, \uD074\uB77C\uC774\uC5B8\uD2B8, \uD575\uC2EC \uC124\uBA85\uC774 \uC774 \uC601\uC5ED\uC5D0 \uD45C\uC2DC\uB429\uB2C8\uB2E4.'}
        </p>
        <strong>BDPRODUCTION SHOWCASE</strong>
      </motion.aside>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.aside
        className="portfolio-showcase-info"
        key={getVideoKey(video)}
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.985 }}
        transition={{ duration: 0.28 }}
      >
        <span>{video.category || video.channel_title || 'BDPRODUCTION'}</span>
        <h3>{video.title}</h3>
        <p>{video.description || '\uD504\uB85C\uC81D\uD2B8 \uC124\uBA85\uC774 \uC900\uBE44 \uC911\uC785\uB2C8\uB2E4.'}</p>

        <div className="portfolio-showcase-meta">
          <div>
            <small>CLIENT</small>
            <strong>{video.client || video.channel_title || 'BDPRODUCTION'}</strong>
          </div>
          <div>
            <small>TYPE</small>
            <strong>{video.category || 'PORTFOLIO'}</strong>
          </div>
        </div>

        <button
          type="button"
          className="portfolio-showcase-play"
        >
          PLAY FILM
          <Play size={17} />
        </button>
      </motion.aside>
    </AnimatePresence>
  );
}

function PortfolioDesktopShowcase({ videos, onSelectVideo }) {
  const [hoveredVideo, setHoveredVideo] = useState(null);

  return (
    <div
      className="portfolio-desktop-showcase"
      onMouseLeave={() => setHoveredVideo(null)}
    >
      <div className="portfolio-showcase-grid">
        {videos.map((video, index) => (
          <motion.article
            className="portfolio-youtube-card portfolio-showcase-card"
            key={getVideoKey(video)}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.24 }}
            transition={{ duration: 0.52, delay: index * 0.06 }}
            onMouseEnter={() => setHoveredVideo(video)}
            onFocus={() => setHoveredVideo(video)}
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
              {getCrewLabel(video) && <em className="portfolio-card-crew">{getCrewLabel(video)}</em>}
              <h3>{video.title}</h3>
            </div>
          </motion.article>
        ))}
      </div>

      <PortfolioShowcaseInfo video={hoveredVideo} />
    </div>
  );
}

function PortfolioMobileSlider({ videos, onSelectVideo }) {
  const sliderRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [playingVideoKey, setPlayingVideoKey] = useState('');

  const scrollToIndex = (nextIndex) => {
    const slider = sliderRef.current;

    if (!slider) {
      return;
    }

    const safeIndex = Math.max(0, Math.min(videos.length - 1, nextIndex));
    const target = slider.children[safeIndex];

    if (!target) {
      return;
    }

    const targetLeft = target.offsetLeft - ((slider.clientWidth - target.clientWidth) / 2);

    slider.scrollTo({
      left: targetLeft,
      behavior: 'smooth',
    });

    setActiveIndex(safeIndex);
  };

  const handleScroll = () => {
    const slider = sliderRef.current;

    if (!slider || slider.children.length === 0) {
      return;
    }

    const sliderRect = slider.getBoundingClientRect();
    const sliderCenter = sliderRect.left + (sliderRect.width / 2);

    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    Array.from(slider.children).forEach((child, index) => {
      const childRect = child.getBoundingClientRect();
      const childCenter = childRect.left + (childRect.width / 2);
      const distance = Math.abs(sliderCenter - childCenter);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    setActiveIndex(Math.max(0, Math.min(videos.length - 1, nearestIndex)));
  };

  return (
    <div className="portfolio-mobile-showcase">
      <div
        className="portfolio-mobile-slider"
        ref={sliderRef}
        onScroll={handleScroll}
      >
        {videos.map((video, index) => {
          const videoKey = String(getVideoKey(video));
          const isActive = activeIndex === index;
          const isPlaying = playingVideoKey === videoKey;
          const autoplayUrl = getAutoplayEmbedUrl(video);

          return (
            <article
              className={`portfolio-mobile-card ${isActive ? 'is-active' : ''} ${isPlaying ? 'is-playing' : ''}`}
              key={videoKey}
            >
              <button
                type="button"
                className="portfolio-mobile-media"
                onClick={() => {
                  setActiveIndex(index);

                  if (autoplayUrl) {
                    setPlayingVideoKey(videoKey);
                    return;
                  }

                  onSelectVideo(video);
                }}
              >
                {isPlaying && autoplayUrl ? (
                  <iframe
                    title={video.title}
                    src={autoplayUrl}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <>
                    {video.thumbnail_url ? (
                      <img src={video.thumbnail_url} alt={video.title} loading="lazy" />
                    ) : (
                      <div className="portfolio-thumb-fallback">BD</div>
                    )}

                    <span className="portfolio-mobile-play">
                      <Play size={22} />
                    </span>
                  </>
                )}
              </button>

              <div className="portfolio-mobile-overlay">
                <span>{video.category || video.channel_title || 'BDPRODUCTION'}</span>
                {getCrewLabel(video) && <em className="portfolio-card-crew">{getCrewLabel(video)}</em>}
                <h3>{video.title}</h3>
                <p>{video.description || '\uD130\uCE58\uD558\uBA74 \uC601\uC0C1\uC774 \uC7AC\uC0DD\uB429\uB2C8\uB2E4.'}</p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="portfolio-mobile-controls">
        <button
          type="button"
          onClick={() => scrollToIndex(activeIndex - 1)}
          disabled={activeIndex <= 0}
          aria-label="previous portfolio"
        >
          ?
        </button>

        <div className="portfolio-mobile-dots" aria-label="portfolio slider pages">
          {videos.map((video, index) => (
            <button
              key={getVideoKey(video)}
              type="button"
              className={activeIndex === index ? 'is-active' : ''}
              onClick={() => scrollToIndex(index)}
              aria-label={`portfolio slide ${index + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollToIndex(activeIndex + 1)}
          disabled={activeIndex >= videos.length - 1}
          aria-label="next portfolio"
        >
          ?
        </button>
      </div>
    </div>
  );
}

function Portfolio() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const { videos, loading, errorMessage } = usePortfolioVideos({ featuredOnly: true });

  const featuredVideos = useMemo(() => videos.slice(0, 4), [videos]);

  return (
    <section id="portfolio" className="section portfolio-section">
      <div className="portfolio-section-header">
        <div className="section-heading">
          <p className="eyebrow">PORTFOLIO</p>
          <h2>FEATURED WORKS</h2>
        </div>
        <div className="portfolio-section-actions">
          <motion.a
            className="portfolio-more-button"
            href="/portfolio"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.42 }}
            transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
            aria-label="more portfolio"
          >
            <span className="portfolio-more-label">more portfolio</span>
            <span className="portfolio-more-arrow-track" aria-hidden="true">
              <span className="portfolio-more-arrow portfolio-more-arrow-hover">
                <svg viewBox="0 0 24 25" width="24" height="25" fill="none">
                  <path fill="currentColor" d="m15.335 13.332-3.661 3.74a.983.983 0 1 0 1.405 1.376l5.136-5.246c.38-.388.38-1.018 0-1.406L13.079 6.55a.983.983 0 1 0-1.405 1.376l3.66 3.74h-8.5a.833.833 0 0 0 0 1.666z" />
                </svg>
              </span>
              <span className="portfolio-more-arrow portfolio-more-arrow-idle">
                <svg viewBox="0 0 24 25" width="24" height="25" fill="none">
                  <path fill="currentColor" d="m15.335 13.332-3.661 3.74a.983.983 0 1 0 1.405 1.376l5.136-5.246c.38-.388.38-1.018 0-1.406L13.079 6.55a.983.983 0 1 0-1.405 1.376l3.66 3.74h-8.5a.833.833 0 0 0 0 1.666z" />
                </svg>
              </span>
            </span>
          </motion.a>
        </div>
      </div>

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
        <>
          <PortfolioDesktopShowcase videos={featuredVideos} onSelectVideo={setSelectedVideo} />
          <PortfolioMobileSlider videos={featuredVideos} onSelectVideo={setSelectedVideo} />
        </>
      )}

      {!loading && !errorMessage && featuredVideos.length === 0 && (
        <div className="portfolio-state">
          표시할 포트폴리오가 없습니다.
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
