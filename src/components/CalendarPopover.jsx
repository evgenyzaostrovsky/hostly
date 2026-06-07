import React, { useState } from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths, formatDateLabel, formatMonthLabel, getMonthGrid, isToday, toIsoDate } from "../lib/dateTime";

export function DateButton({ selectedDate, setSelectedDate }) {
  return <DatePicker selectedDate={selectedDate} setSelectedDate={setSelectedDate} className="hidden sm:block" />;
}

export function DateButtonMobile({ selectedDate, setSelectedDate }) {
  return <DatePicker selectedDate={selectedDate} setSelectedDate={setSelectedDate} />;
}

export function DatePicker({ selectedDate, setSelectedDate, className = "" }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-2 rounded-xl bg-white/[.055] px-4 py-3 text-sm font-semibold text-slate-100 ring-1 ring-white/8"
      >
        <CalendarDays size={18} />
        <span className="whitespace-nowrap">{formatDateLabel(selectedDate)}</span>
        <ChevronDown size={17} className={`ml-auto text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <CalendarPopover selectedDate={selectedDate} setSelectedDate={setSelectedDate} onClose={() => setOpen(false)} />}
    </div>
  );
}

export function DateIconPicker({ selectedDate, setSelectedDate }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button type="button" className="icon-btn" onClick={() => setOpen((value) => !value)} aria-label="Дата">
        <CalendarDays size={20} />
      </button>
      {open && <CalendarPopover selectedDate={selectedDate} setSelectedDate={setSelectedDate} onClose={() => setOpen(false)} />}
    </div>
  );
}

export function CalendarPopover({ selectedDate, setSelectedDate, onClose }) {
  const [visibleMonth, setVisibleMonth] = useState(selectedDate);
  const monthDays = getMonthGrid(visibleMonth);
  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  function pick(date) {
    setSelectedDate(date);
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center bg-black/25 px-3 pt-20 backdrop-blur-[1px]" onClick={onClose}>
      <div className="w-80 rounded-xl border border-white/10 bg-[#111926] p-3 text-left shadow-2xl shadow-black/50" onClick={(event) => event.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <button type="button" className="icon-btn size-9" onClick={() => setVisibleMonth(addMonths(visibleMonth, -1))} aria-label="Предыдущий месяц">
            <ChevronLeft size={18} />
          </button>
          <div className="text-center">
            <div className="text-sm font-bold capitalize">{formatMonthLabel(visibleMonth)}</div>
            <div className="text-xs text-slate-500">{formatDateLabel(selectedDate)}</div>
          </div>
          <button type="button" className="icon-btn size-9" onClick={() => setVisibleMonth(addMonths(visibleMonth, 1))} aria-label="Следующий месяц">
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500">
          {weekDays.map((day) => <div key={day} className="py-1">{day}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {monthDays.map((day) => {
            const active = day.date === selectedDate;
            const today = isToday(day.date);

            return (
              <button
                type="button"
                key={day.date}
                onClick={() => pick(day.date)}
                className={`aspect-square rounded-md text-sm font-semibold transition ${
                  active
                    ? "bg-violet-600 text-white shadow-glow"
                    : today
                      ? "bg-white/[.08] text-violet-200 ring-1 ring-violet-500/40"
                      : day.muted
                        ? "text-slate-600 hover:bg-white/[.04]"
                        : "text-slate-200 hover:bg-white/[.08]"
                }`}
              >
                {Number(day.date.slice(-2))}
              </button>
            );
          })}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => pick(toIsoDate(new Date()))} className="rounded-lg bg-white/[.06] py-2 text-sm font-semibold text-slate-200 ring-1 ring-white/8">
            Сегодня
          </button>
          <button type="button" onClick={onClose} className="rounded-lg bg-violet-600 py-2 text-sm font-bold text-white">
            Готово
          </button>
        </div>
      </div>
    </div>
  );
}
