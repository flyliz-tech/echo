import * as Location from "expo-location";

/** Mapbox Search API with session tokens + lightweight client-side caching. */

export interface GeocodeResult {
  name: string;
  latitude: number;
  longitude: number;
}

const MAPBOX_BASE = "https://api.mapbox.com/search/searchbox/v1";
const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim() ?? "";
const SESSION_TTL_MS = 30 * 60 * 1000;
const SEARCH_CACHE_TTL_MS = 5 * 60 * 1000;
const REVERSE_CACHE_TTL_MS = 60 * 60 * 1000;
const CACHE_MAX_ENTRIES = 100;
const DEFAULT_SOFT_DAILY_LIMIT = 900;

interface MapboxFeature {
  geometry?: { coordinates?: [number, number] };
  properties?: {
    name?: string;
    full_address?: string;
    place_formatted?: string;
    feature_name?: string;
    address?: string;
  };
}

interface CachedSearch {
  ts: number;
  results: GeocodeResult[];
}

interface CachedReverse {
  ts: number;
  name: string | null;
}

let activeSessionToken = "";
let activeSessionCreatedAt = 0;
let activeDay = new Date().toISOString().slice(0, 10);
let requestCountToday = 0;
let warnedOverSoftLimit = false;
const searchCache = new Map<string, CachedSearch>();
const reverseCache = new Map<string, CachedReverse>();

function resetDailyUsageIfNeeded() {
  const day = new Date().toISOString().slice(0, 10);
  if (day === activeDay) return;
  activeDay = day;
  requestCountToday = 0;
  warnedOverSoftLimit = false;
}

function trackUsage() {
  resetDailyUsageIfNeeded();
  requestCountToday += 1;
  const softLimitRaw = Number(process.env.EXPO_PUBLIC_MAPBOX_SOFT_DAILY_LIMIT);
  const softLimit =
    Number.isFinite(softLimitRaw) && softLimitRaw > 0
      ? softLimitRaw
      : DEFAULT_SOFT_DAILY_LIMIT;
  if (!warnedOverSoftLimit && requestCountToday >= softLimit) {
    warnedOverSoftLimit = true;
    console.warn(
      `[mapbox] Soft daily limit reached (${requestCountToday}/${softLimit}). Consider throttling usage.`
    );
  }
}

function ensureSessionToken(): string {
  const now = Date.now();
  if (
    activeSessionToken &&
    now - activeSessionCreatedAt < SESSION_TTL_MS
  ) {
    return activeSessionToken;
  }

  activeSessionToken = `${now}-${Math.random().toString(36).slice(2, 10)}`;
  activeSessionCreatedAt = now;
  return activeSessionToken;
}

function cacheGet<T extends { ts: number }>(
  cache: Map<string, T>,
  key: string,
  ttlMs: number
): T | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.ts > ttlMs) {
    cache.delete(key);
    return null;
  }
  return hit;
}

function cacheSet<T>(cache: Map<string, T>, key: string, value: T) {
  if (cache.size >= CACHE_MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value as string | undefined;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, value);
}

function mapboxFeatureToResult(feature: MapboxFeature): GeocodeResult | null {
  const coords = feature.geometry?.coordinates;
  if (!coords) return null;
  const [longitude, latitude] = coords;
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return null;

  const props = feature.properties;
  const name =
    props?.full_address?.trim() ||
    props?.place_formatted?.trim() ||
    props?.name?.trim() ||
    props?.feature_name?.trim() ||
    props?.address?.trim() ||
    "";

  if (!name) return null;
  return { name, latitude, longitude };
}

function buildMapboxUrl(endpoint: string, params: URLSearchParams): string {
  params.set("access_token", MAPBOX_ACCESS_TOKEN);
  return `${MAPBOX_BASE}/${endpoint}?${params.toString()}`;
}

export async function searchPlaces(query: string): Promise<GeocodeResult[]> {
  const q = query.trim();
  if (q.length < 3) return [];
  if (!MAPBOX_ACCESS_TOKEN) return [];

  const cacheKey = q.toLowerCase();
  const cached = cacheGet(searchCache, cacheKey, SEARCH_CACHE_TTL_MS);
  if (cached) return cached.results;

  try {
    trackUsage();
    const sessionToken = ensureSessionToken();
    const params = new URLSearchParams({
      q,
      language: "en",
      limit: "6",
      session_token: sessionToken,
    });
    const url = buildMapboxUrl("forward", params);
    const res = await fetch(url);
    if (!res.ok) return [];

    const data = (await res.json()) as { features?: MapboxFeature[] };
    const results = (data.features ?? [])
      .map(mapboxFeatureToResult)
      .filter((r): r is GeocodeResult => r !== null);

    const seen = new Set<string>();
    const deduped = results.filter((r) => {
      if (seen.has(r.name)) return false;
      seen.add(r.name);
      return true;
    });
    cacheSet(searchCache, cacheKey, { ts: Date.now(), results: deduped });
    return deduped;
  } catch {
    return [];
  }
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string | null> {
  if (!MAPBOX_ACCESS_TOKEN) {
    return reverseGeocodeWithDeviceFallback(latitude, longitude);
  }

  const roundedLat = latitude.toFixed(5);
  const roundedLng = longitude.toFixed(5);
  const cacheKey = `${roundedLat},${roundedLng}`;
  const cached = cacheGet(reverseCache, cacheKey, REVERSE_CACHE_TTL_MS);
  if (cached) return cached.name;

  try {
    trackUsage();
    const sessionToken = ensureSessionToken();
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      language: "en",
      limit: "1",
      session_token: sessionToken,
    });
    const url = buildMapboxUrl("reverse", params);
    const res = await fetch(url);
    if (res.ok) {
      const data = (await res.json()) as { features?: MapboxFeature[] };
      const first = data.features?.[0];
      const mapped = first ? mapboxFeatureToResult(first) : null;
      if (mapped?.name) {
        cacheSet(reverseCache, cacheKey, { ts: Date.now(), name: mapped.name });
        return mapped.name;
      }
    }
  } catch {
    // fall through to OS geocoder
  }

  const fallback = await reverseGeocodeWithDeviceFallback(latitude, longitude);
  cacheSet(reverseCache, cacheKey, { ts: Date.now(), name: fallback });
  return fallback;
}

async function reverseGeocodeWithDeviceFallback(
  latitude: number,
  longitude: number
): Promise<string | null> {
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
