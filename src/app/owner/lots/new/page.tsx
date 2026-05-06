"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const AMENITIES = [
  "CCTV",
  "Covered",
  "24/7",
  "Security Guard",
  "EV Charging",
  "Valet",
  "Wheelchair Access",
];
const VEHICLE_OPTIONS = [
  { value: "FOUR_WHEELER", label: "4-Wheeler (Car/SUV)" },
  { value: "TWO_WHEELER", label: "2-Wheeler (Bike/Scooter)" },
  { value: "EV", label: "Electric Vehicle (EV)" },
];
const CITIES = [
  "Mumbai",
  "Bengaluru",
  "Delhi",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
];

export default function AddLotPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    latitude: "",
    longitude: "",
    totalSlots: "",
    pricePerHour: "",
    vehicleTypes: ["FOUR_WHEELER"] as string[],
    amenities: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function toggleItem(arr: string[], val: string) {
    return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.vehicleTypes.length) {
      setError("Select at least one vehicle type");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/parking-lots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create lot");
      } else {
        router.push("/owner/dashboard");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/owner/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        ← Back to dashboard
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Add Parking Lot
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Fill in the details to list your parking space
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* basic info */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Basic Information
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Lot Name
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Phoenix MarketCity Basement P2"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Street Address
              </label>
              <input
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="LBS Marg, Kurla West"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                City
              </label>
              <select
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
              >
                <option value="">Select city</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* coordinates */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Coordinates
              </h2>
              <a
                href="https://www.latlong.net/"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                Find coordinates →
              </a>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Latitude
                </label>
                <input
                  required
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(e) =>
                    setForm({ ...form, latitude: e.target.value })
                  }
                  placeholder="19.0880"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Longitude
                </label>
                <input
                  required
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(e) =>
                    setForm({ ...form, longitude: e.target.value })
                  }
                  placeholder="72.8898"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* capacity & pricing */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Capacity & Pricing
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Total Slots
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  value={form.totalSlots}
                  onChange={(e) =>
                    setForm({ ...form, totalSlots: e.target.value })
                  }
                  placeholder="30"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Price per Hour (₹)
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  value={form.pricePerHour}
                  onChange={(e) =>
                    setForm({ ...form, pricePerHour: e.target.value })
                  }
                  placeholder="40"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* vehicle types */}
          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Accepted Vehicle Types
            </h2>
            <div className="space-y-2">
              {VEHICLE_OPTIONS.map((vt) => (
                <label
                  key={vt.value}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={form.vehicleTypes.includes(vt.value)}
                    onChange={() =>
                      setForm({
                        ...form,
                        vehicleTypes: toggleItem(form.vehicleTypes, vt.value),
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{vt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* amenities */}
          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Amenities
            </h2>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      amenities: toggleItem(form.amenities, a),
                    })
                  }
                  className={`text-sm px-3 py-1.5 rounded-lg border transition-all ${
                    form.amenities.includes(a)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {submitting ? "Creating..." : "Create Parking Lot"}
          </button>
        </form>
      </div>
    </div>
  );
}
