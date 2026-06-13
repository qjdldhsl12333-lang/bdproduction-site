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

      <svg className="hero-fractal-filter" aria-hidden="true" focusable="false">
        <filter
          id="bd-hero-fractal-glitch"
          x="-16%"
          y="-35%"
          width="132%"
          height="170%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.018 0.42"
            numOctaves="2"
            seed="13"
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              dur="620ms"
              values="0.018 0.42;0.052 0.78;0.014 0.36;0.038 0.64;0.018 0.42"
              keyTimes="0;0.24;0.5;0.76;1"
              repeatCount="indefinite"
            />
          </feTurbulence>

          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          >
            <animate
              attributeName="scale"
              dur="2400ms"
              values="0;4;9;3;7;2;0;0"
              keyTimes="0;0.1;0.22;0.36;0.5;0.64;0.82;1"
              repeatCount="1"
              fill="freeze"
            />
          </feDisplacementMap>

          <feFlood floodColor="#95ff00" floodOpacity="0" result="limeNoise">
            <animate
              attributeName="flood-opacity"
              dur="2400ms"
              values="0;0.06;0.15;0.04;0.11;0.02;0;0"
              keyTimes="0;0.1;0.22;0.36;0.5;0.64;0.82;1"
              repeatCount="1"
              fill="freeze"
            />
          </feFlood>

          <feComposite in="limeNoise" in2="noise" operator="in" result="noiseTint" />
          <feComposite in="noiseTint" in2="SourceAlpha" operator="in" result="textNoise" />
          <feBlend in="displaced" in2="textNoise" mode="screen" />
        </filter>
      </svg>
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
