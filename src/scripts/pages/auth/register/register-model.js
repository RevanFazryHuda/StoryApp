import ApiService from '../../../data/api';
import AuthUtils from '../../../utils/auth';

export async function getAuthToken() {
  return AuthUtils.getToken();
}

export async function registerUser(formData) {
  return await ApiService.register(formData);
}