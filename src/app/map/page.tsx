"use client";

import { useState, useEffect } from "react";
import { ParkingLot } from "@/types";
import ParkingLotCard from "@/components/ui/ParkingLotCard";

const VEHICLE_TYPES = [
  { value: "", label: "All" },
  { value: "FOUR_WHEELER", label: "4-Wheeler" },
  { value: "TWO_WHEELER", label: "2-Wheeler" },
  { value: "EV", label: "EV" },
];

export default function MapPage() {
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [vehicleType, setVehicleType] = useState("");

  async function fetchLots() {
    setLoading(true);
    const params = new URLSearchParams();
    if (vehicleType) params.set("vehicleType", vehicleType);
    const res = await fetch(`/api/parking-lots?${params}`);
    const data = await res.json();
    setLots(data.lots || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchLots();
  }, [vehicleType]);

  const filtered = lots.filter(
    (lot) =>
      !search ||
      lot.name.toLowerCase().includes(search.toLowerCase()) ||
      lot.city.toLowerCase().includes(search.toLowerCase()) ||
      lot.address.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* sidebar */}
      <div className="w-full md:w-[420px] flex flex-col border-r border-gray-200 bg-white flex-shrink-0">
        <div className="p-4 border-b border-gray-100 space-y-3">
          <input
            type="text"
            placeholder="Search area, city or landmark..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-400"
          />
          <div className="flex gap-2">
            {VEHICLE_TYPES.map((vt) => (
              <button
                key={vt.value}
                onClick={() => setVehicleType(vt.value)}
                className={`flex-1 text-xs font-medium py-1.5 rounded-full border transition-all ${
                  vehicleType === vt.value
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                }`}
              >
                {vt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-100">
          {loading ? "Finding parking..." : `${filtered.length} spots found`}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-gray-100 rounded-2xl animate-pulse"
              />
            ))
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">🅿️</div>
              <p className="font-semibold text-gray-700">No parking found</p>
              <p className="text-sm text-gray-400 mt-1">
                Try a different search
              </p>
            </div>
          ) : (
            filtered.map((lot) => <ParkingLotCard key={lot.id} lot={lot} />)
          )}
        </div>
      </div>

      {/* map placeholder */}
      <div className="hidden md:flex flex-1 bg-blue-50 items-center justify-center flex-col gap-3">
        <div className="text-6xl">🗺️</div>
        <p className="font-semibold text-gray-600">Map coming soon</p>
        <p className="text-sm text-gray-400">
          Add NEXT_PUBLIC_MAPBOX_TOKEN to enable map
        </p>
      </div>
    </div>
  );
}
