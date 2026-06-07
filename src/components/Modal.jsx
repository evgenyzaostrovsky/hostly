import React, { useState } from "react";
import { Clock3 } from "lucide-react";

export function ConfirmDialog({ title, text, confirmLabel, danger = false, onCancel, onConfirm }) {
  return (
    <div className="absolute inset-0 z-10 grid place-items-center rounded-2xl bg-black/65 p-4 backdrop-blur-sm">
      <div className="w-full rounded-xl border border-white/10 bg-[#111926] p-4 shadow-2xl">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="mt-2 text-sm text-slate-400">{text}</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button type="button" onClick={onCancel} className="rounded-xl bg-white/[.06] py-3 font-semibold ring-1 ring-white/10">
            Отмена
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl py-3 font-bold ${danger ? "bg-red-700 text-white" : "bg-violet-600 text-white shadow-glow"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AvailabilityPanel({ busySlots, conflict }) {
  const [open, setOpen] = useState(Boolean(conflict));

  return (
    <div className="rounded-lg bg-white/[.045] p-3 text-sm ring-1 ring-white/8">
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between font-semibold text-slate-200">
        <span className="flex items-center gap-2">
          <Clock3 size={17} />
          Занятое время
        </span>
        <span className="text-xs text-slate-400">{busySlots.length ? `${busySlots.length} интервала` : "свободно"}</span>
      </button>
      {open && (
        busySlots.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {busySlots.map((slot) => (
              <span key={slot.id} className="rounded-md bg-white/[.07] px-2.5 py-1 text-slate-300">
                {slot.start} - {slot.end}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-slate-400">На этот стол сегодня броней нет</p>
        )
      )}
      {conflict && (
        <p className="mt-3 rounded-md border border-red-500/30 bg-red-950/50 px-3 py-2 font-semibold text-red-100">
          {conflict.type === "time"
            ? "Время окончания должно быть позже начала"
            : `Это время пересекается с бронью ${conflict.start} - ${conflict.end}`}
        </p>
      )}
    </div>
  );
}

export function Info({ label, value, icon }) {
  return (
    <div className="rounded-lg bg-white/[.045] p-3 ring-1 ring-white/8">
      <div className="flex items-center gap-2 text-slate-400">{icon}{label}</div>
      <div className="mt-2 font-semibold">{value}</div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-300">{label}</span>
      {children}
    </label>
  );
}

export default function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/60 p-3 backdrop-blur-sm sm:place-items-center">
      <button className="absolute inset-0" onClick={onClose} aria-label="Закрыть" />
      <div className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#101722] p-5 shadow-2xl shadow-black/50">
        {children}
      </div>
    </div>
  );
}
