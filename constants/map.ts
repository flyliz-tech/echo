/** OpenFreeMap — free vector tiles, no API key. */
export const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

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
