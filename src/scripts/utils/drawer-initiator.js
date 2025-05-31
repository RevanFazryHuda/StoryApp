class DrawerInitiator {
  static init({ drawer, button }) {
    button.addEventListener('click', () => {
      drawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (!drawer.contains(event.target) && !button.contains(event.target)) {
        drawer.classList.remove('open');
      }

      drawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          drawer.classList.remove('open');
        }
      });
    });
  }
}

export default DrawerInitiator;