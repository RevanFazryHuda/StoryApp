import ApiService from "../data/api";
import AuthUtils from "../utils/auth";
import CONFIG from "../config";

class WebPush {
  static async init() {
    if (!this._isPushSupported()) {
      console.log("Push notification tidak didukung oleh browser");
      return { success: false, message: "Push notification tidak didukung oleh browser" };
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      console.log("ServiceWorker siap untuk push notification");

      const hasPermission = await this.ensurePermission();
      if (!hasPermission) {
        console.log("Izin notifikasi tidak diberikan");
        return { success: false, message: "Izin notifikasi tidak diberikan. Silakan izinkan notifikasi di pengaturan browser." };
      }

      console.log("VAPID Public Key:", CONFIG.VAPID_PUBLIC_KEY);
      let applicationServerKey;
      try {
        applicationServerKey = this._urlBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY);
        console.log("Application Server Key:", applicationServerKey, "Length:", applicationServerKey.length);
        if (applicationServerKey.length !== 65) {
          throw new Error("Kunci VAPID tidak valid: panjang Uint8Array harus 65 byte");
        }
      } catch (keyError) {
        console.error("Gagal mengonversi kunci VAPID:", keyError);
        return { success: false, message: "Kunci VAPID tidak valid" };
      }

      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log("Sudah berlangganan push notification:", existingSubscription);
        return { success: true, message: "Sudah berlangganan notifikasi" };
      }

      console.log("Membuat langganan push baru...");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
      console.log("Langganan push berhasil dibuat:", subscription);

      const token = AuthUtils.getToken();
      if (!token) {
        console.log("Token autentikasi tidak ditemukan");
        return { success: false, message: "Silakan login untuk berlangganan notifikasi" };
      }

      console.log("Mengirim langganan ke server...");
      const response = await ApiService.subscribePushNotification(token, subscription);
      if (response.error) {
        throw new Error(response.message || "Gagal berlangganan notifikasi");
      }

      console.log("Berlangganan push notification berhasil");
      return { success: true, message: "Berlangganan notifikasi berhasil" };
    } catch (error) {
      console.error("Gagal mengatur push notification:", error);
      console.error("Detail error:", error.name, error.message, error.stack);
      return { success: false, message: `Gagal mengatur notifikasi: ${error.message}` };
    }
  }

  static async unsubscribe() {
    if (!this._isPushSupported()) {
      console.log("Push notification tidak didukung oleh browser");
      return { success: false, message: "Push notification tidak didukung oleh browser" };
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        console.log("Tidak ada langganan push untuk dibatalkan");
        return { success: true, message: "Tidak ada langganan untuk dibatalkan" };
      }

      const token = AuthUtils.getToken();
      if (!token) {
        console.log("Token autentikasi tidak ditemukan");
        return { success: false, message: "Silakan login untuk membatalkan langganan notifikasi" };
      }

      console.log("Mengirim permintaan unsubscribe ke server...");
      const response = await ApiService.unsubscribePushNotification(token, subscription);
      if (response.error) {
        throw new Error(response.message || "Gagal membatalkan langganan notifikasi");
      }

      await subscription.unsubscribe();
      console.log("Langganan push berhasil dibatalkan");
      return { success: true, message: "Berhasil membatalkan langganan notifikasi" };
    } catch (error) {
      console.error("Gagal membatalkan langganan push:", error);
      return { success: false, message: `Gagal membatalkan notifikasi: ${error.message}` };
    }
  }

  static async showNotification({ title = "Story berhasil dibuat", options = {} }) {
    if (!this._isPushSupported()) {
      console.log("Push notification tidak didukung");
      return { success: false, message: "Push notification tidak didukung oleh browser" };
    }

    try {
      const hasPermission = await this.ensurePermission();
      if (!hasPermission) {
        console.log("Izin notifikasi tidak diberikan");
        return { success: false, message: "Izin notifikasi tidak diberikan. Silakan izinkan notifikasi di pengaturan browser." };
      }

      const registration = await navigator.serviceWorker.ready;
      const defaultOptions = {
        body: options.body || "Anda telah membuat story baru dengan deskripsi: Tidak ada deskripsi.",
        icon: "/images/logo.png",
        vibrate: [200, 100, 200],
      };

      await registration.showNotification(title, { ...defaultOptions, ...options });
      console.log("Notifikasi ditampilkan");
      return { success: true, message: "Notifikasi ditampilkan" };
    } catch (error) {
      console.error("Gagal menampilkan notifikasi:", error);
      return { success: false, message: `Gagal menampilkan notifikasi: ${error.message}` };
    }
  }

  static async _requestNotificationPermission() {
    if (Notification.permission === "granted") {
      return "granted";
    }
    return await Notification.requestPermission();
  }

  static _isPushSupported() {
    return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  }

  static _urlBase64ToUint8Array(base64String) {
    try {
      const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    } catch (error) {
      throw new Error(`Gagal mengonversi base64 ke Uint8Array: ${error.message}`);
    }
  }

  static async checkPermissionStatus() {
    if (!this._isPushSupported()) {
      return { hasPermission: false, status: 'not-supported' };
    }
    return {
      hasPermission: Notification.permission === 'granted',
      status: Notification.permission
    };
  }

  static async ensurePermission() {
    const { hasPermission } = await this.checkPermissionStatus();
    if (!hasPermission) {
      const permission = await this._requestNotificationPermission();
      return permission === 'granted';
    }
    return true;
  }
}

export default WebPush;