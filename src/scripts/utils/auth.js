import Database from '../data/database';

class AuthUtils {
  static saveToken(token) {
    Database.saveToken(token);
  }

  static getToken() {
    return Database.getToken();
  }

  static removeToken() {
    Database.removeToken();
  }

  static saveUser(user) {
    Database.saveUser(user);
  }

  static getUser() {
    return Database.getUser();
  }

  static removeUser() {
    Database.removeUser();
  }

  static logout() {
    this.removeToken();
    this.removeUser();
  }

  static isAuthenticated() {
    const token = this.getToken();
    return !!token;
  }
}

export default AuthUtils;