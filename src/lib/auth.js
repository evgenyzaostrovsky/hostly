import { supabase } from "./supabase";

const emailDomain = import.meta.env.VITE_AUTH_EMAIL_DOMAIN || "redwood.local";

export const employeeRoles = [
  { value: "hostess", label: "Хостес" },
  { value: "waiter", label: "Официант" },
  { value: "hookah_master", label: "Кальянный мастер" },
];

export function getRoleLabel(value) {
  return employeeRoles.find((role) => role.value === value)?.label || value;
}

export function normalizePhone(phone) {
  return phone.replace(/\D/g, "");
}

export function validatePhone(phone) {
  const normalized = normalizePhone(phone);

  if (normalized.length !== 10) {
    return "Введите 10 цифр номера без +7 или 8";
  }

  return "";
}

export function phoneToEmail(phone) {
  return `${normalizePhone(phone)}@${emailDomain}`;
}

export async function loginEmployee({ phone, password }) {
  const phoneError = validatePhone(phone);
  if (phoneError) throw new Error(phoneError);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: phoneToEmail(phone),
    password,
  });

  if (error) throw new Error("Неверный номер телефона или пароль");

  return data;
}

export async function registerEmployee({ phone, name, password, role }) {
  const phoneError = validatePhone(phone);
  if (phoneError) throw new Error(phoneError);
  if (!name.trim()) throw new Error("Введите имя");
  if (password.length < 6) throw new Error("Пароль минимум 6 символов");

  const normalizedPhone = normalizePhone(phone);
  const { data, error } = await supabase.auth.signUp({
    email: phoneToEmail(normalizedPhone),
    password,
    options: {
      data: {
        phone: normalizedPhone,
        name: name.trim(),
        role,
      },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already")) {
      throw new Error("Этот номер уже зарегистрирован. Войдите по номеру и паролю.");
    }

    throw new Error(error.message);
  }

  const userId = data.user?.id;
  if (!userId) throw new Error("Не удалось создать пользователя");

  const { error: profileError } = await supabase.from("employees").insert({
    auth_user_id: userId,
    phone: normalizedPhone,
    name: name.trim(),
    role,
  });

  if (profileError && profileError.code !== "23505") {
    throw new Error(profileError.message);
  }

  return data;
}

export async function getCurrentEmployee(userId) {
  if (!userId) return null;

  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data;
}

export async function logoutEmployee() {
  await supabase.auth.signOut();
}

export async function changeEmployeePassword(password) {
  if (password.length < 6) throw new Error("Пароль минимум 6 символов");

  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(error.message);
}
