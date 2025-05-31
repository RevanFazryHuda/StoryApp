import StoryItem from "../../components/story-item";

class HomeView {
  getTemplate() {
    return `
      <section class="stories-section">
        <h2 class="section-title">Cerita Terbaru</h2>
        <div class="stories-container" id="stories-container"></div>
        <div class="loading-container" id="loading-container"></div>
        <div id="error-message" class="error-message"></div>
        <div id="offline-message" class="info-message" style="display: none;">Mode Offline: Menampilkan cerita tersimpan</div>
      </section>
    `;
  }

  showStories(stories) {
    const storiesContainer = document.getElementById("stories-container");
    if (!storiesContainer) {
      console.error("Stories container tidak ditemukan di DOM");
      return;
    }

    storiesContainer.innerHTML = "";

    if (stories.length === 0) {
      this.showEmptyStories();
      return;
    }

    stories.forEach((story) => {
      try {
        const storyItemElement = document.createElement("story-item");
        storyItemElement.story = story;
        storiesContainer.appendChild(storyItemElement);
      } catch (error) {
        console.error("Error rendering story item:", error);
      }
    });
  }

  showOfflineMessage() {
    const offlineMessage = document.getElementById("offline-message");
    if (offlineMessage) {
      offlineMessage.style.display = 'block';
    }
  }

  renderMap(id, lat, lon, mapConfig) {
    const mapContainer = document.getElementById(`map-${id}`);
    if (!mapContainer) {
      console.warn(`Map container untuk story ${id} tidak ditemukan`);
      return;
    }

    // Validasi ulang koordinat
    if (
      typeof lat !== 'number' || typeof lon !== 'number' ||
      isNaN(lat) || isNaN(lon) ||
      lat < -90 || lat > 90 ||
      lon < -180 || lon > 180
    ) {
      console.warn(`Koordinat tidak valid untuk story ${id}: lat=${lat}, lon=${lon}`);
      mapContainer.innerHTML = '<div class="map-error">Koordinat tidak valid untuk peta</div>';
      return;
    }

    try {
      const map = new maplibregl.Map({
        container: mapContainer,
        style: mapConfig.style,
        center: [lon, lat],
        zoom: 10,
        interactive: true,
      });

      new maplibregl.Marker()
        .setLngLat([lon, lat])
        .setPopup(new maplibregl.Popup().setHTML(
          `<h3>Story</h3><p>Koordinat: ${lat.toFixed(6)}, ${lon.toFixed(6)}</p>`
        ))
        .addTo(map);

      map.on("styleimagemissing", (e) => {
        console.log("Gambar hilang:", e.id);
        map.addImage(e.id, new Image(1, 1));
      });
    } catch (error) {
      console.error(`Gagal merender peta untuk story ${id}:`, error);
      mapContainer.innerHTML = '<div class="map-error">Gagal memuat peta</div>';
    }
  }

  showEmptyStories() {
    const storiesContainer = document.getElementById("stories-container");
    if (storiesContainer) {
      storiesContainer.innerHTML = '<p class="empty-message">Belum ada cerita yang dibagikan.</p>';
    }
  }

  showLoginRequiredMessage() {
    const errorElement = document.getElementById("error-message");
    if (errorElement) {
      errorElement.textContent = "Silakan login untuk melihat cerita.";
      errorElement.classList.add("info-message");
    }
  }

  showLoading() {
    const loadingContainer = document.getElementById("loading-container");
    if (loadingContainer) {
      loadingContainer.innerHTML = '<div class="loading-spinner"></div>';
    }
  }

  hideLoading() {
    const loadingContainer = document.getElementById("loading-container");
    if (loadingContainer) {
      loadingContainer.innerHTML = "";
    }
  }

  showError(message) {
    const errorElement = document.createElement('div');
    errorElement.textContent = message;
    errorElement.style.cssText = 'color: red; margin: 10px 0;';
    document.getElementById('stories-container')?.prepend(errorElement);
    setTimeout(() => errorElement.remove(), 3000);
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

export default HomeView;