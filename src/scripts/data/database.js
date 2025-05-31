import { openDB } from 'idb';
import CONFIG from '../config';

class Database {
  static TOKEN_KEY = 'dicoding_story_token';
  static USER_KEY = 'dicoding_story_user';

  static async initDb() {
    return openDB(CONFIG.DATABASE_NAME, CONFIG.DATABASE_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(CONFIG.OBJECT_STORE_NAME)) {
          db.createObjectStore(CONFIG.OBJECT_STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }

  static async saveStories(stories) {
    try {
      const db = await this.initDb();
      const tx = db.transaction(CONFIG.OBJECT_STORE_NAME, 'readwrite');
      const store = tx.objectStore(CONFIG.OBJECT_STORE_NAME);
      for (const story of stories) {
        await store.put(story);
      }
      await tx.done;
      console.log('Stories saved to IndexedDB');
      return true;
    } catch (error) {
      console.error('Error saving stories:', error);
      return false;
    }
  }

  static async getAllStories() {
    try {
      const db = await this.initDb();
      const tx = db.transaction(CONFIG.OBJECT_STORE_NAME, 'readonly');
      const store = tx.objectStore(CONFIG.OBJECT_STORE_NAME);
      const stories = await store.getAll();
      console.log('Retrieved stories from IndexedDB:', stories);
      return stories;
    } catch (error) {
      console.error('Error getting stories:', error);
      return [];
    }
  }

  static saveToken(token) {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
      return true;
    } catch (error) {
      console.error('Error saving token:', error);
      return false;
    }
  }

  static getToken() {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  static removeToken() {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      return true;
    } catch (error) {
      console.error('Error removing token:', error);
      return false;
    }
  }

  static saveUser(user) {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      return true;
    } catch (error) {
      console.error('Error saving user:', error);
      return false;
    }
  }

  static getUser() {
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  static removeUser() {
    try {
      localStorage.removeItem(this.USER_KEY);
      return true;
    } catch (error) {
      console.error('Error removing user:', error);
      return false;
    }
  }
}

export default Database;