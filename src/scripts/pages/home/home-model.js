import ApiService from '../../data/api';
import Database from '../../data/database';
import AuthUtils from '../../utils/auth';
import CONFIG from '../../config';

export async function getAuthToken() {
  return AuthUtils.getToken();
}

export async function fetchAllStories(token, location = 1) {
  return await ApiService.getAllStories(token, location);
}

export async function getOfflineStories() {
  return await Database.getAllStories();
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