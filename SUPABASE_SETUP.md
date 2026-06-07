# Supabase setup for LAZYBOOK

## 1. Project URL

For the React app use the base project URL:

```env
VITE_SUPABASE_URL=https://rboktgypezurmyyceanr.supabase.co
```

Do not use the REST URL with `/rest/v1/` in `.env.local`.

## 2. Create tables

Open Supabase dashboard:

1. Go to your project.
2. Open `SQL Editor`.
3. Create a new query.
4. Paste the contents of `supabase/schema.sql`.
5. Run the query.

This creates:

- `employees` for staff accounts.
- `reservations` for bookings and walk-in seating.
- Row level security policies.
- A trigger that makes the first registered employee the master account.

## 3. Allow instant login after registration

Because the app uses phone login through a technical email like
`9991234567@redwood.local`, email confirmation must be disabled for this MVP.

In Supabase:

1. Open `Authentication`.
2. Open `Providers`.
3. Open `Email`.
4. Turn off email confirmation / confirm email requirement.

After this, a newly registered employee will be logged in immediately.

## 4. Realtime

For live updates between phones:

1. Open `Database`.
2. Open `Replication` or `Publications`.
3. Enable Realtime for the `reservations` table.

Even without Realtime, the app can still read and write bookings after reload.
