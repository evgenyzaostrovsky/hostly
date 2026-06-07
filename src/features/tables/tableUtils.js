import { DAY_START, getNowMinutes, isPastDate, isToday, timeToMinutes } from "../../lib/dateTime";

const tableIds = [
  ...Array.from({ length: 15 }, (_, index) => index + 1),
  50,
  77,
  ...Array.from({ length: 6 }, (_, index) => index + 101),
];

export const initialTables = tableIds.map((id) => ({
  id,
  seats: [5, 6, 10, 101, 102, 103].includes(id) ? 6 : 4,
}));

export function getTableState(tableId, reservations, selectedDate) {
  const today = isToday(selectedDate);
  const past = isPastDate(selectedDate);
  const now = today ? getNowMinutes(selectedDate) : DAY_START * 60;
  const tableReservations = reservations
    .filter((item) => item.tableId === tableId)
    .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
  const currentBusy = tableReservations.find((item) => {
    const start = timeToMinutes(item.start);
    const end = timeToMinutes(item.end);
    return item.status === "busy" && today && now >= start && now < end;
  });
  const next = past ? null : tableReservations.find((item) => timeToMinutes(item.start) >= now);

  if (currentBusy) {
    return { tone: "busy", label: "Занят", next };
  }

  if (today && next && timeToMinutes(next.start) - now <= 120) {
    return { tone: "soon", label: "До брони менее 2 часов", next };
  }

  return { tone: "free", label: "Свободен", next };
}

export function toneClasses(tone) {
  return {
    free: "from-emerald-950 to-emerald-800 border-emerald-600/40 text-white",
    soon: "from-orange-950 to-orange-700 border-orange-500/50 text-white",
    busy: "from-red-950 to-red-800 border-red-500/50 text-white",
  }[tone];
}

export function reservationTone(status) {
  if (status === "busy") return "bg-red-900/90 border-red-600 text-red-50";
  if (status === "finished") return "bg-slate-800/90 border-slate-600 text-slate-200";
  if (status === "soon") return "bg-orange-800/95 border-orange-500 text-orange-50";
  return "bg-emerald-900/95 border-emerald-600 text-emerald-50";
}
