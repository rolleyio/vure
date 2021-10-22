import { geohashForLocation } from 'geofire-common';

export function geohashLocation(latLng: [number, number], precision?: number) {
  const [lat, lng] = latLng;

  return {
    lat,
    lng,
    geohash: geohashForLocation(latLng, precision),
  };
}
