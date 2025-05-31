import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import DrawerInitiator from "../utils/drawer-initiator";
import AuthUtils from "../utils/auth";
import SkipContentInitiator from "../utils/skip-content-initiator";

class App {
  constructor({ navigationDrawer, drawerButton, content }) {
    this._navigationDrawer = navigationDrawer;
    this._drawerButton = drawerButton;
    this._content = content;
    this._isLoadingPage = false;
    this._currentRenderedPath = null;
    this._skipLink = document.querySelector(".skip-link");

    this._initializeApp();
  }

  async _initializeApp() {
    DrawerInitiator.init({
      drawer: this._navigationDrawer,
      button: this._drawerButton,
    });

    this._initSkipContent();

    this._setupLogout();
    await this._updateNavigationBasedOnAuth();
  }

  _initSkipContent() {
    const skipContentInitiator = new SkipContentInitiator({
      skipLink: this._skipLink,
      mainContent: this._content,
    });

    skipContentInitiator.init();
  }

  _setupLogout() {
    const logoutLink = document.getElementById("logout-link");
    if (logoutLink) {
      logoutLink.addEventListener("click", async (e) => {
        e.preventDefault();
        await AuthUtils.logout();
        await this._updateNavigationBasedOnAuth();
        window.location.href = "/auth/login";
      });
    }
  }

  async _updateNavigationBasedOnAuth() {
    try {
      const isAuthenticated = await AuthUtils.isAuthenticated();
      const navList = document.getElementById("nav-list");

      if (!navList) return;

      // Simpan referensi ke logout-link yang ada jika sudah ada
      const existingLogoutLink = document.getElementById("logout-link");
      let hadLogout = false;

      if (existingLogoutLink) {
        // Hapus event listener dari logoutLink lama jika ada
        const newLogoutLink = existingLogoutLink.cloneNode(true);
        if (existingLogoutLink.parentNode) {
          existingLogoutLink.parentNode.replaceChild(
            newLogoutLink,
            existingLogoutLink
          );
        }
        hadLogout = true;
      }

      // Buat menu navigasi berdasarkan status autentikasi
      if (isAuthenticated) {
        // Jika sebelumnya sudah authenticated, hindari rerender yang tidak perlu
        if (!hadLogout) {
          navList.innerHTML = `
            <li><a href="/">Beranda</a></li>
            <li><a href="/add">Tambah Story</a></li>
            <li><a href="/about">Tentang</a></li>
            <li><a href="" id="logout-link">Logout</a></li>
          `;
          // Setup ulang event listener untuk logout
          this._setupLogout();
        }
      } else {
        // User belum login, tampilkan menu login/register
        if (hadLogout) {
          navList.innerHTML = `
            <li><a href="/auth/login">Login</a></li>
            <li><a href="/auth/register">Register</a></li>
            <li><a href="/about">Tentang</a></li>
          `;
        }
      }
    } catch (error) {
      console.error("Error updating navigation:", error);
    }
  }

  async renderPage() {
    // Cegah multiple concurrent renders
    if (this._isLoadingPage) {
      console.log("Page is already loading, skipping render");
      return;
    }

    const currentPath = window.location.href;

    // Cek apakah kita me-render halaman yang sama
    if (this._currentRenderedPath === currentPath) {
      console.log("Same path, no need to re-render:", currentPath);
      return;
    }

    this._isLoadingPage = true;
    console.log("Starting page render for path:", currentPath);

    try {
      await this._updateNavigationBasedOnAuth();

      if (!document.startViewTransition) {
        await this._loadPage();
      } else {
        await document.startViewTransition(() => this._loadPage()).finished;
      }

      // Update path yang terakhir di-render
      this._currentRenderedPath = currentPath;
    } catch (error) {
      console.error("Error during page transition:", error);
      await this._loadPage(); // Fallback if transition fails
    } finally {
      this._isLoadingPage = false;
      console.log("Page render complete for:", currentPath);
    }
  }

  async _loadPage() {
    try {
      const url = getActiveRoute();
      console.log("Loading page for route:", url);

      let page = routes[url];

      // Handle specific auth routes directly if URL parser fails
      if (!page) {
        const pathname = window.location.href.slice(1);
        console.log("Route not found, trying pathname directly:", pathname);

        // Penanganan khusus untuk rute auth
        if (pathname === "/auth/login") {
          page = routes["/auth/login"];
        } else if (pathname === "/auth/register") {
          page = routes["/auth/register"];
        } else if (pathname === "/about") {
          page = routes["/about"];
        } else if (pathname === "/" || pathname === "") {
          page = routes["/"];
        }
      }

      // If page is still undefined, go to 404
      if (!page) {
        console.log("Page not found, showing 404 page");
        const notFoundPage = routes["/404"];
        if (notFoundPage) {
          this._content.innerHTML = await notFoundPage.render();
          await notFoundPage.afterRender();
        } else {
          this._content.innerHTML =
            '<div class="error-container">Halaman tidak ditemukan</div>';
        }
        return;
      }

      if (typeof page.render !== "function") {
        console.error("Page does not have a render method:", url);
        const notFoundPage = routes["/404"];
        if (notFoundPage) {
          this._content.innerHTML = await notFoundPage.render();
          await notFoundPage.afterRender();
        } else {
          this._content.innerHTML =
            '<div class="error-container">Struktur halaman tidak valid</div>';
        }
        return;
      }

      const renderedContent = await page.render();
      this._content.innerHTML = renderedContent;

      if (typeof page.afterRender === "function") {
        await page.afterRender();
      }
    } catch (error) {
      console.error("Error loading page:", error);
      try {
        const notFoundPage = routes["/404"];
        if (notFoundPage) {
          this._content.innerHTML = await notFoundPage.render();
          await notFoundPage.afterRender();
        } else {
          this._content.innerHTML =
            '<div class="error-container">Terjadi kesalahan saat memuat halaman</div>';
        }
      } catch (notFoundError) {
        console.error("Error showing 404 page:", notFoundError);
        this._content.innerHTML =
          '<div class="error-container">Terjadi kesalahan</div>';
      }
    }
    
    class NavigationView {
      updateNavigation(isAuthenticated) {
        const navList = document.getElementById("nav-list");
        navList.innerHTML = isAuthenticated
          ? `<li><a href="/">Beranda</a></li>...`
          : `<li><a href="/auth/login">Login</a></li>...`;
      }
    }
  }
}

export default App;