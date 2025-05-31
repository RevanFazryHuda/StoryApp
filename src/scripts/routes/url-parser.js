import routes from './routes.js';

export function extractPathnameSegments(path) {
  const trimmedPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Penanganan khusus untuk rute auth - DIPERBAIKI
  if (trimmedPath.startsWith('auth/')) {
    return { resource: trimmedPath, id: null };
  }
  
  // Penanganan khusus untuk detail dengan ID
  if (trimmedPath.startsWith('detail/')) {
    const segments = trimmedPath.split('/');
    if (segments.length >= 2) {
      return { resource: 'detail', id: segments[1] };
    }
  }
  
  // Penanganan default
  const segments = trimmedPath.split('/').filter(segment => segment);
  
  if (segments.length === 0) {
    return { resource: null, id: null };
  }
  
  if (segments.length === 1) {
    return { resource: segments[0], id: null };
  }
  
  return { resource: segments[0], id: segments[1] };
}

export function constructRouteFromSegments(pathSegments) {
  if (!pathSegments.resource) {
    return '/';
  }

  // Penanganan untuk rute auth - DIPERBAIKI
  if (pathSegments.resource.startsWith('auth/')) {
    return `/${pathSegments.resource}`; // Tambahkan leading slash
  }

  // Penanganan normal
  let pathname = `/${pathSegments.resource}`;
  
  if (pathSegments.id) {
    pathname = pathname.concat('/:id');
  }
  
  return pathname;
}

export function getActivePathname() {
  // Mengambil pathname dari URL dan memastikan selalu dimulai dengan "/"
  const pathname = location.pathname || '/';
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

export function getActiveRoute() {
  try {
    const pathname = getActivePathname();
    const urlSegments = extractPathnameSegments(pathname);
    const constructedRoute = constructRouteFromSegments(urlSegments);
    
    // Tambahan logging untuk debug
    console.log('Pathname:', pathname);
    console.log('URL Segments:', urlSegments);
    console.log('Constructed Route:', constructedRoute);
    console.log('Available Routes:', Object.keys(routes));
    
    if (!routes[constructedRoute]) {
      console.warn(`Rute ${constructedRoute} tidak ditemukan, mengarahkan ke 404`);
      return '/404';
    }

    return constructedRoute;
  } catch (error) {
    console.error('Error in getActiveRoute:', error);
    return '/404';
  }  
}

export function parseActivePathname() {
  const pathname = getActivePathname();
  return extractPathnameSegments(pathname);
}

export function getRoute(pathname) {
  const urlSegments = extractPathnameSegments(pathname);
  return constructRouteFromSegments(urlSegments);
}

export function parsePathname(pathname) {
  return extractPathnameSegments(pathname);
}