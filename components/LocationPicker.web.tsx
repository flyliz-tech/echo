import {
  LocationPickerFallback,
  type LocationPickerProps,
} from "@/components/LocationPickerFallback";

export function LocationPicker(props: LocationPickerProps) {
  return (
    <LocationPickerFallback
      {...props}
      message="Map picker available on iOS and Android"
    />
  );
}
