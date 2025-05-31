import App from './pages/app';
import '../styles/styles.css';
import CONFIG from './config';
import AuthUtils from './utils/auth';
import WebPush from './utils/web-push';

// Flag untuk mencegah multiple renders
let isRendering = false;
let lastPathname = null;

// Setup event handler untuk logout
const setupLogoutHandler = () => {
  const logoutLink = document.getElementById('logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', (event) => {
      event.preventDefault();
      console.log('Logout diklik, melakukan logout...');
      AuthUtils.logout();
      history.pushState(null, null, '/auth/login');
      app.renderPage().finally(() => {
        setupLogoutHandler();
      });
    });
  }
};

// Registrasi Service Worker
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const swFile = process.env.NODE_ENV === 'production' ? '/sw.bundle.js' : '/sw.js';
      const registration = await navigator.serviceWorker.register(swFile);
      console.log('Service worker terdaftar:', registration);

      if (!navigator.serviceWorker.controller) {
        await new Promise((resolve) => {
          const onControllerChange = () => {
            navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
            resolve();
          };
          navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
        });
      }

      return registration;
    } catch (error) {
      console.error('Gagal mendaftarkan service worker:', error);
    }
  }
};

// Inisialisasi app
const app = new App({
  navigationDrawer: document.getElementById('navigation-drawer'),
  drawerButton: document.getElementById('drawer-button'),
  content: document.getElementById('main-content'),
});

window.addEventListener('popstate', () => {
  const currentPathname = window.location.pathname;
  if (currentPathname === lastPathname) {
    console.log('Pathname sama, mengabaikan perubahan');
    return;
  }

  if (!isRendering) {
    isRendering = true;
    lastPathname = currentPathname;
    console.log('Pathname berubah ke:', currentPathname);
    setTimeout(() => {
      app.renderPage().finally(() => {
        isRendering = false;
        setupLogoutHandler();
      });
    });
  } else {
    console.log('Sedang rendering, menunda render');
    lastPathname = currentPathname;
  }
});

window.addEventListener('load', () => {
  console.log('Memuat halaman awal...');
  isRendering = true;

  app.renderPage().finally(() => {
    isRendering = false;
    console.log('Render awal selesai');
    setupLogoutHandler();
  });

  setTimeout(async () => {
    const registration = await registerServiceWorker();
    if (registration) {
      const permissionStatus = await WebPush.checkPermissionStatus();
      console.log('Status izin notifikasi:', permissionStatus);
      if (permissionStatus.status === 'denied') {
        console.log('Izin notifikasi diblokir, lewati inisialisasi push notification');
        const errorElement = document.createElement('div');
        errorElement.textContent = 'Notifikasi diblokir. Klik ikon kunci di bilah alamat, pilih "Site settings", dan izinkan notifikasi.';
        errorElement.style.cssText = 'color: orange; margin: 10px; text-align: center; font-size: 14px;';
        document.body.prepend(errorElement);
        setTimeout(() => errorElement.remove(), 5000);
        return;
      }

      const result = await WebPush.init();
      if (result && !result.success) {
        console.warn('Gagal mengatur push notification:', result.message);
        const errorElement = document.createElement('div');
        errorElement.textContent = result.message;
        errorElement.style.cssText = 'color: orange; margin: 10px; text-align: center; font-size: 14px;';
        document.body.prepend(errorElement);
        setTimeout(() => errorElement.remove(), 5000);
      } else if (result && result.success) {
        console.log('Push notification berhasil diatur:', result.message);
        const successElement = document.createElement('div');
        successElement.textContent = result.message;
        successElement.style.cssText = 'color: green; margin: 10px; text-align: center; font-size: 14px;';
        document.body.prepend(successElement);
        setTimeout(() => successElement.remove(), 5000);
        // Uji notifikasi setelah subscribe berhasil
        await WebPush.showNotification({
          title: "Story berhasil dibuat",
          options: {
            body: "Anda telah membuat story baru dengan deskripsi: Selamat datang di Dicoding Story App!",
          },
        });
      }
    }
  }, 500);
});

// Logging untuk debugging
console.log("Pemeriksaan lingkungan:", {
  localStorage: !!window.localStorage,
  fetch: !!window.fetch,
  baseUrl: CONFIG.BASE_URL
});

const token = AuthUtils.getToken();
if (token && navigator.onLine) {
  console.log("Menguji API dengan token autentikasi");
  fetch(`${CONFIG.BASE_URL}/stories`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(response => {
      console.log("Respon tes API:", response.status);
      if (response.status === 401) {
        console.warn("Token mungkin kedaluwarsa, menghapus token dan mengarahkan ke login");
        AuthUtils.logout();
        history.pushState(null, null, '/auth/login'); 
        app.renderPage().finally(() => {
          setupLogoutHandler();
        });
      }
    })
    .catch(error => console.error("Error tes API:", error));
} else {
  console.log("User belum login atau offline, melewatkan tes API");
}