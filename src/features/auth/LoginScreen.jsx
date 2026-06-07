import React, { useState } from "react";
import { Field } from "../../components/Modal";
import RegisterScreen from "./RegisterScreen";

export default function LoginScreen({ onLogin, onRegister }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ phone: "", name: "", password: "", role: "hostess" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isRegister = mode === "register";

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        await onRegister(form);
      } else {
        await onLogin(form);
      }
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#070a11] px-4 py-8 text-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        <div className="mb-8">
          <div className="text-3xl font-semibold tracking-[0.2em]">REDWOOD<span className="mx-1 text-violet-300">*</span></div>
          <p className="mt-3 text-sm text-slate-400">Вход для сотрудников зала</p>
        </div>

        <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-[#101722] p-5 shadow-2xl shadow-black/40">
          <div className="mb-5 grid grid-cols-2 rounded-xl bg-white/[.045] p-1 ring-1 ring-white/8">
            <button type="button" onClick={() => setMode("login")} className={`rounded-lg py-2 text-sm font-bold ${!isRegister ? "bg-violet-600 text-white" : "text-slate-400"}`}>
              Вход
            </button>
            <button type="button" onClick={() => setMode("register")} className={`rounded-lg py-2 text-sm font-bold ${isRegister ? "bg-violet-600 text-white" : "text-slate-400"}`}>
              Регистрация
            </button>
          </div>

          <div className="space-y-4">
            <Field label="Телефон без +7 или 8">
              <input
                value={form.phone}
                onChange={(event) => update("phone", event.target.value)}
                inputMode="numeric"
                maxLength={10}
                placeholder="9991234567"
                className="w-full rounded-xl border border-white/10 bg-white/[.055] px-4 py-3 text-base font-semibold text-white outline-none focus:border-violet-500"
              />
            </Field>

            {isRegister && <RegisterScreen form={form} update={update} />}

            <Field label="Пароль">
              <input
                value={form.password}
                onChange={(event) => update("password", event.target.value)}
                type="password"
                placeholder="Минимум 6 символов"
                className="w-full rounded-xl border border-white/10 bg-white/[.055] px-4 py-3 text-base font-semibold text-white outline-none focus:border-violet-500"
              />
            </Field>
          </div>

          {error && <p className="mt-4 rounded-lg border border-red-500/30 bg-red-950/50 px-3 py-2 text-sm font-semibold text-red-100">{error}</p>}

          <button type="submit" disabled={loading} className="mt-6 w-full rounded-xl bg-violet-600 py-3 text-base font-bold text-white shadow-glow disabled:cursor-not-allowed disabled:bg-slate-700">
            {loading ? "Подождите" : isRegister ? "Зарегистрироваться" : "Войти"}
          </button>
        </form>
      </div>
    </main>
  );
}
