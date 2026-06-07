import React, { useState } from "react";
import { KeyRound, Phone, ShieldCheck, UserRound } from "lucide-react";
import Modal, { Field, Info } from "../../components/Modal";
import PoweredBy from "../../components/PoweredBy";
import { changeEmployeePassword, getRoleLabel } from "./authApi";

export default function ProfileModal({ employee, onClose, onRequestLogout }) {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setStatus("");
    setLoading(true);

    try {
      await changeEmployeePassword(password);
      setPassword("");
      setStatus("Пароль обновлен");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Личный кабинет</h2>
          <p className="mt-1 text-sm text-slate-400">Профиль сотрудника LAZYBOOK</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Info label="Имя" value={employee.name} icon={<UserRound size={16} />} />
          <Info label="Телефон" value={employee.phone} icon={<Phone size={16} />} />
          <Info label="Роль" value={getRoleLabel(employee.role)} icon={<ShieldCheck size={16} />} />
          <Info label="Доступ" value={employee.is_master ? "Master" : "Сотрудник"} icon={<KeyRound size={16} />} />
        </div>

        <form onSubmit={submit} className="rounded-xl border border-white/10 bg-white/[.035] p-3">
          <Field label="Новый пароль">
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="Минимум 6 символов"
              className="field"
            />
          </Field>
          {error && <p className="mt-3 rounded-lg border border-red-500/30 bg-red-950/50 px-3 py-2 text-sm font-semibold text-red-100">{error}</p>}
          {status && <p className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-3 py-2 text-sm font-semibold text-emerald-100">{status}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="mt-4 w-full rounded-xl bg-violet-600 py-3 font-bold text-white shadow-glow disabled:bg-slate-700 disabled:text-slate-400"
          >
            {loading ? "Сохраняем" : "Сменить пароль"}
          </button>
        </form>

        <button type="button" onClick={onClose} className="w-full rounded-xl bg-white/[.06] py-3 font-bold ring-1 ring-white/10">
          Закрыть
        </button>

        <button type="button" onClick={onRequestLogout} className="w-full rounded-xl bg-red-950/70 py-3 font-bold text-red-100 ring-1 ring-red-500/30 md:hidden">
          Выйти
        </button>

        <PoweredBy />
      </div>
    </Modal>
  );
}
