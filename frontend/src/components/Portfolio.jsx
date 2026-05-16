import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, Loader2, Play, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { apiUrl } from '../config/api.js';


function Portfolio() {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [source, setSource] = useState('');

  const featuredVideos = useMemo(() => videos.slice(0, 6), [videos]);

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

        setVideos(result.videos || []);
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

  return (
    <section id="portfolio" className="section portfolio-section">
      <div className="section-heading">
        <p className="eyebrow">PORTFOLIO</p>
        <h2>FEATURED PROJECT</h2>
        <p>
          YouTube 포트폴리오 연동을 준비한 섹션입니다.
          채널 또는 재생목록 정보가 연결되면 최신 영상이 자동으로 표시됩니다.
        </p>
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
        <div className="portfolio-youtube-grid">
          {featuredVideos.map((video, index) => (
            <motion.article
              className="portfolio-youtube-card"
              key={video.video_id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55, delay: index * 0.05 }}
            >
              <button
                type="button"
                className="portfolio-youtube-thumb"
                onClick={() => setSelectedVideo(video)}
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
                <span>{video.channel_title || 'BDPRODUCTION'}</span>
                <h3>{video.title}</h3>
                <p>{video.description || 'BDPRODUCTION 포트폴리오 영상입니다.'}</p>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            className="youtube-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedVideo(null)}
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
                  <span>{selectedVideo.channel_title || 'BDPRODUCTION'}</span>
                  <h3>{selectedVideo.title}</h3>
                </div>

                <button type="button" onClick={() => setSelectedVideo(null)}>
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
    </section>
  );
}

export default Portfolio;