class AboutPage {
  constructor() {
    console.log("AboutPage constructor called");
  }

  async render() {
    console.log("AboutPage render called");
    return this.getTemplate();
  }

  getTemplate() {
    console.log("AboutPage getTemplate called");
    return `
      <section class="about-section">
        <div class="about-container">
          <h1 class="about-title">Tentang Aplikasi</h1>
          <div class="about-content">
            <p>Aplikasi Dicoding Story adalah platform untuk berbagi cerita seputar pengalaman belajar di Dicoding.</p>
            <p>Dengan aplikasi ini, Anda dapat:</p>
            <ul>
              <li>Membaca cerita dari pengguna lain</li>
              <li>Membagikan cerita dan pengalaman belajar Anda</li>
              <li>Melampirkan foto dan lokasi</li>
              <li>Mendapatkan notifikasi ketika cerita Anda dipublikasikan</li>
            </ul>
            <p>Aplikasi ini dibangun dengan:</p>
            <ul>
              <li>JavaScript ES6+</li>
              <li>Web Components</li>
              <li>Single Page Application Architecture</li>
              <li>Model-View-Presenter Pattern</li>
            </ul>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    console.log("AboutPage afterRender called");
  }
}

console.log("AboutPage module loaded");
export default AboutPage;