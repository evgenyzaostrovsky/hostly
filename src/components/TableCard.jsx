import React from "react";
import { getTableState, toneClasses } from "../features/tables/tableUtils";
import { isToday } from "../lib/dateTime";

export default function TableCard({ table, reservations, selectedDate, openTable }) {
  const state = getTableState(table.id, reservations, selectedDate);
  const emptyDateLabel = isToday(selectedDate) ? "Сегодня" : "На дату";

  return (
    <button
      onClick={() => openTable(table.id)}
      className={`aspect-square rounded-lg border bg-gradient-to-br p-2 text-left shadow-xl shadow-black/25 transition hover:-translate-y-0.5 sm:p-3 ${toneClasses(state.tone)}`}
    >
      <div className="flex h-full flex-col items-center justify-between text-center">
        <div>
          <div className="text-3xl font-bold leading-none sm:text-5xl">{table.id}</div>
          <div className="mt-1 text-[11px] font-semibold leading-tight sm:mt-2 sm:text-sm">{state.label}</div>
        </div>
        <div className="h-px w-full bg-white/12" />
        <div className="text-[11px] leading-tight text-white/90 sm:text-sm">
          {state.next ? (
            <>
              <span className="block text-white/65">Ближайшая бронь</span>
              <span className="text-sm font-semibold sm:text-lg">{state.next.start}</span>
            </>
          ) : (
            <>
              <span className="block">{emptyDateLabel}</span>
              <span className="block">броней нет</span>
            </>
          )}
        </div>
      </div>
    </button>
  );
}
