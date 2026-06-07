import React, { useMemo, useState } from "react";
import { CalendarDays, Clock3, UsersRound } from "lucide-react";
import { addMinutes, getActualNowTime, timeToMinutes } from "../../lib/dateTime";
import Modal, { AvailabilityPanel, ConfirmDialog, Field, Info } from "../../components/Modal";
import { TimeRangePicker } from "../../components/TimeSelect";
import { getReservationConflict, hasReservationChanges } from "./reservationUtils";

export default function ReservationEditor({ reservation, tables, reservations, onClose, onSave, onDelete, onFinish }) {
  const [form, setForm] = useState({
    ...reservation,
    tableId: reservation.tableId,
    guests: reservation.guests || 1,
    phone: reservation.phone || "",
  });
  const [confirmation, setConfirmation] = useState(null);
  const isSeating = reservation.type === "seating";
  const changed = hasReservationChanges(reservation, form);
  const conflict = getReservationConflict(reservations, form, reservation.id);
  const busySlots = useMemo(
    () => reservations
      .filter((item) => item.tableId === Number(form.tableId) && item.date === form.date && item.id !== reservation.id)
      .filter((item) => timeToMinutes(item.end) >= timeToMinutes(getActualNowTime()))
      .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start)),
    [form.date, form.tableId, reservation.id, reservations],
  );

  function save() {
    if (conflict) return;
    if (changed) {
      setConfirmation({
        title: "Сохранить изменения?",
        text: "Бронь обновится у всех сотрудников.",
        confirmLabel: "Сохранить",
        onConfirm: () => onSave(form),
      });
    }
  }

  function extend(minutes) {
    const next = { ...form, end: addMinutes(form.end, minutes) };
    if (!getReservationConflict(reservations, next, reservation.id)) setForm(next);
  }

  return (
    <Modal onClose={onClose}>
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">{isSeating ? "Посадка гостей" : "Бронь"}</h2>
          <p className="mt-1 text-sm text-slate-400">Стол {reservation.tableId}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Info label="Дата" value={form.date} icon={<CalendarDays size={16} />} />
          <Info label="Гости" value={form.guests} icon={<UsersRound size={16} />} />
        </div>

        <Field label="Дата">
          <input value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} type="date" className="field" />
        </Field>

        <Field label="Стол">
          <select value={form.tableId} onChange={(event) => setForm({ ...form, tableId: Number(event.target.value) })} className="field">
            {tables.map((table) => <option key={table.id} value={table.id}>Стол {table.id}</option>)}
          </select>
        </Field>

        <TimeRangePicker form={form} setForm={setForm} reservations={reservations} tableId={Number(form.tableId)} ignoreId={reservation.id} />

        <Field label="Гость">
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="field" />
        </Field>

        <Field label="Телефон">
          <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="field" />
        </Field>

        <Field label="Гости">
          <input value={form.guests} onChange={(event) => setForm({ ...form, guests: event.target.value })} type="number" min="1" className="field" />
        </Field>

        {isSeating && reservation.status === "busy" && (
          <div className="grid grid-cols-3 gap-2">
            <button type="button" onClick={() => extend(30)} className="rounded-lg bg-white/[.06] py-2 text-sm font-bold ring-1 ring-white/10">+30 мин</button>
            <button type="button" onClick={() => extend(60)} className="rounded-lg bg-white/[.06] py-2 text-sm font-bold ring-1 ring-white/10">+1 час</button>
            <button type="button" onClick={() => onFinish(reservation.id)} className="rounded-lg bg-red-800 py-2 text-sm font-bold text-white">Гость ушел</button>
          </div>
        )}

        <AvailabilityPanel busySlots={busySlots} conflict={conflict} />

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setConfirmation({
              title: "Удалить бронь?",
              text: "Это действие нельзя случайно отменить.",
              confirmLabel: "Удалить",
              danger: true,
              onConfirm: () => onDelete(reservation.id),
            })}
            className="rounded-xl bg-red-950/70 py-3 font-bold text-red-100 ring-1 ring-red-500/30"
          >
            Удалить
          </button>
          <button type="button" onClick={save} disabled={!changed || Boolean(conflict)} className="rounded-xl bg-violet-600 py-3 font-bold text-white shadow-glow disabled:bg-slate-700 disabled:text-slate-400">
            Сохранить
          </button>
        </div>

        <button type="button" onClick={onClose} className="w-full rounded-xl bg-white/[.06] py-3 font-bold ring-1 ring-white/10">
          Закрыть
        </button>

        {confirmation && (
          <ConfirmDialog
            title={confirmation.title}
            text={confirmation.text}
            confirmLabel={confirmation.confirmLabel}
            danger={confirmation.danger}
            onCancel={() => setConfirmation(null)}
            onConfirm={confirmation.onConfirm}
          />
        )}
      </div>
    </Modal>
  );
}
