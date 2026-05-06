"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Booking } from "@/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: "bg-blue-50 text-blue-700",
  ACTIVE: "bg-emerald-50 text-emerald-700",
  COMPLETED: "bg-gray-100 text-gray-500",
  CANCELLED: "bg-red-50 text-red-500",
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((d) => {
        setBookings(d.bookings || []);
        setLoading(false);
      });
  }, [status]);

  async function cancelBooking(id: string) {
    if (!confirm("Cancel this booking?")) return;
    setCancelling(id);
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    });
    setCancelling(null);
    if (res.ok) {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "CANCELLED" } : b)),
      );
    }
  }

  const now = new Date();
  const upcoming = bookings.filter(
    (b) =>
      b.status !== "CANCELLED" &&
      b.status !== "COMPLETED" &&
      new Date(b.endTime) >= now,
  );
  const past = bookings.filter(
    (b) =>
      b.status === "CANCELLED" ||
      b.status === "COMPLETED" ||
      new Date(b.endTime) < now,
  );
  const shown = tab === "upcoming" ? upcoming : past;
  const user = session?.user as any;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Welcome back, {user?.name?.split(" ")[0]}
          </p>
        </div>
        <Link
          href="/map"
          className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700"
        >
          + New Booking
        </Link>
      </div>

      {/* tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        {(["upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all ${
              tab === t
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t} ({t === "upcoming" ? upcoming.length : past.length})
          </button>
        ))}
      </div>

      {/* bookings */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-36 bg-gray-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <div className="text-5xl mb-4">🅿️</div>
          <p className="font-semibold text-gray-700">No {tab} bookings</p>
          <p className="text-sm text-gray-400 mt-1">
            {tab === "upcoming"
              ? "Book a parking spot to get started"
              : "Completed bookings will appear here"}
          </p>
          {tab === "upcoming" && (
            <Link
              href="/map"
              className="inline-block mt-4 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
            >
              Find Parking
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {shown.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl border border-gray-200 p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {(booking as any).slot?.lot?.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {(booking as any).slot?.lot?.address}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Slot:{" "}
                    <span className="font-mono font-semibold text-gray-600">
                      {(booking as any).slot?.slotNumber}
                    </span>
                    {" · "}
                    Vehicle:{" "}
                    <span className="font-mono font-semibold text-gray-600">
                      {booking.vehicleNo}
                    </span>
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_STYLES[booking.status]}`}
                >
                  {booking.status}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="text-xs text-gray-500 space-y-0.5">
                  <div>📅 {formatDateTime(booking.startTime)}</div>
                  <div>🏁 {formatDateTime(booking.endTime)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-bold text-blue-600">
                      {formatCurrency(booking.totalAmount)}
                    </div>
                    <div className="text-xs text-gray-400">total</div>
                  </div>
                  {booking.status === "CONFIRMED" && (
                    <button
                      onClick={() => cancelBooking(booking.id)}
                      disabled={cancelling === booking.id}
                      className="text-xs text-red-500 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors font-medium disabled:opacity-50"
                    >
                      {cancelling === booking.id ? "..." : "Cancel"}
                    </button>
                  )}
                </div>
              </div>

              {/* QR code reference */}
              {booking.qrCode && booking.status === "CONFIRMED" && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white text-xs">
                    QR
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-700">
                      Booking ID
                    </div>
                    <div className="text-xs font-mono text-gray-500">
                      {booking.qrCode}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
