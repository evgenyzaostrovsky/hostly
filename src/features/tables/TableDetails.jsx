import React from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, MoreHorizontal, Plus, UsersRound } from "lucide-react";
import { addDays, getNowMinutes, isToday, minutesToTime, prettyHour, timeToMinutes } from "../../lib/dateTime";
import { DateButtonMobile, DateIconPicker } from "../../components/CalendarPopover";
import { reservationTone } from "./tableUtils";

export default function TableDetails({ table, reservations, selectedDate, setSelectedDate, onBack, onNew, onSeat, onReservation }) {
  const nowMinutes = getNowMinutes(selectedDate);
  const showCurrentLine = isToday(selectedDate) && nowMinutes >= 10 * 60 && nowMinutes <= 24 * 60;
  const currentLineTop = ((nowMinutes - 10 * 60) / 60) * 64;

  return (
    <section className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-white/8 bg-[#070a11]/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <button className="icon-btn" onClick={onBack} aria-label="Назад">
            <ArrowLeft size={23} />
          </button>
          <h1 className="mx-auto text-xl font-bold">Стол {table.id}</h1>
          <DateIconPicker selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
          <button className="icon-btn" aria-label="Еще">
            <MoreHorizontal size={22} />
          </button>
        </div>
      </header>

      <div className="px-4 py-4">
        <div className="mb-4 flex items-center justify-between">
          <button className="icon-btn" aria-label="Предыдущий день" onClick={() => setSelectedDate(addDays(selectedDate, -1))}>
            <ChevronLeft size={20} />
          </button>
          <DateButtonMobile selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
          <button className="icon-btn" aria-label="Следующий день" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="relative min-h-[640px] overflow-hidden rounded-lg border border-white/8 bg-[#0c121b]">
          <div className="absolute left-0 top-0 w-16">
            {Array.from({ length: 15 }, (_, i) => 10 + i).map((hour) => (
              <div key={hour} className="h-16 border-b border-white/8 px-3 pt-2 text-sm text-slate-400">
                {prettyHour(hour)}
              </div>
            ))}
          </div>
          <div className="ml-16">
            {Array.from({ length: 15 }, (_, i) => <div key={i} className="h-16 border-b border-white/8" />)}
          </div>
          {showCurrentLine && (
            <div className="absolute left-16 right-4 z-10 border-t border-red-500" style={{ top: `${currentLineTop}px` }}>
              <span className="absolute -left-1 -top-1.5 size-3 rounded-full bg-red-500" />
              <span className="absolute -right-1 -top-3 bg-[#0c121b] pl-2 text-sm font-bold text-red-400">{minutesToTime(nowMinutes)}</span>
            </div>
          )}
          {reservations.map((item) => {
            const top = ((timeToMinutes(item.start) - 10 * 60) / 60) * 64;
            const height = ((timeToMinutes(item.end) - timeToMinutes(item.start)) / 60) * 64;
            return (
              <button
                key={item.id}
                onClick={() => onReservation(item)}
                className={`absolute left-20 right-8 rounded-md border p-3 text-left shadow-xl ${reservationTone(item.status)}`}
                style={{ top: `${top}px`, height: `${height}px` }}
              >
                <span className="block font-semibold">{item.start} - {item.end}</span>
                <span className="block">{item.name}</span>
                <span className="block text-sm text-white/80">{item.guests} гостя</span>
                <span className="absolute right-3 top-3 text-sm text-white/70">
                  {item.status === "busy" ? "Занят" : "Бронь"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="sticky bottom-0 mt-auto grid grid-cols-[1fr_1fr] gap-3 border-t border-white/8 bg-[#070a11]/95 p-4 backdrop-blur">
        <button onClick={onSeat} className="flex items-center justify-center gap-2 rounded-xl bg-white/[.07] py-3 font-bold ring-1 ring-white/10">
          <UsersRound size={19} />
          Посадка гостей
        </button>
        <button onClick={onNew} className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 font-bold text-white shadow-glow">
          <Plus size={20} />
          Новая бронь
        </button>
      </div>
    </section>
  );
}
