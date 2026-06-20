/** Mapbox-hosted style used by the native Mapbox SDK renderer. */
export const MAP_STYLE_URL = "mapbox://styles/mapbox/streets-v11";

export const DEFAULT_CENTER = {
  latitude: 13.0654,
  longitude: 74.9982,
} as const;

/** Street-level zoom used when recentering on the user's current location. */
export const RECENTER_ZOOM = 15;

/** Approximate Mapbox zoom from react-native-maps latitudeDelta. */
export function latitudeDeltaToZoom(latitudeDelta: number): number {
  return Math.log2(360 / latitudeDelta) - 1;
}
