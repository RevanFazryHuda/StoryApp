class RegisterPresenter {
  constructor({ view, registerModel }) {
    this._view = view;
    this._registerModel = registerModel;
  }

  getViewTemplate() {
    return this._view.getTemplate();
  }

  async init() {
    const token = await this._registerModel.getAuthToken();
    if (token) {
      this._view.redirectToHome();
      return;
    }
    
    this._view.bindFormSubmit(this._handleRegister.bind(this));
  }

  async _handleRegister(formData) {
    try {
      this._view.showLoading();
      
      const response = await this._registerModel.registerUser(formData);
      if (!response.error) {
        this._view.showSuccess('Registrasi berhasil! Silakan login.');
        this._redirectToLoginWithDelay(2000);
      } else {
        this._view.showError(response.message);
      }
    } catch (error) {
      this._view.showError(error.message || 'Terjadi kesalahan saat registrasi');
    } finally {
      this._view.hideLoading();
    }
  }

  _redirectToLoginWithDelay(delay) {
    this._view.redirectWithDelay(delay);
  }
}

export default RegisterPresenter;