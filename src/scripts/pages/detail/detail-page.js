import DetailPresenter from './detail-presenter';
import DetailView from './detail-view';
import * as DetailModel from './detail-model';
import { parseActivePathname } from '../../routes/url-parser';

class DetailPage {
  constructor() {
    this._view = new DetailView();
    this._presenter = new DetailPresenter({
      view: this._view,
      detailModel: DetailModel
    });
  }

  async render() {
    return this._presenter.getViewTemplate();
  }

  async afterRender() {
    const { id } = parseActivePathname();
    await this._presenter.showStory(id);
  }
}

export default DetailPage;