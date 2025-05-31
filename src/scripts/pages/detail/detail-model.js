import ApiService from '../../data/api';
import AuthUtils from '../../utils/auth';
import CONFIG from '../../config';

export async function getAuthToken() {
  return AuthUtils.getToken();
}

export async function fetchStoryDetail(token, id) {
  return await ApiService.getStoryDetail(token, id);
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