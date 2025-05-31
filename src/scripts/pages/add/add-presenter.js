import AddView from "./add-view";
import * as AddModel from "./add-model";
import WebPush from "../../utils/web-push";
import { checkCameraSupport } from "../../utils/camera-helpers";

class AddPresenter {
  constructor({ view }) {
    this._view = view;
    this._photoFile = null;
    this._location = null;
    this._cameraStream = null;
  }

  async init() {
    this._view.initElements();
    this._setupFormSubmit();
    this._setupCamera();
    this._setupMap();
    await WebPush.init();

    const cameraSupport = checkCameraSupport();
    console.log("Camera support info:", cameraSupport);
    if (!cameraSupport.getUserMediaSupported) {
      this._view.showCameraStatus("Browser Anda tidak mendukung akses kamera", true);
    }
  }

  _setupFormSubmit() {
    this._view.bindFormSubmit(async (e) => {
      e.preventDefault();
      const description = this._view.getDescriptionValue();
      if (!this._photoFile) {
        this._view.showError("Silakan ambil foto terlebih dahulu");
        return;
      }
      try {
        this._view.showLoading();
        const token = await AddModel.getAuthToken();
        let response;
        if (token) {
          response = await AddModel.addStory(token, {
            description,
            photo: this._photoFile,
            lat: this._location?.lat,
            lon: this._location?.lon,
          });
        } else {
          response = await AddModel.addStoryGuest({
            description,
            photo: this._photoFile,
            lat: this._location?.lat,
            lon: this._location?.lon,
          });
        }
        console.log("API Response:", response);
        if (!response.error) {
          console.log("Skipping notification, redirecting to home...");
          this._view.redirectToHome();
        } else {
          this._view.showError(response.message);
        }
      } catch (error) {
        this._view.showError(error.message);
      } finally {
        this._view.hideLoading();
      }
    });
  }

  _setupCamera() {
    this._view.bindCaptureButtonClick(async () => {
      try {
        this._cameraStream = await this._view.startCamera();
      } catch (err) {
        // Error sudah ditangani di startCamera
      }
    });

    this._view.bindRetakeButtonClick(async () => {
      try {
        this._photoFile = null;
        this._view.resetPhoto();
        this._cameraStream = await this._view.startCamera();
      } catch (error) {
        this._view.showError("Gagal mengambil ulang foto");
      }
    });

    this._view.bindCapturePhotoButtonClick(async () => {
      try {
        this._photoFile = await this._view.capturePhoto();
        await this._stopCameraStream();
      } catch (error) {
        this._view.showError("Gagal mengambil foto");
      }
    });
  }

  async _stopCameraStream() {
    this._view.stopCameraStream(this._cameraStream);
    this._cameraStream = null;
  }

  _setupMap() {
    if (!AddModel.isMapConfigValid()) {
      console.warn('Map configuration is incomplete');
      return;
    }
    this._view.initMap(AddModel.getMapConfig());
    this._view.bindMapEvents((lat, lon) => {
      this._updateLocationData(lat, lon);
    });
    this._view.bindLocationToggleChange(async (e) => {
      if (e.target.checked) {
        this._view.showLocationOptions();
        if (this._view._elements.locationTypeAuto.checked) {
          this._getCurrentLocation();
        }
      } else {
        this._view.hideLocationOptions();
        this._location = null;
      }
    });
    this._view.bindLocationTypeAutoChange(async () => {
      if (this._view._elements.locationTypeAuto.checked) {
        this._getCurrentLocation();
      }
    });
    this._view.bindLocationSearchButtonClick(async (e) => {
      e.preventDefault();
      const query = this._view.getLocationSearchQuery();
      this._searchLocation(query);
    });
    this._view.bindLocationSearchInputKeypress(async (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const query = this._view.getLocationSearchQuery();
        this._searchLocation(query);
      }
    });
  }

  async _getCurrentLocation() {
    try {
      const { lat, lon } = await this._view.getCurrentLocation();
      this._updateLocationData(lat, lon);
    } catch (error) {
      // Error sudah ditangani di getCurrentLocation
    }
  }

  async _searchLocation(query) {
    try {
      this._view.showLoading();
      const data = await AddModel.searchLocation(query);
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        this._view.updateMapPosition(parseFloat(lat), parseFloat(lon));
        this._updateLocationData(parseFloat(lat), parseFloat(lon));
        this._view._elements.locationTypeManual.checked = true;
      } else {
        this._view.showError("Lokasi tidak ditemukan, coba kata kunci lain");
      }
    } catch (error) {
      this._view.showError("Terjadi kesalahan saat mencari lokasi");
    } finally {
      this._view.hideLoading();
    }
  }

  _updateLocationData(lat, lon) {
    this._location = { lat, lon };
    this._view.updateLocationInputs(lat, lon);
    this._view.updateCoordinatesDisplay(lat, lon);
  }

  getViewTemplate() {
    return this._view.getTemplate();
  }
}

export default AddPresenter;