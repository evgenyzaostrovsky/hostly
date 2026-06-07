import React from "react";
import { getTableState, toneClasses } from "../features/tables/tableUtils";

export default function TableCard({ table, reservations, selectedDate, openTable }) {
  const state = getTableState(table.id, reservations, selectedDate);

  return (
    <button
      onClick={() => openTable(table.id)}
      className={`aspect-square rounded-lg border bg-gradient-to-br p-3 text-left shadow-xl shadow-black/25 transition hover:-translate-y-0.5 ${toneClasses(state.tone)}`}
    >
      <div className="flex h-full flex-col items-center justify-between text-center">
        <div>
          <div className="text-5xl font-bold leading-none">{table.id}</div>
          <div className="mt-2 text-sm font-semibold leading-tight">{state.label}</div>
        </div>
        <div className="h-px w-full bg-white/12" />
        <div className="text-sm text-white/90">
          {state.next ? (
            <>
              <span className="block text-white/65">Ближайшая бронь</span>
              <span className="text-lg font-semibold">{state.next.start}</span>
            </>
          ) : (
            <>
              <span className="block">Сегодня</span>
              <span className="block">броней нет</span>
            </>
          )}
        </div>
      </div>
    </button>
  );
}
