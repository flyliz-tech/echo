import * as Location from "expo-location";

/**
 * Keyless geocoding via Photon (https://photon.komoot.io), backed by OSM data.
 * Provider-agnostic surface: swap the implementations for Mapbox/Google later
 * without touching callers.
 */

export interface GeocodeResult {
  name: string;
  latitude: number;
  longitude: number;
}

const PHOTON_BASE = "https://photon.komoot.io";

interface PhotonProperties {
  name?: string;
  street?: string;
  housenumber?: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  postcode?: string;
}

interface PhotonFeature {
  geometry?: { coordinates?: [number, number] };
  properties?: PhotonProperties;
}

function buildName(props: PhotonProperties): string {
  const head = props.name?.trim();
  const tail = [props.street, props.city ?? props.district, props.state, props.country]
    .map((p) => p?.trim())
    .filter((p): p is string => !!p && p !== head);

  const parts = head ? [head, ...tail] : tail;
  return parts.join(", ");
}

function featureToResult(feature: PhotonFeature): GeocodeResult | null {
  const coords = feature.geometry?.coordinates;
  const props = feature.properties;
  if (!coords || !props) return null;

  const [longitude, latitude] = coords;
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return null;

  const name = buildName(props);
  if (!name) return null;

  return { name, latitude, longitude };
}

export async function searchPlaces(query: string): Promise<GeocodeResult[]> {
  const q = query.trim();
  if (q.length < 3) return [];

  try {
    const url = `${PHOTON_BASE}/api/?q=${encodeURIComponent(q)}&limit=6&lang=en`;
    const res = await fetch(url);
    if (!res.ok) return [];

    const data = (await res.json()) as { features?: PhotonFeature[] };
    const results = (data.features ?? [])
      .map(featureToResult)
      .filter((r): r is GeocodeResult => r !== null);

    const seen = new Set<string>();
    return results.filter((r) => {
      if (seen.has(r.name)) return false;
      seen.add(r.name);
      return true;
    });
  } catch {
    return [];
  }
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    const url = `${PHOTON_BASE}/reverse?lat=${latitude}&lon=${longitude}&lang=en`;
    const res = await fetch(url);
    if (res.ok) {
      const data = (await res.json()) as { features?: PhotonFeature[] };
      const first = data.features?.[0]?.properties;
      if (first) {
        const name = buildName(first);
        if (name) return name;
      }
    }
  } catch {
    // fall through to OS geocoder
  }

  try {
    const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (place) {
      const parts = [
        place.name,
        place.street,
        place.city ?? place.subregion,
        place.region,
        place.country,
      ]
        .map((p) => p?.trim())
        .filter((p): p is string => !!p);
      const unique = [...new Set(parts)];
      if (unique.length) return unique.join(", ");
    }
  } catch {
    // ignore — reverse geocoding is best-effort
  }

  return null;
}
