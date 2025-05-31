import RegisterPresenter from './register-presenter';
import RegisterView from './register-view';
import * as RegisterModel from './register-model';

class RegisterPage {
  constructor() {
    this._view = new RegisterView();
    this._presenter = new RegisterPresenter({
      view: this._view,
      registerModel: RegisterModel
    });
  }

  async render() {
    return this._presenter.getViewTemplate();
  }

  async afterRender() {
    await this._presenter.init();
  }
}

export default RegisterPage;