import type { Feature, FeatureCollection, Polygon } from "geojson";

const EARTH_RADIUS_METERS = 6_371_000;

export function circlePolygon(
  longitude: number,
  latitude: number,
  radiusMeters: number,
  points = 64
): Feature<Polygon> {
  const ring: [number, number][] = [];

  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const dx = radiusMeters * Math.cos(angle);
    const dy = radiusMeters * Math.sin(angle);
    const lat = latitude + (dy / EARTH_RADIUS_METERS) * (180 / Math.PI);
    const lng =
      longitude +
      (dx / (EARTH_RADIUS_METERS * Math.cos((latitude * Math.PI) / 180))) *
        (180 / Math.PI);
    ring.push([lng, lat]);
  }

  return {
    type: "Feature",
    geometry: { type: "Polygon", coordinates: [ring] },
    properties: {},
  };
}

export function circleFeatureCollection(
  longitude: number,
  latitude: number,
  radiusMeters: number
): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: [circlePolygon(longitude, latitude, radiusMeters)],
  };
}
