import { isMapLibreAvailable } from "@/lib/native/mapLibre";

import MapTabScreenFallback from "./MapTabScreenFallback";

export default function MapTabScreen() {
  if (!isMapLibreAvailable()) {
    return <MapTabScreenFallback />;
  }

  const MapLibreScreen =
    require("@/components/MapTabScreenMapLibre").default as typeof import("@/components/MapTabScreenMapLibre").default;

  return <MapLibreScreen />;
}
