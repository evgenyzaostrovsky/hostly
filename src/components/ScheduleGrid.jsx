import React from "react";
import { DAY_END, getScheduleStartHour, prettyHour, timeToMinutes } from "../lib/dateTime";
import { getTableState, reservationTone } from "../features/tables/tableUtils";

export default function ScheduleGrid({ tables, reservations, selectedDate, openTable, onReservation }) {
  const startHour = getScheduleStartHour(selectedDate);
  const hours = Array.from({ length: DAY_END - startHour + 1 }, (_, index) => startHour + index);
  const hourWidth = 76;
  const tableColumnWidth = 116;
  const timelineWidth = hours.length * hourWidth;
  const totalWidth = tableColumnWidth + timelineWidth;

  return (
    <div className="relative z-0 max-h-[calc(100vh-172px)] overflow-auto rounded-lg border border-white/8 bg-[#0c121b] shadow-2xl shadow-black/35 md:max-h-none">
      <div className="overflow-visible">
        <div style={{ minWidth: `${totalWidth}px` }}>
          <div className="sticky top-0 z-[5] grid border-b border-white/8 bg-[#0c121b] text-sm text-slate-300" style={{ gridTemplateColumns: `${tableColumnWidth}px ${timelineWidth}px` }}>
            <div className="sticky left-0 z-[6] border-r border-white/8 bg-[#0c121b] px-4 py-3">Стол</div>
            <div className="grid bg-[#0c121b]" style={{ gridTemplateColumns: `repeat(${hours.length}, ${hourWidth}px)` }}>
              {hours.map((hour) => (
                <div key={hour} className="border-l border-white/8 px-2 py-3">
                  {prettyHour(hour)}
                </div>
              ))}
            </div>
          </div>
          {tables.map((table) => (
            <div key={table.id} className="grid min-h-14 border-b border-white/8 last:border-b-0" style={{ gridTemplateColumns: `${tableColumnWidth}px ${timelineWidth}px` }}>
              <button onClick={() => openTable(table.id)} className="sticky left-0 z-[2] flex items-center gap-2 border-r border-white/8 bg-[#0c121b] px-4 text-left hover:bg-[#111926]">
                <StatusDot tone={getTableState(table.id, reservations, selectedDate).tone} />
                <span className="block font-semibold">{table.id} стол</span>
              </button>
              <div className="relative grid bg-grid" style={{ gridTemplateColumns: `repeat(${hours.length}, ${hourWidth}px)` }}>
                {hours.map((hour) => <div key={hour} className="border-l border-white/7" />)}
                {reservations
                  .filter((item) => item.tableId === table.id)
                  .filter((item) => timeToMinutes(item.end) > startHour * 60)
                  .map((item) => (
                    <ReservationBlock
                      key={item.id}
                      reservation={item}
                      compact
                      startHour={startHour}
                      visibleHours={hours.length}
                      onClick={() => onReservation(item)}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ReservationBlock({ reservation, compact = false, startHour = 12, visibleHours = 13, onClick }) {
  const start = timeToMinutes(reservation.start);
  const end = timeToMinutes(reservation.end);
  const visibleStart = Math.max(start, startHour * 60);
  const visibleEnd = Math.min(end, (startHour + visibleHours) * 60);
  const left = ((visibleStart - startHour * 60) / (visibleHours * 60)) * 100;
  const width = ((visibleEnd - visibleStart) / (visibleHours * 60)) * 100;

  return (
    <button
      onClick={onClick}
      className={`absolute top-2 rounded-md border px-3 py-2 text-left shadow-lg shadow-black/30 ${reservationTone(reservation.status)} ${compact ? "h-10 text-xs" : "h-20"}`}
      style={{ left: `${Math.max(0, left)}%`, width: `${Math.max(width, 7)}%` }}
    >
      <span className="block truncate font-semibold">{reservation.start} - {reservation.end}</span>
      <span className="block truncate">{reservation.name}, {reservation.guests} гостя</span>
    </button>
  );
}

export function StatusDot({ tone }) {
  const colors = { free: "bg-emerald-500", soon: "bg-orange-500", busy: "bg-red-500" };
  return <span className={`size-3.5 shrink-0 rounded-full ${colors[tone]} shadow-lg`} />;
}
