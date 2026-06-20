const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim();

/**
 * Mapbox style URL.
 * Falls back to OpenFreeMap when token is not configured so local builds still render.
 */
export const MAP_STYLE_URL = MAPBOX_ACCESS_TOKEN
  ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12?access_token=${MAPBOX_ACCESS_TOKEN}`
  : "https://tiles.openfreemap.org/styles/liberty";

export const DEFAULT_CENTER = {
  latitude: 13.0654,
  longitude: 74.9982,
} as const;

/** Street-level zoom used when recentering on the user's current location. */
export const RECENTER_ZOOM = 15;

/** Approximate MapLibre zoom from react-native-maps latitudeDelta. */
export function latitudeDeltaToZoom(latitudeDelta: number): number {
  return Math.log2(360 / latitudeDelta) - 1;
}
