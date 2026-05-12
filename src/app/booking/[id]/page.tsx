"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ParkingLot, VehicleType } from "@/types";
import { formatCurrency, vehicleTypeLabel } from "@/lib/utils";
import toast from "react-hot-toast";

function toDatetimeLocal(date: Date) {
  return date.toISOString().slice(0, 16);
}

export default function BookingPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { data: session, status } = useSession();

  const [lot, setLot] = useState<(ParkingLot & { slots?: any[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const now = new Date();
  const [form, setForm] = useState({
    vehicleType: "FOUR_WHEELER" as VehicleType,
    startTime: toDatetimeLocal(now),
    endTime: toDatetimeLocal(new Date(now.getTime() + 2 * 60 * 60 * 1000)),
    vehicleNo: "",
  });

  useEffect(() => {
    fetch(`/api/parking-lots/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setLot(data.lot);
        if (data.lot?.vehicleTypes?.[0]) {
          setForm((f) => ({ ...f, vehicleType: data.lot.vehicleTypes[0] }));
        }
        setLoading(false);
      });
  }, [id]);

  const hours = Math.max(
    1,
    Math.ceil(
      (new Date(form.endTime).getTime() - new Date(form.startTime).getTime()) /
        (1000 * 60 * 60),
    ),
  );
  const total = lot ? Math.round(hours * lot.pricePerHour) : 0;

  async function handleBook() {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (!form.vehicleNo.trim()) {
      setError("Please enter your vehicle number");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lotId: id, ...form }),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout));

      const data = await res.json();
      setSubmitting(false);

      if (!res.ok) {
        const msg = data.error || "Booking failed";
        setError(msg);
        toast.error(msg);
      } else {
        toast.success("Booking confirmed! 🎉");
        router.push("/dashboard");
      }
    } catch (err: any) {
      setSubmitting(false);
      if (err.name === "AbortError") {
        setError("Request timed out — switch to mobile hotspot and try again");
      } else {
        setError("Network error: " + err.message);
      }
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-2/3" />
        <div className="h-48 bg-gray-200 rounded-2xl animate-pulse" />
        <div className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500">Parking lot not found</p>
        <Link href="/map" className="text-blue-600 mt-4 inline-block">
          ← Back to map
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/map"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          ← Back to map
        </Link>

        {/* lot info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{lot.name}</h1>
              <p className="text-gray-500 text-sm mt-1">
                {lot.address}, {lot.city}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {lot.amenities.map((a) => (
                  <span
                    key={a}
                    className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(lot.pricePerHour)}
                <span className="text-sm font-normal text-gray-400">/hr</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {lot.availableSlots} slots free
              </div>
            </div>
          </div>
        </div>

        {/* booking form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 text-lg mb-5">
            Book a Slot
          </h2>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="space-y-5">
            {/* vehicle type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Type
              </label>
              <div className="flex gap-2 flex-wrap">
                {lot.vehicleTypes.map((vt) => (
                  <button
                    key={vt}
                    onClick={() => setForm({ ...form, vehicleType: vt })}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                      form.vehicleType === vt
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    {vehicleTypeLabel(vt)}
                  </button>
                ))}
              </div>
            </div>

            {/* time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={form.startTime}
                  min={toDatetimeLocal(now)}
                  onChange={(e) =>
                    setForm({ ...form, startTime: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={form.endTime}
                  min={form.startTime}
                  onChange={(e) =>
                    setForm({ ...form, endTime: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* vehicle number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Vehicle Number
              </label>
              <input
                type="text"
                placeholder="MH01AB1234"
                value={form.vehicleNo}
                onChange={(e) =>
                  setForm({ ...form, vehicleNo: e.target.value.toUpperCase() })
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 uppercase font-mono tracking-widest"
              />
            </div>

            {/* price summary */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">
                  {formatCurrency(lot.pricePerHour)}/hr × {hours} hr
                  {hours > 1 ? "s" : ""}
                </span>
                <span className="font-semibold">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-gray-900">Total</span>
                <span className="text-blue-600 text-lg">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            {/* book button */}
            {lot.availableSlots === 0 ? (
              <div className="w-full bg-gray-100 text-gray-400 font-semibold py-3.5 rounded-xl text-center text-sm">
                No Slots Available
              </div>
            ) : (
              <button
                onClick={handleBook}
                disabled={submitting}
                className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-xl hover:bg-blue-700 disabled:opacity-60 text-sm transition-colors"
              >
                {submitting
                  ? "Confirming..."
                  : `Confirm Booking · ${formatCurrency(total)}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
