"use client";

import { useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import PlaceCard from "./PlaceCard";
import FilterBar from "./FilterBar";

export default function PlaceList({ onReSearch }: { onReSearch?: () => void }) {
  const places = useAppStore((s) => s.places);
  const filter = useAppStore((s) => s.filter);
  const sortBy = useAppStore((s) => s.sortBy);

  const filtered = useMemo(() => {
    let result = filter === "all" ? places : places.filter((p) => p.type === filter);

    if (sortBy === "rating") {
      result = [...result].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else {
      result = [...result].sort(
        (a, b) => a.distanceFromMidpoint - b.distanceFromMidpoint
      );
    }

    return result;
  }, [places, filter, sortBy]);

  return (
    <div>
      <FilterBar onReSearch={onReSearch} />
      <div className="px-4 space-y-2 pb-4">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Không tìm thấy quán nào. Thử mở rộng bán kính tìm kiếm.
          </div>
        ) : (
          filtered.map((place) => <PlaceCard key={place.id} place={place} />)
        )}
      </div>
    </div>
  );
}
