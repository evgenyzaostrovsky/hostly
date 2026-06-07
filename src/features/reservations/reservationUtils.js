import { DEFAULT_BOOKING_MINUTES, TIME_OPTIONS, addMinutes, getActualNowTime, getNowMinutes, isToday, roundUpToSlot, timeToMinutes } from "../../lib/dateTime";

export function getReservationConflict(reservations, candidate, ignoreId = null) {
  const start = timeToMinutes(candidate.start);
  const end = timeToMinutes(candidate.end);

  if (end <= start) {
    return { type: "time" };
  }

  return reservations.find((item) => {
    if (item.id === ignoreId || item.tableId !== Number(candidate.tableId)) return false;
    if (candidate.date && item.date !== candidate.date) return false;

    const itemStart = timeToMinutes(item.start);
    const itemEnd = timeToMinutes(item.end);
    return start < itemEnd && end > itemStart;
  });
}

export function getDefaultBookingTime(tableId, reservations, selectedDate, preferNow = false) {
  if (preferNow === "exact" && isToday(selectedDate)) {
    const start = getActualNowTime();
    return { start, end: addMinutes(start, DEFAULT_BOOKING_MINUTES) };
  }

  const startIndex = preferNow ? TIME_OPTIONS.findIndex((time) => timeToMinutes(time) >= roundUpToSlot(getNowMinutes(selectedDate))) : 0;

  for (let index = Math.max(startIndex, 0); index < TIME_OPTIONS.length; index += 1) {
    const start = TIME_OPTIONS[index];
    const end = addMinutes(start, DEFAULT_BOOKING_MINUTES);

    if (TIME_OPTIONS.includes(end) && !getReservationConflict(reservations, { tableId, date: selectedDate, start, end })) {
      return { start, end };
    }
  }

  return { start: "18:00", end: "20:00" };
}

export function getNextAvailableEnd(reservations, candidate, ignoreId = null) {
  const preferredEnd = addMinutes(candidate.start, DEFAULT_BOOKING_MINUTES);
  const preferred = { ...candidate, end: preferredEnd };

  if (!getReservationConflict(reservations, preferred, ignoreId)) {
    return preferredEnd;
  }

  return TIME_OPTIONS.find(
    (time) =>
      timeToMinutes(time) > timeToMinutes(candidate.start) &&
      !getReservationConflict(reservations, { ...candidate, end: time }, ignoreId),
  ) || preferredEnd;
}

export function hasReservationChanges(source, draft) {
  return ["date", "tableId", "name", "phone", "start", "end", "guests"].some(
    (key) => String(source[key] || "") !== String(draft[key] || ""),
  );
}

