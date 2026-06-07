import React from "react";
import { CalendarDays, Grid2X2 } from "lucide-react";

export default function ModeSwitcher({ mode, setMode }) {
  return (
    <div className="grid min-w-[116px] grid-cols-2 rounded-xl bg-white/[.045] p-1 ring-1 ring-white/8 sm:min-w-[230px]">
      <button
        aria-label="Расписание"
        className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition ${mode === "schedule" ? "bg-violet-600 text-white" : "text-slate-400"}`}
        onClick={() => setMode("schedule")}
      >
        <CalendarDays size={18} />
        <span className="hidden sm:inline">Расписание</span>
      </button>
      <button
        aria-label="Плитка"
        className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition ${mode === "tile" ? "bg-violet-600 text-white" : "text-slate-400"}`}
        onClick={() => setMode("tile")}
      >
        <Grid2X2 size={18} />
        <span className="hidden sm:inline">Плитка</span>
      </button>
    </div>
  );
}
