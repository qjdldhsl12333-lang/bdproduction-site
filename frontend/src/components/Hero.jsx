function Hero() {
  return (
    <section id="hero" className="hero-section hero-film-section" aria-label="BDPRODUCTION 시네마틱 메인 영상">
      <div className="hero-film-canvas" aria-hidden="true">
        <div className="hero-film-side hero-film-side-left" />

        <div className="hero-film-screen">
          <video className="hero-film-video" autoPlay muted loop playsInline poster="/BDPRODUCTION.webp">
            <source src="/videos/bd-showreel.mp4" type="video/mp4" />
          </video>
          <div className="hero-film-fallback">BDPRODUCTION</div>
        </div>

        <div className="hero-film-side hero-film-side-right" />
      </div>

      <div className="hero-film-center-mark hero-film-center-mark-colorburst-clean" aria-hidden="true">
        <span className="hero-logo-word hero-logo-word-colorburst-clean" data-title="BDPRODUCTION">
          BDPRODUC<i className="hero-logo-kern-fix">T<i className="hero-logo-kern-fix1">I</i>ON</i>
        </span>
        <strong className="hero-logo-subtitle-colorburst-clean">PREMIUM VIDEO PRODUCTION STUDIO</strong>
      </div>
    </section>
  );
}

export default Hero;
