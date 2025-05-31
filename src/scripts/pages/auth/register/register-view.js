class RegisterView {
  getTemplate() {
    return `
      <section class="auth-section">
        <div class="auth-container">
          <h2 class="auth-title">Daftar Akun</h2>
          <form id="register-form" class="auth-form">
            <div class="form-group">
              <label for="name">Nama</label>
              <input type="text" id="name" required>
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" required>
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" required minlength="8">
            </div>
            <button type="submit" class="auth-button">Daftar</button>
          </form>
          <p class="auth-link">Sudah punya akun? <a href="/auth/login">Login disini</a></p>
          <div id="loading-container" class="loading-container"></div>
          <div id="error-message" class="error-message"></div>
          <div id="success-message" class="success-message"></div>
        </div>
      </section>
    `;
  }

  bindFormSubmit(handler) {
    const form = document.getElementById('register-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = this.getFormData();
        handler(formData);
      });
    }
  }

  getFormData() {
    return {
      name: document.getElementById('name')?.value || '',
      email: document.getElementById('email')?.value || '',
      password: document.getElementById('password')?.value || ''
    };
  }

  showLoading() {
    const loadingContainer = document.getElementById('loading-container');
    if (loadingContainer) {
      loadingContainer.innerHTML = '<div class="loading-spinner"></div>';
    }
  }

  hideLoading() {
    const loadingContainer = document.getElementById('loading-container');
    if (loadingContainer) {
      loadingContainer.innerHTML = '';
    }
  }

  showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.color = 'var(--danger-color)';
    }
  }

  showSuccess(message) {
    const successElement = document.getElementById('success-message');
    if (successElement) {
      successElement.textContent = message;
      successElement.style.color = 'var(--success-color)';
    }
  }

  redirectWithDelay(delay) {
    setTimeout(() => {
      this.redirectToLogin();
    }, delay);
  }

  redirectToHome() {
    window.location.href = '/';
  }

  redirectToLogin() {
    window.location.href = '/auth/login';
  }
}

export default RegisterView;