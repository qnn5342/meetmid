import type { LatLng, Location } from "@/types";

export function calculateMidpoint(locations: Location[]): LatLng {
  const lat =
    locations.reduce((sum, l) => sum + l.lat, 0) / locations.length;
  const lng =
    locations.reduce((sum, l) => sum + l.lng, 0) / locations.length;
  return { lat, lng };
}

export function distanceBetween(a: LatLng, b: LatLng): number {
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
