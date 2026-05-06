"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Booking, ParkingLot } from "@/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: "bg-blue-50 text-blue-700",
  ACTIVE: "bg-emerald-50 text-emerald-700",
  COMPLETED: "bg-gray-100 text-gray-500",
  CANCELLED: "bg-red-50 text-red-500",
};

export default function OwnerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    if (status === "authenticated" && (session.user as any)?.role !== "OWNER") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    Promise.all([
      fetch("/api/bookings").then((r) => r.json()),
      fetch("/api/parking-lots").then((r) => r.json()),
    ]).then(([bData, lData]) => {
      setBookings(bData.bookings || []);
      setLots(lData.lots || []);
      setLoading(false);
    });
  }, [status]);

  const totalRevenue = bookings
    .filter((b) => b.status !== "CANCELLED")
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const today = new Date().toDateString();
  const todayBookings = bookings.filter(
    (b) =>
      new Date(b.createdAt).toDateString() === today &&
      b.status !== "CANCELLED",
  ).length;

  const confirmedCount = bookings.filter(
    (b) => b.status === "CONFIRMED",
  ).length;

  const chartData = lots.map((lot) => ({
    name: lot.name.split(" ").slice(0, 2).join(" "),
    bookings: bookings.filter(
      (b) => (b as any).slot?.lot?.id === lot.id && b.status !== "CANCELLED",
    ).length,
    available: lot.availableSlots,
  }));

  const filtered =
    filterStatus === "ALL"
      ? bookings
      : bookings.filter((b) => b.status === filterStatus);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Owner Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Manage your parking lots and bookings
          </p>
        </div>
        <Link
          href="/owner/lots/new"
          className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700"
        >
          + Add Lot
        </Link>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total Revenue",
            value: formatCurrency(totalRevenue),
            icon: "💰",
          },
          { label: "Today's Bookings", value: todayBookings, icon: "📅" },
          { label: "Active Bookings", value: confirmedCount, icon: "🟢" },
          { label: "Total Lots", value: lots.length, icon: "🅿️" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-gray-200 p-5"
          >
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Bookings per Lot</h2>
          {loading ? (
            <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={chartData}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="bookings" fill="#185FA5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* lots list */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Your Parking Lots
          </h2>
          {loading ? (
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 bg-gray-100 rounded-xl animate-pulse mb-2"
              />
            ))
          ) : lots.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No lots listed yet</p>
              <Link
                href="/owner/lots/new"
                className="text-blue-600 text-sm mt-2 inline-block font-medium"
              >
                Add your first lot →
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {lots.map((lot) => (
                <div
                  key={lot.id}
                  className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {lot.name}
                    </p>
                    <p className="text-xs text-gray-400">{lot.city}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-semibold text-gray-900">
                      {lot.availableSlots}/{lot.totalSlots}
                    </p>
                    <p className="text-xs text-gray-400">available</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* bookings table */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">All Bookings</h2>
          <div className="flex gap-2">
            {["ALL", "CONFIRMED", "COMPLETED", "CANCELLED"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                  filterStatus === s
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-100 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No bookings found
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  <th className="px-6 py-3 text-left">Driver</th>
                  <th className="px-6 py-3 text-left">Lot</th>
                  <th className="px-6 py-3 text-left">Slot</th>
                  <th className="px-6 py-3 text-left">Time</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {(booking as any).user?.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {(booking as any).user?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-[160px]">
                      <div className="truncate">
                        {(booking as any).slot?.lot?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      {(booking as any).slot?.slotNumber}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {formatDateTime(booking.startTime)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      {formatCurrency(booking.totalAmount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[booking.status]}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
