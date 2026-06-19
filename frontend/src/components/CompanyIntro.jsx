const partnerLogos = [
  'WARNER MUSIC KOREA',
  'CHANNEL A',
  'PUBG',
  'TEN SQUARE',
  'KGM',
  'TATA DAEWOO',
  'MUSIC VIDEO',
  'BROADCAST',
  'COMMERCIAL',
  'BRAND FILM',
];

const serviceTags = [
  'MUSIC VIDEO',
  'BROADCAST',
  'BRAND FILM',
  'COMMERCIAL',
];

const marqueeItems = [...partnerLogos, ...partnerLogos];

const introCopy = {
  sectionLabel: 'BD Production \uD68C\uC0AC \uC18C\uAC1C',
  title: '\uBE0C\uB79C\uB4DC\uC758 \uC7A5\uBA74\uC744 \uC124\uACC4\uD569\uB2C8\uB2E4.',
  description:
    '\uAE30\uD68D\uBD80\uD130 \uCD2C\uC601, \uD6C4\uBC18\uAE4C\uC9C0. BD Production\uC740 \uD558\uB098\uC758 \uD1A4\uC73C\uB85C \uC644\uC131\uB418\uB294 \uC601\uC0C1\uC744 \uB9CC\uB4ED\uB2C8\uB2E4.',
  serviceLabel: '\uC8FC\uC694 \uC81C\uC791 \uBD84\uC57C',
  keywordLabel: '\uD504\uB85C\uB355\uC158 \uD0A4\uC6CC\uB4DC',
};

function CompanyIntro() {
  return (
    <section className="company-intro-section landing-panel" aria-label={introCopy.sectionLabel}>
      <div className="company-intro-copy">
        <p className="company-intro-eyebrow">ABOUT BD Production</p>

        <h2>{introCopy.title}</h2>

        <p>{introCopy.description}</p>

        <div className="company-service-tags" aria-label={introCopy.serviceLabel}>
          {serviceTags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>

      <div className="company-partner-marquee" aria-label={introCopy.keywordLabel}>
        <div
          className="company-partner-marquee-fade company-partner-marquee-fade-left"
          aria-hidden="true"
        />

        <div className="company-partner-track">
          {marqueeItems.map((name, index) => (
            <span className="company-partner-logo" key={`${name}-${index}`}>
              {name}
            </span>
          ))}
        </div>

        <div
          className="company-partner-marquee-fade company-partner-marquee-fade-right"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}

export default CompanyIntro;
