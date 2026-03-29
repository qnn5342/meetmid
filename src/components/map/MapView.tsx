"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAppStore } from "@/store/useAppStore";

const DEFAULT_CENTER: [number, number] = [10.7769, 106.7009]; // HCMC

function createIcon(color: string, label: string) {
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)">${label}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

const midpointIcon = L.divIcon({
  className: "",
  html: `<div style="background:#EAB308;color:#15333B;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)">M</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export default function MapView({
  onMapClick,
}: {
  onMapClick?: (lat: number, lng: number) => void;
}) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  const locations = useAppStore((s) => s.locations);
  const midpoint = useAppStore((s) => s.midpoint);
  const places = useAppStore((s) => s.places);
  const view = useAppStore((s) => s.view);
  const filter = useAppStore((s) => s.filter);

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: 13,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);
    // Add labels only (no POI icons)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      subdomains: "abcd",
      pane: "overlayPane",
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle click
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!onMapClick) return;

    const handler = (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    };
    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [onMapClick]);

  // Update markers
  useEffect(() => {
    const map = mapRef.current;
    const group = markersRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // Location markers
    locations.forEach((loc, i) => {
      L.marker([loc.lat, loc.lng], {
        icon: createIcon(i === 0 ? "#FFD94C" : "#4E8770", `${i + 1}`),
        title: loc.label,
      }).addTo(group);
    });

    // Midpoint
    if (midpoint) {
      L.marker([midpoint.lat, midpoint.lng], {
        icon: midpointIcon,
        title: "Điểm giữa",
      }).addTo(group);
    }

    // Place markers (results) — filtered to match selected type
    const filteredPlaces =
      view === "results"
        ? filter === "all"
          ? places
          : places.filter((p) => p.type === filter)
        : [];

    filteredPlaces.forEach((place) => {
      const icon = L.divIcon({
        className: "",
        html: `<div style="background:${place.type === "cafe" ? "#FFD94C" : "#4E8770"};color:${place.type === "cafe" ? "#15333B" : "#fff"};width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)">${place.type === "cafe" ? "☕" : "🍜"}</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      L.marker([place.lat, place.lng], { icon, title: place.name })
        .bindPopup(
          `<b>${place.name}</b><br/>${place.address ? place.address + "<br/>" : ""}<a href="https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}" target="_blank">Chỉ đường</a>`
        )
        .addTo(group);
    });

    // Fit bounds
    const allPoints: [number, number][] = locations.map((l) => [l.lat, l.lng]);
    if (midpoint) allPoints.push([midpoint.lat, midpoint.lng]);
    filteredPlaces.forEach((p) => allPoints.push([p.lat, p.lng]));

    if (allPoints.length >= 2) {
      map.fitBounds(L.latLngBounds(allPoints), { padding: [40, 40] });
    } else if (allPoints.length === 1) {
      map.setView(allPoints[0], 14);
    }
  }, [locations, midpoint, places, view, filter]);

  return <div ref={containerRef} className="w-full h-full" />;
}
