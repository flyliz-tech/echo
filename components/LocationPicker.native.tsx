import {
  LocationPickerFallback,
  type LocationPickerProps,
} from "@/components/LocationPickerFallback";
import { hasMapboxToken, isMapboxAvailable } from "@/lib/native/mapbox";

export function LocationPicker(props: LocationPickerProps) {
  if (!isMapboxAvailable() || !hasMapboxToken()) {
    return <LocationPickerFallback {...props} />;
  }

  const { LocationPickerMapbox } =
    require("@/components/LocationPickerMapbox") as typeof import("@/components/LocationPickerMapbox");

  return <LocationPickerMapbox {...props} />;
}
