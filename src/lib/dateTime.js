export const DAY_START = 12;
export const DAY_END = 25;
export const DEFAULT_BOOKING_MINUTES = 120;
export const HOURS = Array.from({ length: DAY_END - DAY_START + 1 }, (_, i) => DAY_START + i);
export const TIME_OPTIONS = Array.from({ length: (DAY_END - DAY_START) * 2 + 1 }, (_, index) => {
  const totalMinutes = DAY_START * 60 + index * 30;
  const hour = Math.floor(totalMinutes / 60) % 24;
  const minute = totalMinutes % 60;
  return String(hour).padStart(2, "0") + ":" + String(minute).padStart(2, "0");
});

export function timeToMinutes(time) {
  const [rawHour, minute] = time.split(":").map(Number);
  const hour = rawHour < DAY_START ? rawHour + 24 : rawHour;
  return hour * 60 + minute;
}

export function minutesToTime(totalMinutes) {
  const hour = Math.floor(totalMinutes / 60) % 24;
  const minute = totalMinutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function addMinutes(time, minutes) {
  return minutesToTime(timeToMinutes(time) + minutes);
}

export function getDurationLabel(start, end) {
  const minutes = timeToMinutes(end) - timeToMinutes(start);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours && rest) return `${hours}ч ${rest}м`;
  if (hours) return `${hours}ч`;
  return `${rest}м`;
}

export function prettyHour(hour) {
  return `${String(hour % 24).padStart(2, "0")}:00`;
}

export function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(isoDate, days) {
  const date = new Date(`${isoDate}T12:00:00`);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

export function formatDateLabel(isoDate) {
  const date = new Date(`${isoDate}T12:00:00`);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    weekday: "long",
  }).format(date);
}

export function formatMonthLabel(isoDate) {
  const date = new Date(`${isoDate}T12:00:00`);
  return new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function getMonthGrid(monthDate) {
  const date = new Date(`${monthDate}T12:00:00`);
  const year = date.getFullYear();
  const month = date.getMonth();
  const first = new Date(year, month, 1, 12);
  const mondayOffset = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return {
      date: toIsoDate(day),
      muted: day.getMonth() !== month,
    };
  });
}

export function addMonths(isoDate, months) {
  const date = new Date(`${isoDate}T12:00:00`);
  date.setMonth(date.getMonth() + months, 1);
  return toIsoDate(date);
}

export function isToday(isoDate) {
  return isoDate === toIsoDate(new Date());
}

export function isPastDate(isoDate) {
  return isoDate < toIsoDate(new Date());
}

export function getNowMinutes(selectedDate) {
  if (!isToday(selectedDate)) return DAY_START * 60;

  const now = new Date();
  const rawMinutes = now.getHours() * 60 + now.getMinutes();
  return rawMinutes < DAY_START * 60 ? DAY_START * 60 : rawMinutes;
}

export function roundUpToSlot(minutes) {
  return Math.min(Math.ceil(minutes / 30) * 30, DAY_END * 60 - DEFAULT_BOOKING_MINUTES);
}

export function getActualNowTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export function getScheduleStartHour(selectedDate) {
  return DAY_START;
}
