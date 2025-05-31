import LoginPresenter from './login-presenter';
import LoginView from './login-view';
import * as LoginModel from './login-model';

class LoginPage {
  constructor() {
    this._view = new LoginView();
    this._presenter = new LoginPresenter({
      view: this._view,
      loginModel: LoginModel
    });
  }

  async render() {
    return this._presenter.getViewTemplate();
  }

  async afterRender() {
    await this._presenter.init();
  }
}

export default LoginPage;