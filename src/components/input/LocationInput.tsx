"use client";

import { useState, useCallback, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { parseGoogleMapsLink, isGoogleMapsLink } from "@/lib/link-parser";
import { autocomplete, getPlaceDetail, type GoongPrediction } from "@/lib/goong";
import { Button } from "@/components/ui/button";

interface LocationInputProps {
  index: number;
  placeholder: string;
  onRequestGps?: () => void;
  onRequestPin?: () => void;
}

export default function LocationInput({
  index,
  placeholder,
  onRequestGps,
  onRequestPin,
}: LocationInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<GoongPrediction[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const locations = useAppStore((s) => s.locations);
  const addLocation = useAppStore((s) => s.addLocation);
  const updateLocation = useAppStore((s) => s.updateLocation);
  const removeLocation = useAppStore((s) => s.removeLocation);

  const currentLocation = locations[index];

  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value);

      // Check if it's a Google Maps link
      if (isGoogleMapsLink(value)) {
        const coords = parseGoogleMapsLink(value);
        if (coords) {
          const loc = {
            id: currentLocation?.id || crypto.randomUUID(),
            ...coords,
            label: `Pin (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`,
            source: "link" as const,
          };
          if (currentLocation) {
            updateLocation(currentLocation.id, loc);
          } else {
            addLocation(loc);
          }
          setInputValue("");
          setSuggestions([]);
          return;
        }
      }

      // Goong Autocomplete with debounce
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        if (value.length >= 2) {
          const predictions = await autocomplete(value);
          setSuggestions(predictions);
        } else {
          setSuggestions([]);
        }
      }, 300);
    },
    [currentLocation, addLocation, updateLocation]
  );

  const handleSelectSuggestion = useCallback(
    async (prediction: GoongPrediction) => {
      const coords = await getPlaceDetail(prediction.place_id);
      if (coords) {
        const loc = {
          id: currentLocation?.id || crypto.randomUUID(),
          ...coords,
          label: prediction.structured_formatting.main_text,
          source: "search" as const,
        };
        if (currentLocation) {
          updateLocation(currentLocation.id, loc);
        } else {
          addLocation(loc);
        }
      }
      setInputValue("");
      setSuggestions([]);
    },
    [currentLocation, addLocation, updateLocation]
  );

  const handleClear = () => {
    if (currentLocation) {
      removeLocation(currentLocation.id);
    }
    setInputValue("");
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
            index === 0 ? "bg-[#FFD94C] text-[#15333B]" : "bg-[#4E8770] text-white"
          }`}
        >
          {index + 1}
        </div>

        {currentLocation ? (
          <div className="flex-1 flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
            <span className="flex-1 text-sm truncate">
              {currentLocation.label}
            </span>
            <button
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground text-lg leading-none"
            >
              ×
            </button>
          </div>
        ) : (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        )}

        {!currentLocation && (
          <div className="flex gap-1">
            {onRequestGps && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-base"
                onClick={onRequestGps}
                title="Dùng GPS"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/></svg>
              </Button>
            )}
            {onRequestPin && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-base"
                onClick={onRequestPin}
                title="Chọn trên bản đồ"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Autocomplete suggestions */}
      {suggestions.length > 0 && (
        <div className="absolute left-10 right-0 top-full mt-1 bg-card rounded-lg shadow-lg border z-50 max-h-48 overflow-y-auto">
          {suggestions.map((s) => (
            <button
              key={s.place_id}
              onClick={() => handleSelectSuggestion(s)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors border-b last:border-b-0"
            >
              <div className="font-medium">
                {s.structured_formatting.main_text}
              </div>
              <div className="text-xs text-muted-foreground">
                {s.structured_formatting.secondary_text}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
