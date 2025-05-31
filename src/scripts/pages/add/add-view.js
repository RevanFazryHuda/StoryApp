import { addMarker } from '../../utils/map';
import { getCameraStream, checkCameraSupport } from "../../utils/camera-helpers";
import CONFIG from "../../config";

class AddView {
  constructor() {
    this._elements = {};
    this._map = null;
    this._marker = null;
  }

  getTemplate() {
    return `
      <section class="add-section">
        <h2 class="section-title">Tambah Story Baru</h2>
        <form id="add-story-form" class="add-form">
          <div class="form-row">
            <label for="description">Deskripsi</label>
            <textarea id="description" required></textarea>
          </div>
          
          <div class="camera-container">
            <label>Foto</label>
            <div class="camera-preview">
              <video id="camera-preview" playsinline autoplay muted></video>
              <img id="photo-preview" style="display: none;">
              <canvas id="canvas" style="display: none;"></canvas>
            </div>
            <div class="camera-controls">
              <button type="button" id="capture-button" class="capture-button">Buka Kamera</button>
              <button type="button" id="retake-button" class="capture-button" style="display: none;">Ambil Ulang</button>
              <button type="button" id="capture-photo" class="capture-button" style="display: none;">Ambil Foto</button>
            </div>
            <div id="camera-status" class="camera-status"></div>
          </div>
          
          <div class="form-row">
            <label for="location-toggle">Tambahkan Lokasi</label>
            <input type="checkbox" id="location-toggle">
            
            <div id="location-options" class="location-options" style="display: none; margin-top: 10px;">
              <div class="location-type-selector">
                <label for="location-type-auto">Gunakan lokasi saat ini</label>
                <input type="radio" name="location-type" id="location-type-auto" value="auto" checked>
                <label for="location-type-manual">Pilih lokasi di peta</label>
                <input type="radio" name="location-type" id="location-type-manual" value="manual">
              </div>
              
              <div class="location-search" style="margin-top: 10px;">
                <label for="location-search-input" class="visually-hidden">Cari lokasi</label>
                <input type="text" id="location-search-input" placeholder="Cari lokasi..." style="width: 100%; padding: 8px; margin-bottom: 10px;">
                <button type="button" id="location-search-button" class="search-button">Cari</button>
              </div>
              
              <div class="coordinates-display" style="margin-top: 5px; font-size: 0.9em;">
                <span>Koordinat: </span>
                <span id="coordinates-display">-</span>
              </div>
            </div>
            
            <input type="hidden" id="lat">
            <input type="hidden" id="lon">
            <div id="map-picker" class="story-map" style="display: none; height: 300px;"></div>
          </div>
          
          <button type="submit" class="submit-button">Simpan Story</button>
        </form>
        <div id="loading-container" class="loading-container"></div>
        <div id="error-message" class="error-message"></div>
      </section>
    `;
  }

  initElements() {
    this._elements.captureButton = document.getElementById("capture-button");
    this._elements.retakeButton = document.getElementById("retake-button");
    this._elements.capturePhotoButton = document.getElementById("capture-photo");
    this._elements.videoElement = document.getElementById("camera-preview");
    this._elements.canvasElement = document.getElementById("canvas");
    this._elements.photoPreview = document.getElementById("photo-preview");
    this._elements.form = document.getElementById("add-story-form");
    this._elements.description = document.getElementById("description");
    this._elements.mapContainer = document.getElementById("map-picker");
    this._elements.latInput = document.getElementById("lat");
    this._elements.lonInput = document.getElementById("lon");
    this._elements.locationToggle = document.getElementById("location-toggle");
    this._elements.locationOptions = document.getElementById("location-options");
    this._elements.locationTypeAuto = document.getElementById("location-type-auto");
    this._elements.locationTypeManual = document.getElementById("location-type-manual");
    this._elements.locationSearchInput = document.getElementById("location-search-input");
    this._elements.locationSearchButton = document.getElementById("location-search-button");
    this._elements.coordinatesDisplay = document.getElementById("coordinates-display");
  }

  // Kamera
  async startCamera() {
    try {
      this.showCameraStatus("Meminta akses kamera...");
      this.showLoading();
      const stream = await getCameraStream({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      await this.setVideoStream(stream);
      this.showCameraPreview();
      this.showCameraStatus("Kamera siap digunakan");
      return stream;
    } catch (err) {
      this.showError(`Tidak dapat mengakses kamera: ${err.message}`);
      this.showCameraStatus(`Gagal mengakses kamera: ${err.message}`, true);
      throw err;
    } finally {
      this.hideLoading();
    }
  }

  async capturePhoto() {
    try {
      const videoElement = this.getVideoElement();
      const canvasElement = this.getCanvasElement();
      const context = this.getCanvasContext();
      const videoWidth = videoElement.videoWidth || 640;
      const videoHeight = videoElement.videoHeight || 480;
      this.setCanvasDimensions(videoWidth, videoHeight);
      context.drawImage(videoElement, 0, 0, videoWidth, videoHeight);
      return new Promise((resolve) => {
        canvasElement.toBlob((blob) => {
          if (!blob) {
            throw new Error("Gagal membuat blob gambar");
          }
          const imageUrl = URL.createObjectURL(blob);
          this.showPhotoPreview(imageUrl);
          this.showCameraStatus("Foto berhasil diambil");
          resolve(new File([blob], "photo.jpg", { type: "image/jpeg" }));
        }, "image/jpeg", 0.9);
      });
    } catch (error) {
      this.showError(`Gagal mengambil foto: ${error.message}`);
      throw error;
    }
  }

  stopCameraStream(stream) {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
        console.log("Camera track stopped:", track.label);
      });
    }
  }

  showCameraPreview() {
    this._elements.videoElement.style.display = "block";
    this._elements.photoPreview.style.display = "none";
    this._elements.captureButton.style.display = "none";
    this._elements.capturePhotoButton.style.display = "block";
    this._elements.retakeButton.style.display = "none";
  }

  showPhotoPreview(imageUrl) {
    this._elements.photoPreview.src = imageUrl;
    this._elements.videoElement.style.display = "none";
    this._elements.photoPreview.style.display = "block";
    this._elements.captureButton.style.display = "block";
    this._elements.capturePhotoButton.style.display = "none";
    this._elements.retakeButton.style.display = "block";
  }

  resetPhoto() {
    this._elements.photoPreview.src = "";
    this._elements.photoPreview.style.display = "none";
  }

  setVideoStream(stream) {
    this._elements.videoElement.srcObject = stream;
    return this._elements.videoElement.play();
  }

  getVideoElement() {
    return this._elements.videoElement;
  }

  getCanvasElement() {
    return this._elements.canvasElement;
  }

  getCanvasContext() {
    return this._elements.canvasElement.getContext("2d");
  }

  setCanvasDimensions(width, height) {
    this._elements.canvasElement.width = width;
    this._elements.canvasElement.height = height;
  }

  getDescriptionValue() {
    return this._elements.description.value;
  }

  // Peta
  initMap(mapConfig) {
    if (!this._isMapLibraryAvailable()) {
      console.warn('MapLibre GL JS is not available');
      return;
    }
    const mapContainer = this.getMapContainer();
    const defaultCoords = [106.8272, -6.1754];
    this._map = new maplibregl.Map({
      container: mapContainer,
      style: mapConfig.style,
      center: defaultCoords,
      zoom: 12,
    });
    this._map.addControl(new maplibregl.NavigationControl(), "top-right");
    this._map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      "top-right"
    );
    this._marker = addMarker(
      this._map,
      defaultCoords,
      `<h3>Lokasi</h3><p>Koordinat: ${defaultCoords[1].toFixed(6)}, ${defaultCoords[0].toFixed(6)}</p>`,
      { draggable: true }
    );
    this._map.on("styleimagemissing", (e) => {
      console.log("Missing image:", e.id);
      this._map.addImage(e.id, new Image(1, 1));
    });
  }

  bindMapEvents(handler) {
    if (this._map && this._marker) {
      this._marker.on("dragend", () => {
        const lngLat = this._marker.getLngLat();
        handler(lngLat.lat, lngLat.lng);
        this.updateMapPopup(lngLat.lat, lngLat.lng);
      });
      this._map.on("click", (e) => {
        if (this._elements.locationTypeManual.checked) {
          this._marker.setLngLat(e.lngLat);
          handler(e.lngLat.lat, e.lngLat.lng);
          this.updateMapPopup(e.lngLat.lat, e.lngLat.lng);
        }
      });
    }
  }

  updateMapPopup(lat, lon) {
    if (this._marker) {
      const popup = this._marker.getPopup();
      popup.setHTML(`<h3>Lokasi</h3><p>Koordinat: ${lat.toFixed(6)}, ${lon.toFixed(6)}</p>`);
    }
  }

  updateMapPosition(lat, lon, zoom = 14) {
    if (this._map && this._marker) {
      this._map.flyTo({ center: [lon, lat], zoom });
      this._marker.setLngLat([lon, lat]);
      this.updateMapPopup(lat, lon);
    }
  }

  async getCurrentLocation() {
    this.showLoading();
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.updateMapPosition(latitude, longitude);
          this.hideLoading();
          resolve({ lat: latitude, lon: longitude });
        },
        (error) => {
          console.error("Error getting current location:", error);
          this.showError(`Tidak dapat mengakses lokasi: ${error.message}`);
          this.hideLoading();
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  _isMapLibraryAvailable() {
    return typeof maplibregl !== 'undefined';
  }

  getMapContainer() {
    return this._elements.mapContainer;
  }

  // Event binding
  bindCaptureButtonClick(handler) {
    this._elements.captureButton.addEventListener("click", handler);
  }

  bindRetakeButtonClick(handler) {
    this._elements.retakeButton.addEventListener("click", handler);
  }

  bindCapturePhotoButtonClick(handler) {
    this._elements.capturePhotoButton.addEventListener("click", handler);
  }

  bindFormSubmit(handler) {
    this._elements.form.addEventListener("submit", handler);
  }

  bindLocationToggleChange(handler) {
    this._elements.locationToggle.addEventListener("change", handler);
  }

  bindLocationTypeAutoChange(handler) {
    this._elements.locationTypeAuto.addEventListener("change", handler);
  }

  bindLocationSearchButtonClick(handler) {
    this._elements.locationSearchButton.addEventListener("click", handler);
  }

  bindLocationSearchInputKeypress(handler) {
    this._elements.locationSearchInput.addEventListener("keypress", handler);
  }

  getLocationSearchQuery() {
    return this._elements.locationSearchInput.value;
  }

  updateCoordinatesDisplay(lat, lon) {
    this._elements.coordinatesDisplay.textContent = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
  }

  updateLocationInputs(lat, lon) {
    this._elements.latInput.value = lat;
    this._elements.lonInput.value = lon;
  }

  showLocationOptions() {
    this._elements.locationOptions.style.display = "block";
    this._elements.mapContainer.style.display = "block";
    if (this._map) {
      setTimeout(() => this._map.resize(), 100);
    }
  }

  hideLocationOptions() {
    this._elements.locationOptions.style.display = "none";
    this._elements.mapContainer.style.display = "none";
    this.updateLocationInputs("", "");
  }

  showLoading() {
    const loadingContainer = document.getElementById("loading-container");
    loadingContainer.innerHTML = '<div class="loading-spinner"></div>';
  }

  hideLoading() {
    const loadingContainer = document.getElementById("loading-container");
    if (loadingContainer) {
      loadingContainer.innerHTML = "";
    } else {
      console.error("Loading container not found");
    }
  }

  showError(message) {
    const errorElement = document.getElementById("error-message");
    errorElement.textContent = message;
    errorElement.style.display = "block";
    setTimeout(() => {
      errorElement.style.display = "none";
    }, 5000);
  }

  showCameraStatus(message, isError = false) {
    const statusElement = document.getElementById("camera-status");
    if (!statusElement) return;
    statusElement.textContent = message;
    statusElement.className = "camera-status" + (isError ? " error" : "");
    statusElement.style.display = "block";
    if (!isError) {
      setTimeout(() => {
        statusElement.style.display = "none";
      }, 3000);
    }
  }

  redirectToHome() {
    window.location.href = "/";
  }
}

export default AddView;