import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Filter, Grid2X2, UserRound, UsersRound } from "lucide-react";
import Header from "../components/Header";
import TableCard from "../components/TableCard";
import ScheduleGrid from "../components/ScheduleGrid";
import { DateButtonMobile } from "../components/CalendarPopover";
import { ConfirmDialog } from "../components/Modal";
import LoginScreen from "../features/auth/LoginScreen";
import { getCurrentEmployee, loginEmployee, logoutEmployee, registerEmployee } from "../features/auth/authApi";
import ProfileModal from "../features/auth/ProfileModal";
import BookingForm from "../features/reservations/BookingForm";
import ReservationEditor from "../features/reservations/ReservationEditor";
import { seedReservations } from "../features/reservations/mockData";
import { getReservationConflict } from "../features/reservations/reservationUtils";
import TableDetails from "../features/tables/TableDetails";
import { initialTables } from "../features/tables/tableUtils";
import { addDays, getActualNowTime, toIsoDate } from "../lib/dateTime";
import { hasSupabaseConfig, isProductionWithoutSupabase, supabase } from "../lib/supabase";
import { fetchReservations, insertReservation, removeReservation, saveReservation, subscribeReservations } from "../lib/reservationsApi";

const STARTUP_TIMEOUT_MS = 8000;

function withTimeout(promise, message, timeout = STARTUP_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error(message)), timeout);
    }),
  ]);
}

export default function App() {
  const [mode, setMode] = useState("tile");
  const [screen, setScreen] = useState("home");
  const [selectedTableId, setSelectedTableId] = useState(3);
  const [selectedDate, setSelectedDate] = useState(toIsoDate(new Date()));
  const [reservations, setReservations] = useState(hasSupabaseConfig ? [] : seedReservations);
  const [booking, setBooking] = useState(null);
  const [viewedReservation, setViewedReservation] = useState(null);
  const [authLoading, setAuthLoading] = useState(hasSupabaseConfig);
  const [dataLoading, setDataLoading] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [appError, setAppError] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [startupError, setStartupError] = useState("");
  const [startupRetry, setStartupRetry] = useState(0);

  useEffect(() => {
    if (!hasSupabaseConfig) return undefined;

    let mounted = true;

    async function loadSession() {
      setAuthLoading(true);
      setStartupError("");

      try {
        const { data } = await withTimeout(
          supabase.auth.getSession(),
          "Не удалось быстро подключиться к Supabase. Проверь интернет и попробуй еще раз.",
        );
        const user = data.session?.user || null;

        if (!mounted) return;

        setAuthUser(user);

        if (user) {
          await withTimeout(
            loadEmployee(user.id),
            "Не удалось загрузить профиль сотрудника. Проверь интернет и попробуй еще раз.",
          );
        }
      } catch (error) {
        if (mounted) {
          setStartupError(error.message);
          setAuthUser(null);
          setEmployee(null);
        }
      } finally {
        if (mounted) setAuthLoading(false);
      }
    }

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user || null;
      setAuthUser(user);
      try {
        setEmployee(user ? await getCurrentEmployee(user.id) : null);
      } catch (error) {
        setAppError(error.message);
      }
    });

    loadSession();

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [startupRetry]);

  useEffect(() => {
    if (!hasSupabaseConfig || !authUser) return undefined;

    loadReservations();

    const channel = subscribeReservations(() => {
      loadReservations(false);
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authUser]);

  async function loadEmployee(userId) {
    try {
      const profile = await getCurrentEmployee(userId);
      setEmployee(profile);
      setAppError("");
    } catch (error) {
      setAppError(error.message);
    }
  }

  async function loadReservations(showLoader = true) {
    try {
      if (showLoader) setDataLoading(true);
      const items = await fetchReservations();
      setReservations(items);
      setAppError("");
    } catch (error) {
      setAppError(error.message);
    } finally {
      setDataLoading(false);
    }
  }

  const selectedTable = initialTables.find((table) => table.id === selectedTableId);
  const dayReservations = useMemo(
    () => reservations.filter((item) => item.date === selectedDate),
    [reservations, selectedDate],
  );
  const selectedReservations = useMemo(
    () => dayReservations.filter((item) => item.tableId === selectedTableId),
    [dayReservations, selectedTableId],
  );

  function openTable(tableId) {
    setSelectedTableId(tableId);
    setScreen("table");
  }

  async function createReservation(data) {
    if (getReservationConflict(reservations, { ...data, tableId: selectedTableId })) return;

    const reservation = { id: Date.now(), date: selectedDate, tableId: selectedTableId, status: data.type === "seating" ? "busy" : "booked", ...data };

    if (hasSupabaseConfig) {
      try {
        const saved = await insertReservation(reservation, employee?.id);
        setReservations((current) => [...current, saved]);
      } catch (error) {
        setAppError(error.message);
        return;
      }
    } else {
      setReservations((current) => [...current, reservation]);
    }

    setSelectedDate(data.date);
    setBooking(null);
  }

  async function updateReservation(data) {
    if (getReservationConflict(reservations, data, data.id)) return;

    const reservation = { ...data, tableId: Number(data.tableId), guests: Number(data.guests) };

    if (hasSupabaseConfig) {
      try {
        const saved = await saveReservation(reservation, employee?.id);
        setReservations((current) => current.map((item) => (item.id === data.id ? saved : item)));
      } catch (error) {
        setAppError(error.message);
        return;
      }
    } else {
      setReservations((current) => current.map((item) => (item.id === data.id ? { ...item, ...reservation } : item)));
    }

    setSelectedTableId(Number(data.tableId));
    setSelectedDate(data.date);
    setViewedReservation(null);
  }

  async function deleteReservation(id) {
    if (hasSupabaseConfig) {
      try {
        await removeReservation(id);
      } catch (error) {
        setAppError(error.message);
        return;
      }
    }

    setReservations((current) => current.filter((item) => item.id !== id));
    setViewedReservation(null);
  }

  async function finishReservation(id) {
    const now = getActualNowTime();
    const reservation = reservations.find((item) => item.id === id);
    if (!reservation) return;

    await updateReservation({ ...reservation, status: "finished", end: now });
    setViewedReservation(null);
  }

  async function handleLogin(credentials) {
    const data = await loginEmployee(credentials);
    const user = data.user || data.session?.user;
    setAuthUser(user);
    if (user) await loadEmployee(user.id);
  }

  async function handleRegister(credentials) {
    const data = await registerEmployee(credentials);
    const user = data.user || data.session?.user;
    setAuthUser(user);
    if (user) await loadEmployee(user.id);
  }

  async function handleLogout() {
    await logoutEmployee();
    setAuthUser(null);
    setEmployee(null);
    setReservations([]);
    setScreen("home");
    setConfirmLogout(false);
    setShowProfile(false);
  }

  if (isProductionWithoutSupabase) {
    return <MissingSupabaseConfig />;
  }

  if (authLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#070a11] px-6 text-slate-100">
        <div className="text-center">
          <div className="text-2xl font-semibold tracking-[0.18em]">REDWOOD<span className="mx-1 text-violet-300">*</span></div>
          <p className="mt-3 text-sm text-slate-400">Загружаем смену</p>
        </div>
      </main>
    );
  }

  if (startupError) {
    return <StartupErrorScreen error={startupError} onRetry={() => setStartupRetry((value) => value + 1)} />;
  }

  if (hasSupabaseConfig && !authUser) {
    return <LoginScreen onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <main className="min-h-screen bg-[#070a11] text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col bg-[radial-gradient(circle_at_top_right,rgba(91,66,214,.18),transparent_38%),linear-gradient(180deg,#090d15_0%,#070a11_60%)]">
        {screen === "home" ? (
          <Home
            mode={mode}
            setMode={setMode}
            tables={initialTables}
            reservations={dayReservations}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            openTable={openTable}
            onReservation={setViewedReservation}
            employee={employee}
            onOpenProfile={() => setShowProfile(true)}
            onRequestLogout={() => setConfirmLogout(true)}
            dataLoading={dataLoading}
          />
        ) : (
          <TableDetails
            table={selectedTable}
            reservations={selectedReservations}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onBack={() => setScreen("home")}
            onNew={() => setBooking({ tableId: selectedTableId, type: "booking" })}
            onSeat={() => setBooking({ tableId: selectedTableId, type: "seating" })}
            onReservation={setViewedReservation}
          />
        )}

        {booking && (
          <BookingForm
            table={selectedTable}
            reservations={reservations}
            selectedDate={selectedDate}
            type={booking.type}
            onClose={() => setBooking(null)}
            onCreate={createReservation}
          />
        )}

        {viewedReservation && (
          <ReservationEditor
            reservation={viewedReservation}
            tables={initialTables}
            reservations={reservations}
            selectedDate={selectedDate}
            onClose={() => setViewedReservation(null)}
            onSave={updateReservation}
            onDelete={deleteReservation}
            onFinish={finishReservation}
          />
        )}

        {showProfile && employee && (
          <ProfileModal employee={employee} onClose={() => setShowProfile(false)} onRequestLogout={() => setConfirmLogout(true)} />
        )}

        {confirmLogout && (
          <div className="fixed inset-0 z-[95] grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#101722] p-5 shadow-2xl">
              <ConfirmDialog
                title="Выйти из аккаунта?"
                text="Приложение вернется на экран входа."
                confirmLabel="Выйти"
                danger
                onCancel={() => setConfirmLogout(false)}
                onConfirm={handleLogout}
              />
            </div>
          </div>
        )}

        {appError && (
          <div className="fixed bottom-4 left-4 right-4 z-[90] rounded-xl border border-red-500/40 bg-red-950/90 px-4 py-3 text-sm font-semibold text-red-50 shadow-2xl sm:left-auto sm:w-96">
            {appError}
          </div>
        )}
      </div>
    </main>
  );
}

function StartupErrorScreen({ error, onRetry }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#070a11] px-4 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#101722] p-6 text-center shadow-2xl shadow-black/40">
        <div className="text-2xl font-semibold tracking-[0.18em]">REDWOOD<span className="mx-1 text-violet-300">*</span></div>
        <h1 className="mt-6 text-xl font-bold">Не удалось загрузить приложение</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">{error}</p>
        <button type="button" onClick={onRetry} className="mt-6 w-full rounded-xl bg-violet-600 py-3 font-bold text-white shadow-glow">
          Повторить
        </button>
      </div>
    </main>
  );
}

function MissingSupabaseConfig() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#070a11] px-4 text-slate-100">
      <div className="w-full max-w-lg rounded-2xl border border-red-500/30 bg-[#101722] p-6 shadow-2xl shadow-black/40">
        <div className="text-2xl font-semibold tracking-[0.18em]">REDWOOD<span className="mx-1 text-violet-300">*</span></div>
        <h1 className="mt-6 text-2xl font-bold">Supabase не подключен</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          На production-деплое не заданы переменные окружения. Приложение остановлено, чтобы не работать на моковых данных.
        </p>
        <div className="mt-5 rounded-xl bg-white/[.045] p-4 text-sm text-slate-300 ring-1 ring-white/10">
          <div className="font-bold text-white">Добавь в Vercel:</div>
          <div className="mt-3 space-y-1 font-mono text-xs">
            <div>VITE_SUPABASE_URL</div>
            <div>VITE_SUPABASE_ANON_KEY</div>
            <div>VITE_AUTH_EMAIL_DOMAIN</div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Home({ mode, setMode, tables, reservations, selectedDate, setSelectedDate, openTable, onReservation, employee, onOpenProfile, onRequestLogout, dataLoading }) {
  return (
    <>
      <Header mode={mode} setMode={setMode} selectedDate={selectedDate} setSelectedDate={setSelectedDate} employee={employee} onOpenProfile={onOpenProfile} onRequestLogout={onRequestLogout} />
      <section className="flex-1 px-4 py-4 md:px-6">
        {dataLoading && <div className="mb-3 rounded-lg bg-white/[.045] px-3 py-2 text-sm text-slate-400 ring-1 ring-white/8">Обновляем брони</div>}
        {mode === "tile" ? (
          <TileMode tables={tables} reservations={reservations} selectedDate={selectedDate} setSelectedDate={setSelectedDate} openTable={openTable} />
        ) : (
          <ScheduleGrid tables={tables} reservations={reservations} selectedDate={selectedDate} openTable={openTable} onReservation={onReservation} />
        )}
      </section>
      <BottomNav onOpenProfile={onOpenProfile} />
    </>
  );
}

function TileMode({ tables, reservations, selectedDate, setSelectedDate, openTable }) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between sm:hidden">
        <button className="icon-btn" aria-label="Предыдущий день" onClick={() => setSelectedDate(addDays(selectedDate, -1))}>
          <ChevronLeft size={20} />
        </button>
        <div className="min-w-0 flex-1 px-2">
          <DateButtonMobile selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
        </div>
        <button className="icon-btn" aria-label="Следующий день" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
          <ChevronRight size={20} />
        </button>
        <button className="icon-btn" aria-label="Фильтр">
          <Filter size={21} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {tables.map((table) => (
          <TableCard key={table.id} table={table} reservations={reservations} selectedDate={selectedDate} openTable={openTable} />
        ))}
      </div>
    </div>
  );
}

function BottomNav({ onOpenProfile }) {
  return (
    <nav className="sticky bottom-0 z-40 grid grid-cols-4 border-t border-white/8 bg-[#0a0f17]/95 px-2 py-2 backdrop-blur md:hidden">
      {[
        ["Зал", <Grid2X2 size={21} />],
        ["Брони", <CalendarDays size={21} />],
        ["Клиенты", <UsersRound size={21} />],
        ["Профиль", <UserRound size={21} />],
      ].map(([label, icon], index) => (
        <button
          key={label}
          onClick={label === "Профиль" ? onOpenProfile : undefined}
          className={`flex flex-col items-center gap-1 rounded-xl py-2 text-xs ${index === 0 ? "bg-white/[.055] text-violet-400" : "text-slate-500"}`}
        >
          {icon}
          {label}
        </button>
      ))}
    </nav>
  );
}
