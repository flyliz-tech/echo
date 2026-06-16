import type {
  Feature,
  FeatureCollection,
  LineString,
  Polygon,
} from "geojson";

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

function hasValidInput(
  longitude: number,
  latitude: number,
  radiusMeters: number
): boolean {
  return (
    Number.isFinite(longitude) &&
    Number.isFinite(latitude) &&
    radiusMeters > 0
  );
}

export function circlePolygonCollection(
  longitude: number,
  latitude: number,
  radiusMeters: number
): FeatureCollection {
  if (!hasValidInput(longitude, latitude, radiusMeters)) {
    return { type: "FeatureCollection", features: [] };
  }

  return {
    type: "FeatureCollection",
    features: [circlePolygon(longitude, latitude, radiusMeters)],
  };
}

export function circleOutlineCollection(
  longitude: number,
  latitude: number,
  radiusMeters: number
): FeatureCollection {
  if (!hasValidInput(longitude, latitude, radiusMeters)) {
    return { type: "FeatureCollection", features: [] };
  }

  const polygon = circlePolygon(longitude, latitude, radiusMeters);
  const outline: Feature<LineString> = {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: polygon.geometry.coordinates[0],
    },
    properties: {},
  };

  return {
    type: "FeatureCollection",
    features: [outline],
  };
}
