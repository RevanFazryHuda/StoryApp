class LoginView {
  getTemplate() {
    return `
      <section class="auth-section">
        <div class="auth-container">
          <h2 class="auth-title">Login</h2>
          <form id="login-form" class="auth-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" required>
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" required minlength="8">
            </div>
            <button type="submit" class="auth-button">Login</button>
          </form>
          <p class="auth-link">Belum punya akun? <a href="/auth/register">Daftar disini</a></p>
          <div id="loading-container" class="loading-container"></div>
          <div id="error-message" class="error-message"></div>
        </div>
      </section>
    `;
  }

  // Bind form submit handler
  bindFormSubmit(handler) {
    const form = document.getElementById('login-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = this.getFormData();
      handler(formData);
    });
  }

  // Get form data from inputs
  getFormData() {
    return {
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    };
  }

  showLoading() {
    const loadingContainer = document.getElementById('loading-container');
    loadingContainer.innerHTML = '<div class="loading-spinner"></div>';
  }

  hideLoading() {
    const loadingContainer = document.getElementById('loading-container');
    loadingContainer.innerHTML = '';
  }

  showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
  }

  redirectToHome() {
    history.pushState(null, null, '/');
    window.dispatchEvent(new Event('popstate'));
  }
}

export default LoginView;