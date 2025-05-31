export function showFormattedDate(date, locale = 'id-ID', options = {}) {
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options,
    });
  }
  
  export function sleep(time = 1000) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }
  
  export function parseActivePathname() {
    const pathname = window.location.hash.replace('#', '') || '/';
    const splitUrl = pathname.split('/');
    return {
      resource: splitUrl[1] || null,
      id: splitUrl[2] || null,
    };
  }