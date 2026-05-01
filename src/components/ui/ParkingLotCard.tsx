import Link from "next/link";
import { ParkingLot } from "@/types";
import {
  formatCurrency,
  getAvailabilityStatus,
  vehicleTypeLabel,
} from "@/lib/utils";

export default function ParkingLotCard({ lot }: { lot: ParkingLot }) {
  const status = getAvailabilityStatus(lot.availableSlots, lot.totalSlots);

  const badgeClass =
    status.color === "green"
      ? "bg-emerald-50 text-emerald-700"
      : status.color === "amber"
        ? "bg-amber-50 text-amber-700"
        : "bg-red-50 text-red-600";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
          🅿️
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm truncate">
            {lot.name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {lot.address}, {lot.city}
          </p>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {lot.vehicleTypes.map((vt) => (
              <span
                key={vt}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
              >
                {vehicleTypeLabel(vt)}
              </span>
            ))}
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <div className="font-bold text-blue-600">
            {formatCurrency(lot.pricePerHour)}
            <span className="text-xs font-normal text-gray-400">/hr</span>
          </div>
          <span
            className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${badgeClass}`}
          >
            {status.label}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-1.5 flex-wrap">
          {lot.amenities.slice(0, 3).map((a) => (
            <span
              key={a}
              className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100"
            >
              {a}
            </span>
          ))}
        </div>
        <Link
          href={lot.availableSlots > 0 ? `/booking/${lot.id}` : "#"}
          className={`text-xs font-semibold px-4 py-2 rounded-xl transition-colors ${
            lot.availableSlots > 0
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {lot.availableSlots > 0 ? "Book Now" : "Full"}
        </Link>
      </div>
    </div>
  );
}
