function Footer() {
  return (
    <footer className="site-footer" aria-label="BDPRODUCTION footer">
      <div className="footer-inner">
        <div className="footer-brand-block">
          <strong className="footer-logo">BDPRODUCTION</strong>
          <p className="footer-tagline">
            기술과 예술의 경계에서 브랜드의 장면을 설계합니다.
          </p>
        </div>

        <dl className="footer-info" aria-label="회사 정보">
          <div>
            <dt>Company</dt>
            <dd>BDPRODUCTION / BD기획</dd>
          </div>
          <div>
            <dt>CEO</dt>
            <dd>민병대</dd>
          </div>
          <div>
            <dt>Contact</dt>
            <dd>1577-5157</dd>
          </div>
          <div>
            <dt>Business No.</dt>
            <dd>422-25-01008</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>mbdasd@bdproduction.co.kr</dd>
          </div>
          <div>
            <dt>Address</dt>
            <dd>경기도 고양시 덕양구 지식산업센터 GL A동 1413호</dd>
          </div>
        </dl>
      </div>

      <p className="footer-notice">
        프로젝트 문의는 홈페이지 문의 폼으로 접수되며, 제작 범위와 일정 검토 후 담당자가 순차적으로 연락드립니다.
      </p>

      <div className="footer-bottom">
        <span>Copyright © 2026 BDPRODUCTION. All rights reserved.</span>
        <span>Premium Video Production Studio</span>
      </div>
    </footer>
  );
}

export default Footer;
