class DetailPresenter {
  constructor({ view, detailModel }) {
    this._view = view;
    this._detailModel = detailModel;
    this._story = null;
  }

  getViewTemplate() {
    return this._view.getTemplate();
  }

  async showStory(id) {
    try {
      console.log(`Showing story with ID: ${id}`);
      
      if (!id) {
        console.error('Story ID is missing or invalid');
        this._view.showError('ID cerita tidak valid.');
        return;
      }
      
      this._view.showLoading();
      
      const token = await this._detailModel.getAuthToken();
      if (!token) {
        console.error('No authentication token found');
        this._view.showError('Anda harus login untuk melihat detail cerita.');
        this._redirectToLoginWithDelay(2000);
        return;
      }

      console.log('Fetching story detail from API...');
      const response = await this._detailModel.fetchStoryDetail(token, id);
      
      if (!response.error) {
        console.log('Story detail fetched successfully');
        this._story = response.story;
        this._view.showStory(this._story);
        
        if (this._story.lat && this._story.lon) {
          this._renderMapIfAvailable();
        }
      } else {
        console.error('API error:', response.message);
        this._view.showError(response.message || 'Gagal memuat detail cerita');
        
        if (response.message?.toLowerCase().includes('token') || response.status === 401) {
          this._view.showError('Sesi Anda telah berakhir. Silakan login kembali.');
          this._redirectToLoginWithDelay(2000);
        }
      }
    } catch (error) {
      console.error('Error in showStory:', error);
      this._view.showError(error.message || 'Terjadi kesalahan saat memuat detail cerita');
    } finally {
      try {
        this._view.hideLoading();
      } catch (error) {
        console.error('Error in hideLoading:', error);
      }
    }
  }

  _renderMapIfAvailable() {
    if (!this._isMapLibraryAvailable()) {
      console.warn('MapLibre GL JS is not available');
      return;
    }

    if (!this._detailModel.isMapConfigValid()) {
      console.warn('Map configuration is incomplete');
      return;
    }

    const mapConfig = this._detailModel.getMapConfig();
    this._view.renderMap(this._story.lat, this._story.lon, mapConfig);
  }

  _isMapLibraryAvailable() {
    return typeof maplibregl !== 'undefined';
  }

  _redirectToLoginWithDelay(delay) {
    this._view.redirectWithDelay(delay);
  }
}

export default DetailPresenter;