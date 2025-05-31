export function enableViewTransitions() {
  if (!document.startViewTransition) {
    return;
  }

  document.addEventListener('click', (event) => {
    const anchor = event.target.closest('a');
    if (!anchor) return;

    const url = new URL(anchor.href);
    if (url.origin !== location.origin) return;

    event.preventDefault();
    document.startViewTransition(() => {
      window.location.href = url.href;
    });
  });

  window.addEventListener('hashchange', (event) => {
    // Cek apakah ini adalah navigasi ke halaman detail
    if (event.newURL.includes('#/detail/')) {
      // Jika browser mendukung View Transitions API, gunakan itu
      if (document.startViewTransition) {
        document.startViewTransition(() => {
          // Navigation sudah terjadi oleh hashchange, jadi tidak perlu mengarahkan lagi
        });
      }
    }
  });
}

