import { hasMapboxToken, isMapboxAvailable } from "@/lib/native/mapbox";

import MapTabScreenFallback from "./MapTabScreenFallback";

export default function MapTabScreen() {
  if (!isMapboxAvailable() || !hasMapboxToken()) {
    return <MapTabScreenFallback />;
  }

  const MapboxScreen =
    require("@/components/MapTabScreenMapbox").default as typeof import("@/components/MapTabScreenMapbox").default;

  return <MapboxScreen />;
}
