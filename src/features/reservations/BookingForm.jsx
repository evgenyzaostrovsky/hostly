import React, { useMemo, useState } from "react";
import { getActualNowTime, timeToMinutes } from "../../lib/dateTime";
import Modal, { AvailabilityPanel, Field } from "../../components/Modal";
import { TimeRangePicker } from "../../components/TimeSelect";
import { getDefaultBookingTime, getReservationConflict } from "./reservationUtils";

export default function BookingForm({ table, reservations, selectedDate, type, onClose, onCreate }) {
  const isSeating = type === "seating";
  const defaultTime = getDefaultBookingTime(table.id, reservations, selectedDate, isSeating ? "exact" : false);
  const [form, setForm] = useState({
    date: selectedDate,
    tableId: table.id,
    start: defaultTime.start,
    end: defaultTime.end,
    name: isSeating ? "Посадка гостей" : "",
    phone: "",
    guests: 2,
    type,
  });

  const busySlots = useMemo(
    () => reservations
      .filter((item) => item.tableId === table.id && item.date === form.date && item.id !== form.id)
      .filter((item) => !isSeating || timeToMinutes(item.end) >= timeToMinutes(getActualNowTime()))
      .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start)),
    [form.date, form.id, isSeating, reservations, table.id],
  );
  const conflict = getReservationConflict(reservations, form);

  function submit(event) {
    event.preventDefault();
    if (conflict) return;
    onCreate({ ...form, guests: Number(form.guests) });
  }

  return (
    <Modal onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">{isSeating ? "Посадка гостей" : "Новая бронь"}</h2>
          <p className="mt-1 text-sm text-slate-400">Стол {table.id}</p>
        </div>

        {isSeating ? (
          <div className="rounded-xl border border-blue-500/40 bg-blue-950/20 p-3">
            <div className="text-sm font-bold text-slate-300">Время посадки</div>
            <div className="mt-1 text-xl font-bold">{form.start} - {form.end}</div>
            <div className="mt-1 text-xs text-slate-500">Ставим от текущего времени на 2 часа</div>
          </div>
        ) : (
          <TimeRangePicker form={form} setForm={setForm} reservations={reservations} tableId={table.id} />
        )}

        <Field label="Гость">
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="field" placeholder="Имя гостя" />
        </Field>

        <Field label="Телефон">
          <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="field" placeholder="Телефон" />
        </Field>

        <Field label="Гости">
          <input value={form.guests} onChange={(event) => setForm({ ...form, guests: event.target.value })} type="number" min="1" className="field" />
        </Field>

        <AvailabilityPanel busySlots={busySlots} conflict={conflict} />

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl bg-white/[.06] py-3 font-bold ring-1 ring-white/10">
            Отмена
          </button>
          <button type="submit" disabled={Boolean(conflict)} className="rounded-xl bg-violet-600 py-3 font-bold text-white shadow-glow disabled:bg-slate-700 disabled:text-slate-400">
            Создать
          </button>
        </div>
      </form>
    </Modal>
  );
}
