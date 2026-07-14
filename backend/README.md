# Portfolio Backend

Backend API for Shailesh Kale's MERN portfolio + admin dashboard.

## What changed in this refactor

The zip you sent had **two copies of the backend**: a legacy set of folders
at the project root (`controllers/`, `models/`, `routes/`, `middleware/`,
`config/`, `utils/`) and a newer `src/` folder. Only `src/` was actually
wired up — `index.js` and `seed.js` both import exclusively from `src/`, so
the root-level folders were 100% dead code. This refactor **deletes them**
and builds everything on top of `src/`, which already had the right shape.

On top of that cleanup, this refactor adds:

- A **standard response envelope** on every endpoint (see below).
- Centralized **input validation** at the controller layer (missing
  required fields fail fast with a clear message, instead of only relying
  on a Mongoose `ValidationError` from deep inside a `.create()` call).
- A small **structured logger** (`src/utils/logger.js`) with timestamps and
  levels, used by the error handler, request logger, and DB connection.
- A **request logger middleware** so every request's method/path/status/
  duration shows up in the logs — useful for debugging in production.
- **Indexes** on every model matching the actual sort/filter patterns each
  service uses, instead of relying only on the default `_id` index.
- **JSDoc** on every exported function, plus `@route`/`@access` comments on
  every controller handler and route file.

The generic CRUD services and the generic-controller-factory pattern for
the seven simple content types (Achievement, Certification, Experience,
Project, Skill, Stat, Testimonial) were already a good idea in the original
code, so this refactor keeps that pattern rather than expanding it into
nine near-identical files.

## Folder structure

```
src/
  app.js              Express app setup: middleware, route mounting, error handling
  config/
    db.js             MongoDB connection
  routes/              Only endpoint definitions + middleware wiring — no logic
  controllers/          Validate input -> call service -> return standard response
  services/             Business logic, no knowledge of req/res (reusable, testable)
  models/                Mongoose schemas + indexes only
  middlewares/           authMiddleware, errorMiddleware, requestLogger
  utils/                 AppError, asyncHandler, ApiResponse, validators, logger, generateToken
index.js               Entry point: loads env, connects DB, starts server (or exports for Vercel)
seed.js                 One-off script to seed an admin user + real portfolio content
```

## Standard API response format

Every endpoint returns one of these two shapes — the frontend never has to
guess per-route:

**Success**
```json
{
  "success": true,
  "message": "Project fetched successfully",
  "data": { "...": "..." }
}
```

**Error**
```json
{
  "success": false,
  "message": "Missing required field(s): title, slug",
  "error": {}
}
```
(`error.stack` is included outside production for debugging, and omitted in
production.)

## Request flow (how a request is handled)

```
routes/*.js
  -> middlewares/authMiddleware.js  (protect, authorize — only on writes)
  -> controllers/*.js               (validate input, call service, send ApiResponse)
    -> services/*.js                (business logic, DB calls via models)
      -> models/*.js                (schema validation, indexes)
  -> middlewares/errorMiddleware.js (any thrown error lands here -> standard error envelope)
```

## Adding a new simple CRUD resource

Because of the generic controller/service factories, adding a new
"Achievement-shaped" resource is 3 files, not 5+:

1. `models/Thing.js` — schema + indexes.
2. `services/thingService.js` — one line: `export default crudService(Thing, { sortBy: "order" });`
3. `controllers/thingController.js` — one line:
   ```js
   export default genericController(thingService, {
     resourceName: "Thing",
     requiredFieldsOnCreate: ["name"],
   });
   ```
4. `routes/thingRoutes.js` — copy any existing route file (e.g.
   `skillRoutes.js`) and rename.
5. Mount it in `app.js`: `app.use("/api/things", thingRoutes);`

Resources with custom logic (auth, contact messages) skip the generic
factory and write their own controller/service — see `authController.js` /
`authService.js` and `messageController.js` / `messageService.js` as the
pattern to follow.

## Environment variables

See `.env.example`. Copy it to `.env` and fill in real values — `.env` is
gitignored and should never be committed.

## Running locally

```bash
npm install
npm run dev      # nodemon, auto-restarts on change
npm run seed      # populates the DB with an admin user + real portfolio content
npm start          # production start
```

## Security note (unchanged from before, flagged for visibility)

`POST /api/auth/register` is intentionally public so the first admin
account can be created without any existing auth. Once that first admin
exists, consider disabling or protecting this route — it currently lets
anyone create an account. This wasn't changed in the refactor since it's a
behavioral/security decision rather than a code-quality one, but it's
called out in a comment in both `authRoutes.js` and `authService.js`.

## Admin Dashboard backend (added)

Everything below was added on top of the existing architecture — no
existing route, controller, service, or model behavior was changed except
where explicitly noted. Same patterns throughout: routes only wire
paths → controllers validate + call a service → services hold the actual
logic → `ApiResponse.success` / thrown `AppError` for every response.

### New collections

| Model | Purpose |
|---|---|
| `AnalyticsEvent` | Unified pageview + engagement-event log (Analytics + Portfolio Analytics sections) |
| `LinkedProject` | External websites/projects connected under "Project Integration" |
| `Notification` | In-app alerts for the dashboard's notification bell |
| `IntegrationCache` | Last-synced GitHub/LeetCode snapshot (refreshed by cron) |
| `Message` (existing, extended) | Added `emailStatus: { adminNotified, autoReplySent }` |

### New endpoints

```
POST   /api/analytics/track            Public   Record a pageview or engagement event
GET    /api/analytics/summary          Private  Visitors, growth, top pages, country/device/
                                                  browser breakdowns, referrers, portfolio events

GET    /api/messages?search=&read=     Private  (existing route, now supports filtering)
GET    /api/messages/export            Private  CSV export (same search/read filters)

GET    /api/linked-projects            Private  List connected projects
POST   /api/linked-projects            Private  Connect a new project
POST   /api/linked-projects/:id/sync   Private  Pull live stats from that project's analyticsEndpoint
PUT    /api/linked-projects/:id        Private  Update / enable / disable
DELETE /api/linked-projects/:id        Private  Remove

GET    /api/integrations/github        Private  Profile, repos, languages, contributions (cached)
GET    /api/integrations/leetcode      Private  Solved counts, contest rank, streak (cached)
POST   /api/integrations/sync          Private* Force-refresh GitHub/LeetCode cache + all linked projects

GET    /api/notifications              Private  List (?unread=true to filter)
GET    /api/notifications/unread-count Private  Badge count
PATCH  /api/notifications/:id/read     Private  Mark one read
PATCH  /api/notifications/read-all     Private  Mark all read
DELETE /api/notifications/:id          Private  Delete

GET    /api/dashboard/summary          Private  One-call aggregate for the overview cards
```
`Private` = `protect` + `authorize("admin", "editor")`, same as every existing
private route. `*POST /api/integrations/sync` additionally accepts an
`x-cron-secret` header matching `CRON_SECRET`, so an external scheduler
(Vercel Cron, GitHub Actions, etc.) can trigger it without an admin JWT —
see `authMiddleware.allowAdminOrCronSecret`.

### How the pieces fit together

- **Visitor tracking** — the public frontend calls `POST /api/analytics/track`
  on every route change (`type: "pageview"`) and on key interactions
  (`type: "event"`, e.g. `resume_download`, `project_click`). Device/browser
  are parsed server-side from the User-Agent; country prefers Vercel's
  `x-vercel-ip-country` edge header, falling back to whatever the client
  sends (there's no bundled GeoIP database).
- **Contact form email** — `messageService.createMessage` now fires an admin
  alert + visitor auto-reply via `mailService` (nodemailer) and creates a
  `new_message` notification, all as non-blocking side effects — a
  submission still succeeds even if SMTP isn't configured or fails.
- **Linked project credentials** — `LinkedProject.apiKey` is encrypted at
  rest (AES-256-GCM, `utils/crypto.js`) and excluded from default reads
  (`select: false`); only `linkedProjectService.sync()` decrypts it.
- **GitHub/LeetCode** — fetched live on first request, then cached in
  `IntegrationCache` and refreshed by `src/cron/integrationSync.cron.js`,
  either on an hourly in-process schedule (`node-cron`, non-serverless
  deployments only) or via `POST /api/integrations/sync` on serverless
  ones. To wire up Vercel Cron: add a `crons` entry in `vercel.json`
  hitting `/api/integrations/sync` with an `x-cron-secret` header (Vercel
  Cron doesn't support custom headers directly — use a query param variant
  or a thin wrapper route if needed) and set `CRON_SECRET` in your project's
  environment variables.
- **Milestone/failure notifications** — `analyticsService` raises a
  `visitor_milestone` notification when unique visitors cross fixed
  thresholds (100, 500, 1000, ...); integration/link-project sync failures
  raise `integration_failed` notifications automatically.

### New environment variables

See the bottom of `.env.example` — SMTP settings + `ADMIN_EMAIL` (email),
`ENCRYPTION_KEY` (linked-project credential encryption), `GITHUB_USERNAME`
/ `GITHUB_TOKEN`, `LEETCODE_USERNAME`, `INTEGRATION_SYNC_CRON`, and
`CRON_SECRET`.

### New dependencies

`nodemailer` (contact-form email) and `node-cron` (integration sync
scheduling) — run `npm install` after pulling this in. Also requires
**Node 18+** (the integration services use the native `fetch` and
`AbortSignal.timeout`, no `axios`/`node-fetch` needed).

### Not included in this pass

Scoped to the backend API only, per the request. The admin frontend
(animated login page, dashboard UI, charts, notification bell, linked-
project management screen, etc.) and a Postman collection are not part of
this change — happy to build those next if useful.
