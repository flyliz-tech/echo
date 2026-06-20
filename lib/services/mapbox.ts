import Mapbox from "@rnmapbox/maps";

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim() ?? "";

let configured = false;

export function configureMapbox() {
  if (configured || !MAPBOX_TOKEN) return;
  configured = true;
  void Mapbox.setAccessToken(MAPBOX_TOKEN);
}
