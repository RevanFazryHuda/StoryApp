import ApiService from '../../../data/api';
import Database from '../../../data/database';
import AuthUtils from '../../../utils/auth';

export async function loginUser(formData) {
  return await ApiService.login(formData);
}

export async function storeUserData(token, user) {
  await Database.saveToken(token);
  await Database.saveUser(user);
}

export async function getAuthToken() {
  return AuthUtils.getToken();
}