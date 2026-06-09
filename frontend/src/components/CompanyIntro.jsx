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
  'OUTDOOR AD',
  'PROMOTION',
  'BRAND FILM',
];

const marqueeItems = [...partnerLogos, ...partnerLogos];

function CompanyIntro() {
  return (
    <section className="company-intro-section" aria-label="BDPRODUCTION ?? ?? ? ???">
      <div className="company-intro-copy">
        <p className="company-intro-eyebrow">ABOUT BDPRODUCTION</p>

        <h2>
          {'\uC601\uC0C1\uC758 \uBD84\uC704\uAE30\uBD80\uD130 \uC644\uC131\uB3C4\uAE4C\uC9C0, \uBE0C\uB79C\uB4DC\uC758 \uC7A5\uBA74\uC744 \uC124\uACC4\uD569\uB2C8\uB2E4.'}
        </h2>

        <p>
          {'BDPRODUCTION\uC740 \uBBA4\uC9C1\uBE44\uB514\uC624, \uBC29\uC1A1, \uAD11\uACE0, \uD504\uB85C\uBAA8\uC158 \uCF58\uD150\uCE20\uB97C \uAE30\uD68D\uBD80\uD130 \uCD2C\uC601, \uD3B8\uC9D1, \uD6C4\uBC18 \uC791\uC5C5\uAE4C\uC9C0 \uC5F0\uACB0\uD558\uB294 \uC601\uC0C1 \uC81C\uC791 \uC2A4\uD29C\uB514\uC624\uC785\uB2C8\uB2E4.'}
        </p>
      </div>

      <div className="company-partner-marquee" aria-label="?? ? ?? ????">
        <div className="company-partner-marquee-fade company-partner-marquee-fade-left" aria-hidden="true" />

        <div className="company-partner-track">
          {marqueeItems.map((name, index) => (
            <span className="company-partner-logo" key={`${name}-${index}`}>
              {name}
            </span>
          ))}
        </div>

        <div className="company-partner-marquee-fade company-partner-marquee-fade-right" aria-hidden="true" />
      </div>
    </section>
  );
}

export default CompanyIntro;
