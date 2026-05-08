"use client";

import { useEffect, useRef, useState } from "react";
import { ParkingLot } from "@/types";
import { getAvailabilityStatus } from "@/lib/utils";

interface MapViewProps {
  lots: ParkingLot[];
  selectedLotId: string | null;
  onSelectLot: (id: string) => void;
}

export default function MapView({
  lots,
  selectedLotId,
  onSelectLot,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // init map once
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    import("mapbox-gl").then(({ default: mapboxgl }) => {
      mapboxgl.accessToken = token;
      const map = new mapboxgl.Map({
        container: mapContainer.current!,
        style: "mapbox://styles/mapbox/light-v11",
        center: [77.5946, 12.9716],
        zoom: 11,
      });
      mapRef.current = map;
      map.addControl(new mapboxgl.NavigationControl(), "top-right");
      map.on("load", () => setMapLoaded(true));
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // add markers when BOTH map is loaded AND lots are available
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || lots.length === 0) return;

    import("mapbox-gl").then(({ default: mapboxgl }) => {
      // clear old markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      lots.forEach((lot) => {
        const status = getAvailabilityStatus(
          lot.availableSlots,
          lot.totalSlots,
        );
        const color =
          status.color === "green"
            ? "#1D9E75"
            : status.color === "amber"
              ? "#BA7517"
              : "#A32D2D";

        const el = document.createElement("div");
        el.style.cssText = `
          background: ${color};
          color: white;
          border: 2.5px solid white;
          border-radius: 20px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          font-family: sans-serif;
        `;
        el.textContent = `P ${status.label}`;
        el.addEventListener("click", () => onSelectLot(lot.id));

        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
          maxWidth: "220px",
        }).setHTML(`
          <div style="font-family:sans-serif;padding:4px;">
            <div style="font-weight:600;font-size:13px;color:#111;">${lot.name}</div>
            <div style="font-size:11px;color:#888;margin:3px 0;">${lot.address}</div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
              <span style="font-weight:700;color:#185FA5;">₹${lot.pricePerHour}/hr</span>
              <a href="/booking/${lot.id}" style="background:#185FA5;color:white;padding:3px 10px;border-radius:8px;font-size:11px;font-weight:600;text-decoration:none;">Book</a>
            </div>
          </div>
        `);

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([lot.longitude, lot.latitude])
          .setPopup(popup)
          .addTo(mapRef.current);

        markersRef.current.push(marker);
      });
    });
  }, [mapLoaded, lots, onSelectLot]);

  // fly to selected lot
  useEffect(() => {
    if (!selectedLotId || !mapRef.current) return;
    const lot = lots.find((l) => l.id === selectedLotId);
    if (!lot) return;
    mapRef.current.flyTo({
      center: [lot.longitude, lot.latitude],
      zoom: 15,
      duration: 800,
    });
  }, [selectedLotId, lots]);

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full bg-blue-50 flex flex-col items-center justify-center gap-3">
        <div className="text-5xl">🗺️</div>
        <p className="font-semibold text-gray-700">Map not configured</p>
        <p className="text-sm text-gray-400">
          Add NEXT_PUBLIC_MAPBOX_TOKEN to .env
        </p>
      </div>
    );
  }

  return <div ref={mapContainer} className="w-full h-full" />;
}
