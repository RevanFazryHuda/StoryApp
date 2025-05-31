import CONFIG from '../config';
import Database from '../data/database';

class ApiService {
  static async getAllStories(token, location = 0) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/stories?location=${location}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!data.error && data.listStory) {
        await Database.saveStories(data.listStory);
      }
      return data;
    } catch (error) {
      console.error('Error fetching stories:', error);
      // Fallback ke IndexedDB untuk semua error terkait jaringan
      if (!navigator.onLine || error.message.includes('Failed to fetch') || error.message.includes('net::ERR_FAILED') || error.name === 'TypeError') {
        console.log('Offline mode: Fetching stories from IndexedDB');
        const stories = await Database.getAllStories();
        return { error: false, listStory: stories || [] };
      }
      throw new Error('Gagal memuat cerita dari server: ' + error.message);
    }
  }

  static async register({ name, email, password }) {
    const response = await fetch(`${CONFIG.BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  }

  static async login({ email, password }) {
    const response = await fetch(`${CONFIG.BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  }

  static async getStoryDetail(token, id) {
    const response = await fetch(`${CONFIG.BASE_URL}/stories/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  }

  static async addStory(token, { description, photo, lat, lon }) {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photo);
    if (lat && lon) {
      formData.append('lat', lat);
      formData.append('lon', lon);
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to add story: HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  static async addStoryGuest({ description, photo, lat, lon }) {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photo);
    if (lat && lon) {
      formData.append('lat', lat);
      formData.append('lon', lon);
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/stories/guest`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to add story as guest: HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  static async searchLocation(query) {
    if (!query.trim()) {
      throw new Error("Masukkan nama lokasi untuk mencari");
    }
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
    );
    return response.json();
  }

  static async subscribePushNotification(token, subscription) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(subscription),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Gagal berlangganan: HTTP ${response.status}`);
      }
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw new Error(`Gagal berlangganan notifikasi: ${error.message}`);
    }
  }
  
  static async unsubscribePushNotification(token, endpoint) {
    const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ endpoint }),
    });
    return response.json();
  }
}

export default ApiService;