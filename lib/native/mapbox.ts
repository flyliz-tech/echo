import { NativeModules } from "react-native";

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim() ?? "";

export function hasMapboxToken(): boolean {
  return MAPBOX_TOKEN.length > 0;
}

export function isMapboxAvailable(): boolean {
  const turbo = (globalThis as { __turboModuleProxy?: (name: string) => unknown })
    .__turboModuleProxy;
  if (typeof turbo === "function") {
    try {
      const module = turbo("RNMBXModule");
      if (module) return true;
    } catch {
      // fall through to classic module checks
    }
  }

  return (
    NativeModules.RNMBXModule != null ||
    NativeModules.RNMBXMapViewModule != null ||
    Object.keys(NativeModules).some((key) => key.startsWith("RNMBX"))
  );
}
