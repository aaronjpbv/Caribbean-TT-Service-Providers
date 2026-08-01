export type BookingPhase =
  | "awaiting_quote"
  | "quote_received"
  | "confirmed"
  | "completed"
  | "cancelled";

export function getBookingPhase(booking: {
  status: string | null;
  quoted_price: number | null;
}): BookingPhase {
  if (booking.status === "cancelled") return "cancelled";
  if (booking.status === "completed") return "completed";
  if (booking.status === "confirmed") return "confirmed";
  return booking.quoted_price != null ? "quote_received" : "awaiting_quote";
}

export const PHASE_LABELS: Record<BookingPhase, string> = {
  awaiting_quote: "Awaiting Quote",
  quote_received: "Quote Received",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const PHASE_COLORS: Record<BookingPhase, string> = {
  awaiting_quote: "#F59E0B",
  quote_received: "#3B82F6",
  confirmed: "#10B981",
  completed: "#6B7280",
  cancelled: "#EF4444",
};

export function formatBookingDateTime(date: string, time: string) {
  try {
    const d = new Date(`${date}T00:00:00`);
    const dateLabel = d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    return `${dateLabel}, ${time}`;
  } catch {
    return `${date}, ${time}`;
  }
}
