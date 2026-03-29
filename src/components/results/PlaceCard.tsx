"use client";

import type { Place } from "@/types";

export default function PlaceCard({ place }: { place: Place }) {
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 p-3 bg-card rounded-xl border border-[#3E5E63] hover:border-[#FFD94C]/40 transition-colors"
    >
      {place.photoUrl && (
        <img
          src={place.photoUrl}
          alt={place.name}
          className="w-20 h-20 object-cover rounded-lg shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm truncate">{place.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          {place.rating != null && place.rating > 0 && (
            <>
              <span className="text-[#FFD94C] text-sm font-medium">
                ★ {place.rating.toFixed(1)}
              </span>
              {place.reviewCount != null && (
                <span className="text-xs text-muted-foreground">
                  ({place.reviewCount})
                </span>
              )}
              <span className="text-xs text-muted-foreground">·</span>
            </>
          )}
          <span className="text-xs text-muted-foreground">
            {formatDistance(place.distanceFromMidpoint)}
          </span>
        </div>
        {place.address && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {place.address}
          </p>
        )}
        <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-muted rounded-full capitalize">
          {place.type === "restaurant" ? "Quán ăn" : "Cafe"}
        </span>
      </div>
    </a>
  );
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}
