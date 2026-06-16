import { NativeModules } from "react-native";

export function isMapLibreAvailable(): boolean {
  return NativeModules.MLRNCameraModule != null;
}
