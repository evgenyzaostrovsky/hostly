import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { addMinutes, getDurationLabel, timeToMinutes } from "../lib/dateTime";
import { getNextAvailableEnd, getReservationConflict } from "../features/reservations/reservationUtils";

export function TimeRangePicker({ form, setForm, reservations, tableId, ignoreId = null }) {
  const candidateBase = { ...form, tableId };

  function startIsAllowed(time) {
    return Boolean(getNextAvailableEnd(reservations, { ...candidateBase, start: time, end: addMinutes(time, 30) }, ignoreId));
  }

  function endIsAllowed(time) {
    if (timeToMinutes(time) <= timeToMinutes(form.start)) return false;
    return !getReservationConflict(reservations, { ...candidateBase, end: time }, ignoreId);
  }

  function setStart(time) {
    const end = getNextAvailableEnd(reservations, { ...candidateBase, start: time, end: form.end }, ignoreId);
    setForm((current) => ({ ...current, start: time, end }));
  }

  return (
    <div className="rounded-xl border border-blue-500/50 bg-blue-950/10 p-3">
      <div className="mb-3">
        <div className="font-bold">{form.start} - {form.end}</div>
        <div className="text-xs font-semibold text-slate-500">{getDurationLabel(form.start, form.end)}</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <TimeSelect label="Начало" value={form.start} isAllowed={startIsAllowed} onSelect={setStart} />
        <TimeSelect label="Конец" value={form.end} isAllowed={endIsAllowed} onSelect={(end) => setForm((current) => ({ ...current, end }))} />
      </div>
    </div>
  );
}

export function TimeSelect({ label, value, isAllowed, onSelect }) {
  const [open, setOpen] = useState(false);
  const [draftHour, setDraftHour] = useState(value.slice(0, 2));
  const [draftMinute, setDraftMinute] = useState(value.slice(3, 5));
  const draftValue = `${String(draftHour).padStart(2, "0")}:${String(draftMinute).padStart(2, "0")}`;
  const invalid = !isAllowed(draftValue);

  function clamp(valueToClamp, min, max) {
    const parsed = Number(valueToClamp);
    if (Number.isNaN(parsed)) return min;
    return Math.min(Math.max(parsed, min), max);
  }

  function apply() {
    if (invalid) return;
    onSelect(draftValue);
    setOpen(false);
  }

  return (
    <div className="relative">
      <span className="mb-2 block text-sm font-bold text-slate-300">{label}</span>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-lg font-bold ${
          open ? "border-violet-500 bg-slate-800" : "border-white/10 bg-white/[.055]"
        }`}
      >
        {value}
        <ChevronDown size={17} className={`text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <button type="button" className="fixed inset-0 z-[85]" onClick={() => setOpen(false)} aria-label="Закрыть выбор времени" />
          <div className="absolute left-0 top-full z-[90] mt-2 w-56 rounded-xl border border-white/10 bg-[#111926] p-3 shadow-2xl">
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-slate-400">Час</span>
                <input
                  value={draftHour}
                  onChange={(event) => setDraftHour(String(clamp(event.target.value, 0, 23)).padStart(2, "0"))}
                  type="number"
                  min="0"
                  max="23"
                  className="w-full rounded-lg border border-white/10 bg-white/[.06] px-3 py-3 text-center text-lg font-bold outline-none focus:border-violet-500"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-slate-400">Мин</span>
                <input
                  value={draftMinute}
                  onChange={(event) => setDraftMinute(String(clamp(event.target.value, 0, 59)).padStart(2, "0"))}
                  type="number"
                  min="0"
                  max="59"
                  step="5"
                  className="w-full rounded-lg border border-white/10 bg-white/[.06] px-3 py-3 text-center text-lg font-bold outline-none focus:border-violet-500"
                />
              </label>
            </div>
            {invalid && <p className="mt-3 rounded-md bg-red-950/70 px-2 py-2 text-xs font-bold text-red-100">Это время недоступно</p>}
            <button
              type="button"
              disabled={invalid}
              onClick={apply}
              className="mt-3 w-full rounded-lg bg-violet-600 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              Применить
            </button>
          </div>
        </>
      )}
    </div>
  );
}
