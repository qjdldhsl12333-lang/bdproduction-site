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
    </section>
  );
}

export default Hero;
