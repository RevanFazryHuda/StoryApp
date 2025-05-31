class LoginPresenter {
  constructor({ view, loginModel }) {
    this._view = view;
    this._loginModel = loginModel; 
  }

  getViewTemplate() {
    return this._view.getTemplate();
  }

  async init() {
    const token = await this._loginModel.getAuthToken();
    if (token) {
      this._view.redirectToHome();
      return;
    }
    
    this._view.bindFormSubmit(this._handleLogin.bind(this));
  }

  async _handleLogin(formData) {
    try {
      this._view.showLoading();
      
      const response = await this._loginModel.loginUser(formData);
      if (!response.error) {
        await this._loginModel.storeUserData(response.loginResult.token, {
          userId: response.loginResult.userId,
          name: response.loginResult.name
        });
        this._view.redirectToHome();
      } else {
        this._view.showError(response.message);
      }
    } catch (error) {
      this._view.showError(error.message);
    } finally {
      this._view.hideLoading();
    }
  }
}

export default LoginPresenter;