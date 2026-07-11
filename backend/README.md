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
