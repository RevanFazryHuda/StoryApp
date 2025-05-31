class HomePresenter {
  constructor({ view, homeModel }) {
    this._view = view;
    this._homeModel = homeModel;
    this._stories = [];
  }

  getViewTemplate() {
    return this._view.getTemplate();
  }

  async init() {
    await this.showStories();
  }

  async showStories() {
    try {
      this._view.showLoading();
      
      const token = await this._homeModel.getAuthToken();
      if (!token) {
        console.log('Token autentikasi tidak ditemukan, mengarahkan ke login');
        this._view.showLoginRequiredMessage();
        this._redirectToLoginWithDelay(2000);
        return;
      }

      console.log('Mengambil cerita dengan token');
      const response = await this._homeModel.fetchAllStories(token, 1);
      
      if (!response.error) {
        this._stories = (response.listStory || []).filter(story => {
          const lat = Number(story.lat);
          const lon = Number(story.lon);
          const isValid = !isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
          if (!isValid) {
            console.warn(`Menyaring cerita ${story.id} karena koordinat tidak valid: lat=${story.lat}, lon=${story.lon}`);
          }
          return isValid;
        });
        console.log('Cerita yang valid:', this._stories.map(s => ({
          id: s.id,
          lat: s.lat,
          lon: s.lon
        })));
        
        if (this._stories.length === 0 && !navigator.onLine) {
          this._stories = await this._homeModel.getOfflineStories();
          if (this._stories.length === 0) {
            this._view.showEmptyStories();
          } else {
            this._view.showStories(this._stories);
            this._view.showOfflineMessage();
            this._renderMapsForStories();
          }
        } else if (this._stories.length === 0) {
          this._view.showEmptyStories();
        } else {
          this._view.showStories(this._stories);
          this._renderMapsForStories();
        }
      } else {
        console.error('API mengembalikan error:', response.message);
        
        if (response.message?.toLowerCase().includes('token') || response.status === 401) {
          this._view.showError('Sesi Anda telah berakhir. Silakan login kembali.');
          this._redirectToLoginWithDelay(2000);
        } else if (!navigator.onLine) {
          this._stories = await this._homeModel.getOfflineStories();
          if (this._stories.length === 0) {
            this._view.showEmptyStories();
          } else {
            this._view.showStories(this._stories);
            this._view.showOfflineMessage();
            this._renderMapsForStories();
          }
        } else {
          this._view.showError(response.message || 'Gagal memuat cerita');
        }
      }
    } catch (error) {
      console.error('Error di showStories:', error);
      if (!navigator.onLine || error.message.includes('Failed to fetch') || error.message.includes('net::ERR_FAILED')) {
        this._stories = await this._homeModel.getOfflineStories();
        if (this._stories.length === 0) {
          this._view.showEmptyStories();
        } else {
          this._view.showStories(this._stories);
          this._view.showOfflineMessage();
          if (navigator.onLine) {
            this._renderMapsForStories();
          }
        }
      } else {
        this._view.showError(error.message || 'Terjadi kesalahan saat memuat cerita');
      }
    } finally {
      this._view.hideLoading();
    }
  }

  _renderMapsForStories() {
    if (!this._isMapLibraryAvailable()) {
      console.warn('MapLibre GL JS tidak tersedia');
      return;
    }

    if (!this._homeModel.isMapConfigValid()) {
      console.warn('Konfigurasi peta tidak lengkap');
      return;
    }

    this._stories.forEach((story) => {
      const lat = Number(story.lat);
      const lon = Number(story.lon);

      // Validasi koordinat
      if (
        !isNaN(lat) && !isNaN(lon) &&
        lat >= -90 && lat <= 90 &&
        lon >= -180 && lon <= 180
      ) {
        setTimeout(() => {
          const mapConfig = this._homeModel.getMapConfig();
          console.log(`Merender peta untuk story ${story.id}: lat=${lat}, lon=${lon}`);
          this._view.renderMap(story.id, lat, lon, mapConfig);
        }, 100);
      } else {
        console.warn(`Koordinat tidak valid untuk story ${story.id}: lat=${story.lat}, lon=${story.lon}`);
      }
    });
  }

  _isMapLibraryAvailable() {
    return typeof maplibregl !== 'undefined';
  }

  _redirectToLoginWithDelay(delay) {
    this._view.redirectWithDelay(delay);
  }
}

export default HomePresenter;