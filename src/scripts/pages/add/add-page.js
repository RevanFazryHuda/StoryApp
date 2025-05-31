import AddPresenter from "./add-presenter";
import AddView from "./add-view";
import * as AddModel from "./add-model";

class AddPage {
  constructor() {
    this._view = new AddView();
    this._presenter = new AddPresenter({
      view: this._view,
      model: AddModel,
    });
  }

  async render() {
    return this._presenter.getViewTemplate();
  }

  async afterRender() {
    await this._presenter.init();
  }
}

export default AddPage;