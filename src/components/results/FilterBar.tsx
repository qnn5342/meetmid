"use client";

import { useAppStore } from "@/store/useAppStore";
import type { PlaceFilter, SortBy } from "@/types";

const filters: { value: PlaceFilter; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "restaurant", label: "Quán ăn" },
  { value: "cafe", label: "Cafe" },
];

const sortOptions: { value: SortBy; label: string }[] = [
  { value: "distance", label: "Gần nhất" },
  { value: "rating", label: "Rating" },
];

const radiusOptions = [
  { value: 500, label: "500m" },
  { value: 1000, label: "1km" },
  { value: 2000, label: "2km" },
  { value: 5000, label: "5km" },
];

export default function FilterBar({ onReSearch }: { onReSearch?: () => void }) {
  const filter = useAppStore((s) => s.filter);
  const sortBy = useAppStore((s) => s.sortBy);
  const radius = useAppStore((s) => s.radius);
  const setFilter = useAppStore((s) => s.setFilter);
  const setSortBy = useAppStore((s) => s.setSortBy);
  const setRadius = useAppStore((s) => s.setRadius);

  const handleRadiusChange = (value: number) => {
    setRadius(value);
    onReSearch?.();
  };

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2">
      {/* Type filter */}
      <div className="flex bg-[#15333B] rounded-lg p-0.5 border border-[#3E5E63]">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              filter === f.value
                ? "bg-[#FFD94C] text-[#15333B] font-medium"
                : "text-[#9CB5B9] hover:text-[#F0F0F0]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex bg-[#15333B] rounded-lg p-0.5 border border-[#3E5E63]">
        {sortOptions.map((s) => (
          <button
            key={s.value}
            onClick={() => setSortBy(s.value)}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              sortBy === s.value
                ? "bg-[#FFD94C] text-[#15333B] font-medium"
                : "text-[#9CB5B9] hover:text-[#F0F0F0]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Radius */}
      <div className="flex bg-[#15333B] rounded-lg p-0.5 border border-[#3E5E63]">
        {radiusOptions.map((r) => (
          <button
            key={r.value}
            onClick={() => handleRadiusChange(r.value)}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              radius === r.value
                ? "bg-[#FFD94C] text-[#15333B] font-medium"
                : "text-[#9CB5B9] hover:text-[#F0F0F0]"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}
