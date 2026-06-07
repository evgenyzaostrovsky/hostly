create extension if not exists pgcrypto;

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  phone text not null unique check (phone ~ '^[0-9]{10}$'),
  name text not null,
  role text not null check (role in ('hostess', 'waiter', 'hookah_master')),
  is_master boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  table_id integer not null,
  start_time time not null,
  end_time time not null,
  guest_name text not null default '',
  guest_phone text not null default '',
  guests_count integer not null default 1 check (guests_count > 0),
  status text not null check (status in ('booked', 'soon', 'busy', 'finished')),
  type text not null check (type in ('booking', 'seating')),
  created_by uuid references public.employees(id) on delete set null,
  updated_by uuid references public.employees(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reservations_valid_time check (end_time <> start_time)
);

create index if not exists reservations_date_table_idx
  on public.reservations (date, table_id, start_time);

create or replace function public.set_first_employee_as_master()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.employees) then
    new.is_master := true;
  end if;

  return new;
end;
$$;

drop trigger if exists employees_first_master on public.employees;
create trigger employees_first_master
  before insert on public.employees
  for each row
  execute function public.set_first_employee_as_master();

alter table public.employees enable row level security;
alter table public.reservations enable row level security;

drop policy if exists "employees can read employees" on public.employees;
create policy "employees can read employees"
  on public.employees for select
  to authenticated
  using (true);

drop policy if exists "employees can create own profile" on public.employees;
create policy "employees can create own profile"
  on public.employees for insert
  to authenticated
  with check (auth.uid() = auth_user_id);

drop policy if exists "employees can update own profile" on public.employees;
create policy "employees can update own profile"
  on public.employees for update
  to authenticated
  using (auth.uid() = auth_user_id)
  with check (auth.uid() = auth_user_id);

drop policy if exists "employees can read reservations" on public.reservations;
create policy "employees can read reservations"
  on public.reservations for select
  to authenticated
  using (true);

drop policy if exists "employees can create reservations" on public.reservations;
create policy "employees can create reservations"
  on public.reservations for insert
  to authenticated
  with check (true);

drop policy if exists "employees can update reservations" on public.reservations;
create policy "employees can update reservations"
  on public.reservations for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "employees can delete reservations" on public.reservations;
create policy "employees can delete reservations"
  on public.reservations for delete
  to authenticated
  using (true);
