import React from "react";
import { ChevronLeft, ChevronRight, LogOut, Menu, UserRound } from "lucide-react";
import { addDays } from "../lib/dateTime";
import { DateButton } from "./CalendarPopover";
import ModeSwitcher from "./ModeSwitcher";

export default function Header({ mode, setMode, selectedDate, setSelectedDate, employee, onOpenProfile, onRequestLogout }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/8 bg-[#070a11]/90 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <button className="icon-btn" aria-label="Меню">
          <Menu size={24} />
        </button>
        <h1 className="mr-auto text-2xl font-semibold tracking-[0.18em] text-slate-100">LAZYBOOK<span className="mx-1 text-violet-300">*</span></h1>
        <button className="icon-btn hidden md:grid" aria-label="Предыдущий день" onClick={() => setSelectedDate(addDays(selectedDate, -1))}>
          <ChevronLeft size={22} />
        </button>
        <DateButton selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
        <button className="icon-btn hidden md:grid" aria-label="Следующий день" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
          <ChevronRight size={22} />
        </button>
        <ModeSwitcher mode={mode} setMode={setMode} />
        {employee && (
          <div className="hidden items-center gap-2 md:flex">
            <button className="flex items-center gap-2 rounded-xl bg-white/[.045] px-3 py-2 text-sm font-semibold text-slate-300 ring-1 ring-white/8" onClick={onOpenProfile}>
              <UserRound size={17} />
              <span>{employee.name}</span>
            </button>
            <button className="icon-btn" onClick={onRequestLogout} aria-label="Выйти">
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
