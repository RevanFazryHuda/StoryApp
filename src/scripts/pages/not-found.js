class NotFound {
  async render() {
    return `
      <div class="error-container">
        <h2>404 - Halaman Tidak Ditemukan</h2>
        <p>Maaf, halaman yang Anda cari tidak dapat ditemukan.</p>
          <a href="/" class="button">Back to Home</a>
      </div>
    `;
  }

  async afterRender() {
    // Tidak ada operasi khusus yang diperlukan
  }
}

export default NotFound;