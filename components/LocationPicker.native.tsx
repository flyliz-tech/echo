import {
  LocationPickerFallback,
  type LocationPickerProps,
} from "@/components/LocationPickerFallback";
import { isMapLibreAvailable } from "@/lib/native/mapLibre";

export function LocationPicker(props: LocationPickerProps) {
  if (!isMapLibreAvailable()) {
    return <LocationPickerFallback {...props} />;
  }

  const { LocationPickerMapLibre } =
    require("@/components/LocationPickerMapLibre") as typeof import("@/components/LocationPickerMapLibre");

  return <LocationPickerMapLibre {...props} />;
}
