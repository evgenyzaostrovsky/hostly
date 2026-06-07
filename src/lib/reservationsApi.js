import { supabase } from "./supabase";

function fromDb(row) {
  return {
    id: row.id,
    date: row.date,
    tableId: row.table_id,
    start: row.start_time?.slice(0, 5),
    end: row.end_time?.slice(0, 5),
    name: row.guest_name || "",
    phone: row.guest_phone || "",
    guests: row.guests_count,
    status: row.status,
    type: row.type,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
  };
}

function toDb(reservation, employeeId) {
  return {
    date: reservation.date,
    table_id: Number(reservation.tableId),
    start_time: reservation.start,
    end_time: reservation.end,
    guest_name: reservation.name || "",
    guest_phone: reservation.phone || "",
    guests_count: Number(reservation.guests || 1),
    status: reservation.status,
    type: reservation.type || "booking",
    updated_by: employeeId || null,
  };
}

export async function fetchReservations() {
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) throw new Error(error.message);

  return data.map(fromDb);
}

export async function insertReservation(reservation, employeeId) {
  const payload = {
    ...toDb(reservation, employeeId),
    created_by: employeeId || null,
  };

  const { data, error } = await supabase
    .from("reservations")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  return fromDb(data);
}

export async function saveReservation(reservation, employeeId) {
  const { data, error } = await supabase
    .from("reservations")
    .update(toDb(reservation, employeeId))
    .eq("id", reservation.id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  return fromDb(data);
}

export async function removeReservation(id) {
  const { error } = await supabase.from("reservations").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export function subscribeReservations(onChange) {
  return supabase
    .channel("reservations-feed")
    .on("postgres_changes", { event: "*", schema: "public", table: "reservations" }, onChange)
    .subscribe();
}

