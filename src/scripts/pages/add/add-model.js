import ApiService from '../../data/api';
import AuthUtils from '../../utils/auth';
import CONFIG from '../../config';

export async function getAuthToken() {
  return AuthUtils.getToken();
}

export async function addStory(token, { description, photo, lat, lon }) {
  return await ApiService.addStory(token, { description, photo, lat, lon });
}

export async function addStoryGuest({ description, photo, lat, lon }) {
  return await ApiService.addStoryGuest({ description, photo, lat, lon });
}

export async function searchLocation(query) {
  return await ApiService.searchLocation(query);
}

export function getMapConfig() {
  const mapStyle = CONFIG.MAP_STYLE.replace('UF8IB6hcumzoX6wsQVwE', CONFIG.MAPTILER_API_KEY);
  return {
    style: mapStyle
  };
}

export function isMapConfigValid() {
  return CONFIG.MAP_STYLE && CONFIG.MAPTILER_API_KEY;
}