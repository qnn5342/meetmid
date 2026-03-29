import { NextRequest, NextResponse } from "next/server";
import type { Place } from "@/types";

const FSQ_KEY = process.env.FOURSQUARE_API_KEY || "";
const FSQ_BASE = "https://places-api.foursquare.com";
const FSQ_VERSION = "2025-06-17";

const QUERIES: Record<string, string[]> = {
  cafe: ["cafe", "coffee", "trà sữa"],
  restaurant: ["restaurant", "quán ăn", "phở"],
  all: ["cafe", "coffee", "restaurant", "quán ăn", "phở", "bún", "cơm"],
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = parseFloat(searchParams.get("lat") || "0");
  const lng = parseFloat(searchParams.get("lng") || "0");
  const radius = parseInt(searchParams.get("radius") || "2000");
  const type = searchParams.get("type") || "all";
  const limit = parseInt(searchParams.get("limit") || "10");

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }

  if (!FSQ_KEY) {
    return NextResponse.json(
      { error: "FOURSQUARE_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const queries = QUERIES[type] || QUERIES.all;

    // Search with multiple queries in parallel, then merge
    // Fetch more per query to ensure enough results after dedupe
    const perQueryLimit = Math.min(Math.ceil(limit * 2 / queries.length), 50);
    const allResults = await Promise.all(
      queries.map((query) => searchFoursquare(query, lat, lng, radius, perQueryLimit))
    );

    // Dedupe by fsq_place_id
    const seen = new Set<string>();
    const places: Place[] = [];

    for (const results of allResults) {
      for (const r of results) {
        if (seen.has(r.fsq_place_id)) continue;
        seen.add(r.fsq_place_id);

        places.push({
          id: r.fsq_place_id,
          name: r.name,
          lat: r.latitude,
          lng: r.longitude,
          distanceFromMidpoint: r.distance,
          type: guessType(r.name, r.categories),
          address: r.location?.formatted_address || r.location?.address || "",
        });
      }
    }

    // Sort by distance and limit
    places.sort((a, b) => a.distanceFromMidpoint - b.distanceFromMidpoint);
    const limited = places.slice(0, limit);

    return NextResponse.json({ places: limited });
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

async function searchFoursquare(
  query: string,
  lat: number,
  lng: number,
  radius: number,
  limit: number
): Promise<FoursquarePlace[]> {
  const params = new URLSearchParams({
    ll: `${lat},${lng}`,
    radius: radius.toString(),
    query,
    limit: Math.min(limit, 50).toString(),
    sort: "DISTANCE",
  });

  const res = await fetch(`${FSQ_BASE}/places/search?${params}`, {
    headers: {
      Authorization: `Bearer ${FSQ_KEY}`,
      "X-Places-Api-Version": FSQ_VERSION,
      Accept: "application/json",
    },
  });

  if (!res.ok) return [];

  const data = await res.json();
  return data.results || [];
}

interface FoursquareCategory {
  fsq_category_id: string;
  name: string;
}

interface FoursquarePlace {
  fsq_place_id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance: number;
  categories?: FoursquareCategory[];
  location?: {
    formatted_address?: string;
    address?: string;
  };
}

function guessType(
  name: string,
  categories?: FoursquareCategory[]
): "restaurant" | "cafe" {
  if (
    categories?.some((c) => {
      const n = c.name.toLowerCase();
      return n.includes("coffee") || n.includes("café") || n.includes("cafe") || n.includes("tea");
    })
  ) {
    return "cafe";
  }
  const lower = name.toLowerCase();
  if (
    lower.includes("cafe") ||
    lower.includes("cà phê") ||
    lower.includes("coffee")
  ) {
    return "cafe";
  }
  return "restaurant";
}
