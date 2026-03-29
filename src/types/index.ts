export interface LatLng {
  lat: number;
  lng: number;
}

export interface Location {
  id: string;
  lat: number;
  lng: number;
  label: string;
  source: "gps" | "pin" | "link" | "search";
}

export interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
  rating?: number;
  reviewCount?: number;
  distanceFromMidpoint: number;
  type: "restaurant" | "cafe";
  photoUrl?: string;
  address?: string;
}

export interface Room {
  id: string;
  code: string;
  hostId: string;
  status: "waiting" | "searching" | "done";
}

export interface Member {
  id: string;
  sessionId: string;
  name: string;
  lat: number;
  lng: number;
}

export type PlaceFilter = "restaurant" | "cafe" | "all";
export type SortBy = "rating" | "distance";
export type ResultCount = 5 | 10 | 20;
export type AppView = "input" | "results";
