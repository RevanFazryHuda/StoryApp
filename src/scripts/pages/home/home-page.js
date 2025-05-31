import HomePresenter from './home-presenter';
import HomeView from './home-view';
import * as HomeModel from './home-model';

class HomePage {
  constructor() {
    this._view = new HomeView();
    this._presenter = new HomePresenter({
      view: this._view,
      homeModel: HomeModel
    });
  }

  async render() {
    return this._presenter.getViewTemplate();
  }

  async afterRender() {
    await this._presenter.init();
  }
}

export default HomePage;