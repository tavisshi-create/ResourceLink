# ResourceLink

A two-sided marketplace for sharing underutilized medical/research equipment
between institutions. Frontend is React + Vite + Tailwind; backend is an
ASP.NET Core Web API backed by Supabase (Postgres).

## Project layout

```
.
├── src/                  # Frontend (Vite + React + TypeScript)
│   ├── App.tsx             # Public marketing/landing page
│   ├── Root.tsx             # Landing <-> app switcher
│   ├── Provider/            # Provider ("I have equipment") dashboard
│   ├── receiver/            # Renter ("I need equipment") dashboard
│   └── lib/api.ts           # Shared fetch helper the dashboards use
├── ktr-back/              # Backend (.NET 10 Web API)
│   ├── Controllers/         # Generic CRUD controllers per resource
│   ├── Models/               # Supabase table models
│   ├── Services/              # Generic Supabase CRUD service
│   └── Program.cs             # App startup, CORS, Supabase client wiring
└── public/                # Static assets served as-is
```

## Running locally

### 1. Backend (`ktr-back/`)

The API talks to Supabase, so it needs credentials. **Never put real
credentials in `appsettings.json`** - use `dotnet user-secrets` (or
environment variables) instead:

```bash
cd ktr-back
dotnet user-secrets init
dotnet user-secrets set "Supabase:Url" "https://<your-project-ref>.supabase.co"
dotnet user-secrets set "Supabase:Key" "<anon-or-service-key>"
dotnet run
```

The API listens on `http://localhost:5072` by default (see
`Properties/launchSettings.json`). If Supabase isn't configured yet, the
app still starts (so you can see the warning), but every data endpoint
will fail - check `GET /api/health` to confirm whether it's configured.

### 2. Frontend (repo root)

```bash
npm install
npm run dev
```

Vite proxies any request to `/api/*` straight to `http://localhost:5072`
(see `vite.config.ts`), so with both processes running the dashboards will
load live data. If the backend is unreachable or returns an error, each
dashboard quietly falls back to its built-in mock data - check the browser
console for a `[api] falling back to mock data for ...` message if things
look stale.

If you ever need to point the frontend at a backend that isn't on
`localhost:5072` (e.g. a deployed API with no dev proxy), set
`VITE_API_URL` in a `.env` file at the repo root.

## Notes on this cleanup

- The provider/renter dashboards were calling `/api/ResourceAllocation`
  (singular), but the backend only exposes `/api/ResourceAllocations`
  (plural - it's generated from the `ResourceAllocationsController` class
  name). That mismatch 404'd on every request, which is why both
  dashboards looked "disconnected" and silently showed mock data.
- `Supabase:Url` / `Supabase:Key` were never actually set anywhere (no
  `Supabase` section existed in `appsettings.json`), so even once the
  route was fixed, real Supabase calls would fail. The backend now logs a
  clear startup warning when they're missing, and `appsettings.json` had
  the previously-committed Supabase Postgres password removed - treat
  that password as compromised and rotate it in the Supabase dashboard,
  since it's still present in this repo's git history.
- Build output (`bin/`, `obj/`, `.vs/`) was committed to the repo; it's
  now untracked and ignored.
