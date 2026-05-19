// Shared constants & helpers for private driver pickup calculations.

export const DAR_LYS_LAT = 34.0625;
export const DAR_LYS_LNG = -4.9745;
export const RATE_PER_KM = 10; // DH per km

export const haversineKm = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
) => {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

export type GeoLookup = {
  lat: number;
  lng: number;
  label: string;
};

export const geocodeAddress = async (query: string): Promise<GeoLookup | null> => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
  );
  const data = await res.json();
  if (!data?.length) return null;
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    label: data[0].display_name,
  };
};

export const reverseGeocode = async (lat: number, lng: number): Promise<string | undefined> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12`,
    );
    const data = await res.json();
    return data?.display_name as string | undefined;
  } catch {
    return undefined;
  }
};