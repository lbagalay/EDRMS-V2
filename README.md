# EDRMS v2 — Electronic Dental Record Management System

Internal, staff-only web application for **Clam-Pasco Dental Clinic**. Manages patient records, appointment scheduling, clinical visits (treatments, prescriptions, vital signs), and billing balances.

This is a ground-up rebuild of the original EDRMS v1 (React/Vite + Express + MySQL), replacing it with a modern, secure, single-codebase Next.js application.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router, TypeScript) |
| Styling | Tailwind CSS |
| UI components | shadcn/ui (Radix primitives) |
| Database | MySQL 8 |
| ORM | Prisma |
| Auth | Auth.js (NextAuth v5) — Credentials provider, database sessions |
| Validation | Zod |
| Notifications | Sonner (toast notifications) |
| Tables | TanStack Table |

---

## Getting started

### 1. Clone and install

```bash
git clone <repo-url>
cd edrms-v2
npm install
```

### 2. Environment variables

Create a `.env` file in the project root with the following:

```
DATABASE_URL="mysql://root:@127.0.0.1:3306/edrms"
ALLOW_PUBLIC_SIGNUP=true
AUTH_SECRET="<stable random 32+ byte secret>"
```

> **AUTH_SECRET** must be a stable value from the environment — do not regenerate it on every server start. Sessions will be invalidated if it changes. Generate one with:
> ```bash
> openssl rand -base64 32
> ```
>
> **ALLOW_PUBLIC_SIGNUP** gates the public `/signup` route, intended only for bootstrapping the first Admin account. Set to `false` (or remove it) once your first Admin exists, since all further accounts should be created via **Manage**.
>
> **DATABASE_URL** above assumes a local MySQL instance with the default `root` user and no password, on the default port `3306`. Adjust to match your actual MySQL credentials/host if different (e.g. production or a teammate's machine).

### 3. Set up the database

Run Prisma migrations against your MySQL instance:

```bash
npx prisma migrate dev
```

To inspect data directly, use Prisma Studio:

```bash
npx prisma studio
```

### 4. Bootstrap the first Admin account

With `ALLOW_PUBLIC_SIGNUP=true`, visit `/signup` and create the first account. After that:

1. Log in
2. Manually promote that account to `ADMIN` role via Prisma Studio (or your database client), since public signup defaults to `STAFF`
3. Set `ALLOW_PUBLIC_SIGNUP=false` going forward — from here on, new staff accounts are created via **Manage** (Admin-only)

### 5. Run the app

```bash
npm run dev
```

The app runs on `http://localhost:3000` by default. If that port is in use, Next.js will automatically pick the next available port (e.g. `3002`) — check your terminal output for the actual URL.

---

## Key features

| Area | Description |
|---|---|
| **Dashboard** | Today's appointments, confirmed/cancelled/scheduled stat cards |
| **Patients** | List, add, and view patient records with demographics, visit history, and outstanding balance |
| **Appointments & Calendar** | Book, edit, confirm/cancel appointments; month-view calendar with per-day booking counts and a patient search/popover |
| **Visits** | Record clinical visits per patient — treatments rendered, prescription, notes, fees — with an automatically computed running balance |
| **Vital Signs** | Record temperature, pulse rate, and blood pressure per visit (a visit may have multiple readings) |
| **Treatments** | Admin-managed catalog of treatments and fees used when recording visits |
| **Manage** | Admin-only staff account management — create accounts, reset passwords, deactivate/reactivate, edit roles |
| **Profile** | Every user can update their own name and birthdate (never exposes password data) |

---

## Roles & access

| Role | Access |
|---|---|
| **Admin** | Full access, including Manage (staff accounts) and the Treatments catalog |
| **Staff** | Patients, appointments, visits, dashboard — cannot access Manage or Treatments |
| **Receptionist** | Appointments and basic patient contact info only — no clinical or billing access |

Role checks are enforced server-side on every protected action via `requireRole()` / `requireSession()` in `lib/authorize.ts`. If a user without sufficient permissions attempts to access a restricted page (e.g. Staff visiting `/treatments`), they are redirected to `/dashboard`.

---

## Project structure

```
edrms-v2/
├── app/
│   ├── (auth)/
│   │   ├── signin/          # login page
│   │   └── signup/          # public signup (bootstrap only, env-gated)
│   ├── (app)/
│   │   ├── layout.tsx        # sidebar nav, mobile menu, auth-guarded
│   │   ├── dashboard/
│   │   ├── patients/
│   │   │   └── [patientId]/
│   │   │       └── visits/[visitId]/   # visit detail + vital signs
│   │   ├── treatments/       # admin-only treatment catalog
│   │   ├── calendar/
│   │   ├── appointments/
│   │   ├── manage/           # admin-only staff account management
│   │   └── profile/
├── lib/
│   ├── auth.ts               # Auth.js configuration
│   ├── authorize.ts          # requireSession / requireRole helpers
│   ├── db.ts                 # Prisma client
│   ├── balance.ts            # visit balance calculation
│   └── validators/           # Zod schemas
├── prisma/
│   └── schema.prisma
```

---

## Known limitations

- **Calendar is month-view only.** The original spec allowed for a month/week toggle, but month-view was deliberately chosen as sufficient for current clinic needs.
- **No automated test suite yet.** Testing (Vitest for balance/validator logic, Playwright for end-to-end flows) has not been implemented.
- **No formal accessibility audit.** Keyboard navigation and color contrast have not been systematically verified against WCAG 2.1 AA.
- **Brand logo assets are placeholders.** The sidebar logo is currently a dashed placeholder box pending the final clinic logo asset.

---

## Troubleshooting

**"Another next dev server is already running"**
A previous `npm run dev` process didn't fully exit. Find and kill it:
```bash
lsof -i :3000 -i :3002
kill -9 <PID>
```

**Login fails silently / redirects to an error page**
Check that the account exists and is active (`npx prisma studio` → `Account` table), and that the password being entered matches what was issued (temp passwords are only shown once, at creation/reset time).

**Port changes unexpectedly**
If port 3000 is in use, Next.js automatically switches to the next available port (e.g. 3002). Always check your terminal's `Ready` output for the actual URL.