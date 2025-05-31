import { showFormattedDate } from "../../utils";
import { addMarker } from "../../utils/map";

class DetailView {
  getTemplate() {
    return `
      <section class="detail-section">
        <div class="back-button-container">
          <a href="/" class="back-button" id="back-button">
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
            Kembali ke Home
          </a>
        </div>
        <div class="detail-container" id="detail-container">
          <div class="loading-container" id="loading-container"></div>
          <div id="error-message" class="error-message"></div>
        </div>
      </section>
    `;
  }

  showStory(story) {
    const detailContainer = document.getElementById("detail-container");
    if (!detailContainer) {
      console.error("Detail container not found");
      return;
    }

    detailContainer.innerHTML = `
      <img src="${story.photoUrl}" alt="${
      story.name
    }'s story" class="detail-image">
      <h2 class="detail-title">${story.name}</h2>
      <p class="detail-description">${story.description}</p>
      <div class="detail-meta">
        <span>${showFormattedDate(story.createdAt)}</span>
      </div>
      ${
        story.lat && story.lon
          ? `
        <div class="story-map" id="story-map" data-lat="${story.lat}" data-lon="${story.lon}"></div>
      `
          : ""
      }
      <div class="loading-container" id="loading-container"></div>
      <div id="error-message" class="error-message"></div>
    `;

    // Re-initialize back button behavior with view transitions if available
    this._initBackButton();
  }

  _initBackButton() {
    const backButton = document.getElementById("back-button");
    if (backButton && typeof document.startViewTransition === "function") {
      backButton.addEventListener("click", (e) => {
        e.preventDefault();
        document.startViewTransition(() => {
          window.location.href = "/";
        });
      });
    }
  }

  renderMap(lat, lon, mapConfig) {
    const mapContainer = document.getElementById("story-map");
    if (!mapContainer) return;

    try {
      const map = new maplibregl.Map({
        container: mapContainer,
        style: mapConfig.style,
        center: [lon, lat],
        zoom: 12,
      });
      const marker = addMarker(
        map,
        [lon, lat],
        `<h3>Story</h3><p>Koordinat: ${lat.toFixed(6)}, ${lon.toFixed(6)}</p>`
      );
      // Tangani error sprite
      map.on("styleimagemissing", (e) => {
        console.log("Missing image:", e.id);
        map.addImage(e.id, new Image(1, 1));
      });
    } catch (error) {
      console.error("Error rendering map:", error);
      if (mapContainer) {
        mapContainer.innerHTML =
          '<div class="map-error">Gagal memuat peta</div>';
      }
    }
  }

  showLoading() {
    const loadingContainer = document.getElementById("loading-container");
    if (loadingContainer) {
      loadingContainer.innerHTML = '<div class="loading-spinner"></div>';
    } else {
      console.warn("Loading container not found when trying to show loading");
    }
  }

  hideLoading() {
    const loadingContainer = document.getElementById("loading-container");
    if (loadingContainer) {
      loadingContainer.innerHTML = "";
    } else {
      console.warn("Loading container not found when trying to hide loading");
    }
  }

  showError(message) {
    const errorElement = document.getElementById("error-message");
    if (errorElement) {
      errorElement.textContent = message;
    } else {
      console.warn("Error message element not found");
    }
  }

  redirectToLogin() {
    window.location.href = "/auth/login";
  }

  redirectWithDelay(delay) {
    setTimeout(() => {
      this.redirectToLogin();
    }, delay);
  }
}

export default DetailView;
