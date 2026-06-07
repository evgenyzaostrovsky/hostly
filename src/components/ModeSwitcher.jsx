import React from "react";
import { CalendarDays, Grid2X2 } from "lucide-react";

export default function ModeSwitcher({ mode, setMode }) {
  return (
    <div className="grid grid-cols-2 rounded-xl bg-white/[.045] p-1 ring-1 ring-white/8">
      <button
        aria-label="Плитка"
        className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition ${mode === "tile" ? "bg-violet-600 text-white" : "text-slate-400"}`}
        onClick={() => setMode("tile")}
      >
        <Grid2X2 size={17} />
        <span className="hidden sm:inline">Плитка</span>
      </button>
      <button
        aria-label="Расписание"
        className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition ${mode === "schedule" ? "bg-violet-600 text-white" : "text-slate-400"}`}
        onClick={() => setMode("schedule")}
      >
        <CalendarDays size={17} />
        <span className="hidden sm:inline">Расписание</span>
      </button>
    </div>
  );
}
