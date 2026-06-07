import React from "react";
import { Field } from "../../components/Modal";
import { employeeRoles } from "./authApi";

export default function RegisterScreen({ form, update }) {
  return (
    <>
      <Field label="Имя">
        <input
          value={form.name}
          onChange={(event) => update("name", event.target.value)}
          placeholder="Имя сотрудника"
          className="w-full rounded-xl border border-white/10 bg-white/[.055] px-4 py-3 text-base font-semibold text-white outline-none focus:border-violet-500"
        />
      </Field>

      <div>
        <span className="mb-2 block text-sm font-semibold text-slate-300">Роль</span>
        <div className="grid gap-2">
          {employeeRoles.map((role) => (
            <button
              key={role.value}
              type="button"
              onClick={() => update("role", role.value)}
              className={`rounded-xl border px-4 py-3 text-left text-base font-bold transition ${
                form.role === role.value
                  ? "border-violet-500 bg-violet-600 text-white shadow-glow"
                  : "border-white/10 bg-white/[.055] text-slate-300 hover:bg-white/[.08]"
              }`}
            >
              {role.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
