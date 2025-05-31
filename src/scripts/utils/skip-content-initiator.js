class SkipContentInitiator {
  constructor({ skipLink, mainContent }) {
    this._skipLink = skipLink;
    this._mainContent = mainContent;
  }

  init() {
    this._registerEvent();
  }

  _registerEvent() {
    this._skipLink.addEventListener("click", (event) => {
      event.preventDefault();
      this._skipLink.blur();

      // Cek apakah saat ini berada di halaman login
      const currentHash = window.location.hash;

      if (currentHash === "#/auth/login") {
        // Jika di halaman login, fokuskan ke input email
        setTimeout(() => {
          const emailInput = document.getElementById("email");
          if (emailInput) {
            emailInput.focus();
            console.log("Skip to email input activated");
          } else {
            // Fallback jika input email belum tersedia
            this._focusMainContent();
            console.log("Email input not found, focusing main content instead");
          }
        }, 100); // Delay sedikit untuk memastikan DOM sudah dirender
      } else if (currentHash === "#/auth/register") {
        // Jika di halaman register, fokuskan ke input name
        setTimeout(() => {
          const nameInput = document.getElementById("name");
          if (nameInput) {
            nameInput.focus();
            console.log("Skip to name input activated");
          } else {
            // Fallback jika input name belum tersedia
            this._focusMainContent();
            console.log("Name input not found, focusing main content instead");
          }
        }, 100);
      } else {
        // Untuk halaman lain, tetap fokuskan ke main content
        this._focusMainContent();
        console.log("Skip to content activated");
      }
    });
  }

  _focusMainContent() {
    // Pastikan main content bisa difokuskan
    this._mainContent.setAttribute("tabindex", "-1");

    // Fokuskan ke main content
    this._mainContent.focus();

    // Scroll ke main content
    this._mainContent.scrollIntoView({ behavior: "smooth" });
  }
}

export default SkipContentInitiator;
