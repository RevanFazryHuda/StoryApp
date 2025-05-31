import CONFIG from '../config';

export function initMap(containerId, center, zoom = 12) {
  return new maplibregl.Map({
    container: containerId,
    style: CONFIG.MAP_STYLE,
    center,
    zoom
  });
}

export function addMarker(map, lngLat, popupContent = '', options = {}) {
  const marker = new maplibregl.Marker(options)
    .setLngLat(lngLat)
    .addTo(map);
  if (popupContent) {
    const popup = new maplibregl.Popup().setHTML(popupContent);
    marker.setPopup(popup);
  }
  return marker;
}
