import { motion } from 'framer-motion';
import { ArrowRight, PlayCircle } from 'lucide-react';

function Hero() {
  return (
    <section id="hero" className="hero-section">
      <div className="hero-video-layer" aria-hidden="true">
        <video className="hero-video" autoPlay muted loop playsInline>
          <source src="/videos/bd-showreel.mp4" type="video/mp4" />
        </video>
        <div className="hero-video-fallback" />
        <div className="hero-overlay" />
      </div>

      <div className="hero-content">
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          PREMIUM VIDEO PRODUCTION STUDIO
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.08 }}
        >
          기술과 예술의 경계에서
          <br />
          최상의 결과물을 만듭니다
        </motion.h1>

        <motion.p
          className="hero-description"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.16 }}
        >
          8K 오버샘플링, Cine EI 워크플로우, 정교한 컬러 그레이딩을 기반으로
          브랜드 필름, 광고, 뮤직비디오, 방송, 게임 영상을 제작합니다.
        </motion.p>

        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.24 }}
        >
          <a className="primary-button" href="#contact">
            영상 제작 문의
            <ArrowRight size={18} />
          </a>

          <a className="ghost-button" href="#portfolio">
            <PlayCircle size={19} />
            포트폴리오 보기
          </a>
        </motion.div>

        <motion.div
          className="hero-stats"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.32 }}
        >
          <div>
            <strong>8K</strong>
            <span>Oversampling</span>
          </div>
          <div>
            <strong>Cine EI</strong>
            <span>Production Workflow</span>
          </div>
          <div>
            <strong>1577-5157</strong>
            <span>Consulting Line</span>
          </div>
        </motion.div>
      </div>

      <div className="scroll-indicator">
        <span />
        SCROLL
      </div>
    </section>
  );
}

export default Hero;