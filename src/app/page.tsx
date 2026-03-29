"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useAppStore } from "@/store/useAppStore";
import { calculateMidpoint } from "@/lib/midpoint";
import { reverseGeocode } from "@/lib/goong";
import LocationInput from "@/components/input/LocationInput";
import PlaceList from "@/components/results/PlaceList";
import { Button } from "@/components/ui/button";
import type { Place } from "@/types";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center">
      <span className="text-muted-foreground text-sm">Đang tải bản đồ...</span>
    </div>
  ),
});

export default function HomePage() {
  const locations = useAppStore((s) => s.locations);
  const view = useAppStore((s) => s.view);
  const isSearching = useAppStore((s) => s.isSearching);
  const setView = useAppStore((s) => s.setView);
  const setMidpoint = useAppStore((s) => s.setMidpoint);
  const setIsSearching = useAppStore((s) => s.setIsSearching);
  const setPlaces = useAppStore((s) => s.setPlaces);
  const addLocation = useAppStore((s) => s.addLocation);
  const setMyLocation = useAppStore((s) => s.setMyLocation);
  const radius = useAppStore((s) => s.radius);
  const setRadius = useAppStore((s) => s.setRadius);
  const [pinningIndex, setPinningIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const canSearch = locations.length >= 2;

  const handleGps = useCallback(
    (index: number) => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          const label = await reverseGeocode(lat, lng);
          const loc = {
            id: crypto.randomUUID(),
            lat,
            lng,
            label,
            source: "gps" as const,
          };
          if (index === 0) {
            setMyLocation(loc);
          } else {
            addLocation(loc);
          }
        },
        () =>
          alert("Không thể lấy vị trí GPS. Vui lòng cho phép truy cập vị trí.")
      );
    },
    [setMyLocation, addLocation]
  );

  const handleMapClick = useCallback(
    async (lat: number, lng: number) => {
      if (pinningIndex === null) return;
      const label = await reverseGeocode(lat, lng);
      const loc = {
        id: crypto.randomUUID(),
        lat,
        lng,
        label,
        source: "pin" as const,
      };
      if (pinningIndex === 0) {
        setMyLocation(loc);
      } else {
        addLocation(loc);
      }
      setPinningIndex(null);
    },
    [pinningIndex, setMyLocation, addLocation]
  );

  const handleSearch = useCallback(async () => {
    if (!canSearch) return;

    const mid = calculateMidpoint(locations);
    setMidpoint(mid);
    setIsSearching(true);

    try {
      const store = useAppStore.getState();
      const params = new URLSearchParams({
        lat: mid.lat.toString(),
        lng: mid.lng.toString(),
        radius: store.radius.toString(),
        type: store.filter,
        limit: "50",
      });

      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();

      if (data.places) {
        setPlaces(data.places as Place[]);
        setView("results");
      } else {
        alert(data.error || "Không tìm thấy kết quả");
      }
    } catch {
      alert("Tìm kiếm thất bại. Vui lòng thử lại.");
    } finally {
      setIsSearching(false);
    }
  }, [canSearch, locations, setMidpoint, setIsSearching, setPlaces, setView]);

  const handleBack = () => {
    setView("input");
    setMidpoint(null);
    setPlaces([]);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="bg-card border-b px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {view === "results" && (
            <button onClick={handleBack} className="text-lg mr-1">
              ←
            </button>
          )}
          <h1 className="text-lg font-bold text-[#FDF5DA]">
            Meet<span className="text-[#FFD94C]">Mid</span>
          </h1>
        </div>
        {view === "results" && (
          <span className="text-xs text-muted-foreground">
            {useAppStore.getState().places.length} kết quả
          </span>
        )}
      </header>

      {/* Map */}
      <div className="flex-1 relative min-h-0">
        <MapView
          onMapClick={pinningIndex !== null ? handleMapClick : undefined}
        />

        {/* Pinning indicator */}
        {pinningIndex !== null && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#FFD94C] text-[#15333B] text-xs font-medium px-3 py-1.5 rounded-full shadow-lg z-[1000]">
            Chạm vào bản đồ để chọn vị trí #{pinningIndex + 1}
            <button
              onClick={() => setPinningIndex(null)}
              className="ml-2 font-bold"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Bottom panel */}
      <div className="bg-card border-t shrink-0 max-h-[50vh] overflow-y-auto">
        {view === "input" ? (
          <div className="p-4 space-y-3">
            <LocationInput
              index={0}
              placeholder="Vị trí của bạn"
              onRequestGps={() => handleGps(0)}
              onRequestPin={() => setPinningIndex(0)}
            />
            <LocationInput
              index={1}
              placeholder="Vị trí người kia"
              onRequestGps={() => handleGps(1)}
              onRequestPin={() => setPinningIndex(1)}
            />

            {/* Radius selector */}
            {mounted && <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground shrink-0">Bán kính:</span>
              <div className="flex bg-[#15333B] rounded-lg p-0.5 border border-[#3E5E63]">
                {[
                  { value: 500, label: "500m" },
                  { value: 1000, label: "1km" },
                  { value: 2000, label: "2km" },
                  { value: 5000, label: "5km" },
                ].map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setRadius(r.value)}
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
            </div>}

            <Button
              onClick={handleSearch}
              disabled={!canSearch || isSearching}
              className="w-full"
              size="lg"
            >
              {isSearching ? "Đang tìm..." : "Tìm quán"}
            </Button>
          </div>
        ) : (
          <PlaceList onReSearch={handleSearch} />
        )}
      </div>
    </div>
  );
}
