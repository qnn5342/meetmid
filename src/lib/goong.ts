import type { LatLng, Place } from "@/types";
import { distanceBetween } from "./midpoint";

const GOONG_KEY = process.env.NEXT_PUBLIC_GOONG_API_KEY || "";

export interface GoongPrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export async function autocomplete(
  input: string
): Promise<GoongPrediction[]> {
  if (!input || input.length < 2) return [];

  const res = await fetch(
    `https://rsapi.goong.io/Place/AutoComplete?input=${encodeURIComponent(input)}&api_key=${GOONG_KEY}`
  );
  if (!res.ok) return [];

  const data = await res.json();
  return data.predictions || [];
}

export async function getPlaceDetail(
  placeId: string
): Promise<LatLng | null> {
  const res = await fetch(
    `https://rsapi.goong.io/Place/Detail?place_id=${encodeURIComponent(placeId)}&api_key=${GOONG_KEY}`
  );
  if (!res.ok) return null;

  const data = await res.json();
  const loc = data.result?.geometry?.location;
  if (!loc) return null;

  return { lat: loc.lat, lng: loc.lng };
}

export async function geocode(address: string): Promise<LatLng | null> {
  const res = await fetch(
    `https://rsapi.goong.io/Geocode?address=${encodeURIComponent(address)}&api_key=${GOONG_KEY}`
  );
  if (!res.ok) return null;

  const data = await res.json();
  const loc = data.results?.[0]?.geometry?.location;
  if (!loc) return null;

  return { lat: loc.lat, lng: loc.lng };
}

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string> {
  const res = await fetch(
    `https://rsapi.goong.io/Geocode?latlng=${lat},${lng}&api_key=${GOONG_KEY}`
  );
  if (!res.ok) return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

  const data = await res.json();
  return (
    data.results?.[0]?.formatted_address ||
    `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  );
}
