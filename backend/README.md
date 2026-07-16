# AI for Bharat — Backend API

A small Express backend for the AI for Bharat frontend. It provides:

- **Auth** — signup/login with JWT + bcrypt password hashing.
- **User profile & saved schemes** — per-user data behind auth.
- **Government Schemes** — a live-data pipeline that fetches real scheme information from
  Government of India sources and serves it over a clean REST API, with automatic caching
  and graceful fallback so the app never breaks if a government source is slow, down, or
  changes its response shape.

## Where the scheme data actually comes from

1. **`myScheme` (myscheme.gov.in)** — the national scheme-discovery platform run by MeitY/NeGD.
   This backend calls the public search endpoint the myscheme.gov.in website itself uses
   (`MYSCHEME_API_BASE`, default `https://api.myscheme.gov.in/search/v5`). **This is not an
   officially documented/versioned API** — it's the same endpoint the public website calls,
   so it can rate-limit, change its response fields, or go down without notice. The service
   reads several possible field names defensively and skips anything it can't parse.
2. **`data.gov.in`** (Open Government Data Platform India) — the official, documented,
   API-key-based platform for Ministry-published datasets. To pull in real datasets:
   - Register a free API key at https://data.gov.in (Sign Up → My Account → API key) and put
     it in `DATA_GOV_IN_API_KEY`.
   - Find a scheme/benefit dataset you want (search data.gov.in), open its API docs section,
     and copy its **resource id** into `DATA_GOV_IN_RESOURCE_IDS` (comma-separated for more
     than one). Each dataset has its own columns, so `schemeSource.service.js` maps a set of
     common column names (`scheme_name`, `description`, `ministry`, `eligibility`, `benefit`,
     ...) and otherwise keeps the raw row so nothing is silently dropped — you may want to
     add a resource-specific mapping if a dataset's columns don't match.
3. **Bundled seed set** — 10 well-known, manually verified central schemes (PM-KISAN, PM-JAY,
   NSP, PMMY, PMAY, PMKVY, BBBP, PMFBY, Stand-Up India, APY) always included as a reliable
   baseline, so the app is useful even with zero network access.

All three are merged, deduplicated, cached (in-memory + a JSON file on disk so a restart
doesn't lose the last good fetch), and refreshed on a schedule (`SCHEMES_REFRESH_CRON`,
default: daily at 03:15). If every live source fails, the API automatically serves the last
good cache, and if there's no cache yet, the seed set — the response's `meta.sources` block
always tells you exactly what happened (counts and errors per source) so this is never hidden
from you.

## Setup

```bash
cd server
cp .env.example .env      # then edit values, especially JWT_SECRET
npm install
npm run dev                # http://localhost:4000
```

Force a live refresh from the CLI (useful for checking your API key/resource ids without
starting the server):

```bash
npm run seed:refresh
```

## API overview

| Method | Path                          | Auth | Description |
|--------|-------------------------------|------|--------------|
| GET    | `/health`                     | –    | Liveness check |
| POST   | `/api/auth/signup`            | –    | `{ name, email, password }` → `{ token, user }` |
| POST   | `/api/auth/login`              | –    | `{ email, password }` → `{ token, user }` |
| GET    | `/api/auth/me`                 | ✅   | Current user |
| GET    | `/api/user/profile`            | ✅   | Get student profile |
| PUT    | `/api/user/profile`            | ✅   | Upsert student profile |
| GET    | `/api/schemes`                 | –    | `?category=&q=&state=` filters |
| GET    | `/api/schemes/:id`              | –    | Single scheme |
| GET    | `/api/schemes/categories`       | –    | Counts per category |
| GET    | `/api/schemes/meta`             | –    | Data-source status (counts/errors, last refresh time) |
| POST   | `/api/schemes/refresh`          | –    | Force an immediate live refresh |
| GET    | `/api/schemes/saved`            | ✅   | Current user's saved scheme ids |
| POST   | `/api/schemes/saved`            | ✅   | `{ schemeId }` — save a scheme |
| DELETE | `/api/schemes/saved/:schemeId`  | ✅   | Un-save a scheme |
| POST   | `/api/eligibility/check`        | –    | `{ occupation, income, age }` → `{ eligible[], ineligible[] }` |

Send the JWT as `Authorization: Bearer <token>` on protected routes.

## Storage

User accounts, profiles, and saved schemes are stored in small JSON files under `src/data/`
(via `utils/jsonStore.js`) rather than a native database — this keeps `npm install` free of
any C++ build step (a common source of setup failures for `better-sqlite3`/similar on
students' machines). Swap `jsonStore.js` for a real database client in production; every
controller only talks to the small `create/get/find/upsert/remove` interface it exposes.
