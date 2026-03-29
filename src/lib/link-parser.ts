import type { LatLng } from "@/types";

const patterns = [
  /@(-?\d+\.\d+),(-?\d+\.\d+)/, // @lat,lng
  /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, // !3dlat!4dlng
  /q=(-?\d+\.\d+),(-?\d+\.\d+)/, // q=lat,lng
];

export function parseGoogleMapsLink(url: string): LatLng | null {
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }
  }
  return null;
}

export function isGoogleMapsLink(text: string): boolean {
  return /google\.(com|co\.\w+)\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/.test(
    text
  );
}
