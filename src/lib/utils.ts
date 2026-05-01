export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function getAvailabilityStatus(available: number, total: number) {
  const ratio = available / total;
  if (available === 0) return { label: "Full", color: "red" };
  if (ratio <= 0.2) return { label: `${available} left`, color: "amber" };
  return { label: `${available} free`, color: "green" };
}

export function vehicleTypeLabel(type: string) {
  const map: Record<string, string> = {
    TWO_WHEELER: "2-Wheeler",
    FOUR_WHEELER: "4-Wheeler",
    EV: "EV",
  };
  return map[type] ?? type;
}

export function calcAmount(hours: number, pricePerHour: number) {
  return Math.round(hours * pricePerHour);
}
