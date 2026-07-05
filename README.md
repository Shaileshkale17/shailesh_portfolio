# Shailesh Kale — MERN Portfolio + Admin Dashboard

A production-ready MERN stack implementation of the Portfolio Design System PDF you provided:
a public React portfolio site, a Node/Express/MongoDB API, and a separate React admin dashboard
for managing all content (projects, experience, skills, testimonials, and contact messages)
without touching code.

## What's included

| Folder | What it is | Port |
|---|---|---|
| `backend/` | Express + MongoDB REST API, JWT auth, seed script | 5000 |
| `frontend/` | Public portfolio site — React + Tailwind + GSAP | 5173 |
| `admin/` | Admin dashboard — React + Tailwind, protected by login | 5174 |

All three are independent apps that talk over HTTP — this mirrors how the design doc's own
`data/`-driven, CMS-ready architecture was described, except the "CMS" here is a real database
and a real dashboard instead of hardcoded `data/*.ts` files.

## Quick start

You'll need Node.js 18+ and a MongoDB instance (local `mongod`, or a free MongoDB Atlas cluster).

### 1. Backend

```bash
cd backend
cp .env.example .env        # then edit MONGO_URI and JWT_SECRET
npm install
npm run seed                # creates an admin user + seeds real content
npm run dev                 # starts on http://localhost:5000
```

The seed script prints the admin login it created (or set `SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD` in `.env` before seeding to choose your own). **Change that password
after your first login** — there's no separate "change password" endpoint yet, so for now do
it via `PUT /api/auth/me` you add, or update it directly in MongoDB.

### 2. Public portfolio site

```bash
cd frontend
cp .env.example .env         # points at the backend URL
npm install
npm run dev                  # http://localhost:5173
```

Every section (`Impact`, `Skills`, `Experience`, `Projects`, `Testimonials`) fetches from the
API on mount and falls back to sensible hardcoded content if the API is unreachable, so the site
never shows an empty page while you're getting the backend running.

### 3. Admin dashboard

```bash
cd admin
cp .env.example .env
npm install
npm run dev                  # http://localhost:5174
```

Log in with the admin credentials from the seed step. From there you can create/edit/delete
projects, experience entries, skills, and testimonials, and read/manage contact-form messages —
all of it reflected on the public site the next time a visitor loads it (or immediately, if
you're testing with two tabs open).

## What this build implements vs. the full design doc

The design PDF specifies an extremely large surface area (25 GSAP motion patterns, a command
palette, live GitHub/LeetCode integrations, a 3D hero, Barba.js page transitions, blog/case-study
routes, etc.). To keep this deliverable actually working end-to-end rather than a pile of
half-wired stubs, this build focuses on:

**Implemented**
- Full design-token color/typography system (dark + light themes, CSS variables, Tailwind mapped to them)
- Preloader → hero entrance timeline, scroll-aware navbar, section-reveal-on-scroll (batched), animated stat counters, SVG timeline line-draw, magnetic buttons, project-card hover lift, custom cursor + hover-scale spotlight (disabled on touch and `prefers-reduced-motion`) — all via `gsap.context()` scoped to components for clean unmount
- `prefers-reduced-motion` respected globally
- Full REST API with JWT auth + role checks, Mongoose models for every content type in the doc (projects, experience, skills, testimonials, achievements, certifications, stats, messages)
- Complete admin dashboard: login, protected routes, generic CRUD manager reused across resource types (Projects, Experience, Skills, Achievements, Certifications, Testimonials), contact-message inbox
- Public "Achievements & Certifications" section on the site, matching design doc sections 11 & 13
- Seed script populated with your real bio/experience/project content pulled from the HTML you uploaded

**Intentionally stubbed / left as next steps** (noted so nothing is presented as done when it isn't)
- Command palette (⌘K), live GitHub contribution graph, LeetCode stats strip, terminal easter-egg, 3D hero (React Three Fiber/Spline), Barba.js route transitions, dedicated case-study/blog routes — the architecture (separate `sections/` components, typed data flowing from a real API) supports adding these incrementally without restructuring anything
- 3D tilt on project cards (the GSAP pattern used for magnetic buttons/cursor extends directly if you want it)

## Folder structure (per app)

```
backend/
  config/db.js
  models/            # User, Project, Experience, Skill, Testimonial, Achievement, Certification, Message, Stat
  controllers/        # crudFactory.js is reused by most resources
  routes/
  middleware/         # auth (JWT verify + role check), error handler
  seed.js

frontend/
  src/
    animations/        # gsapConfig.js, revealTimeline.js — shared motion factories
    components/ui/      # Button (magnetic), Chip, Card, SectionHeading
    components/layout/  # Navbar, Footer, Loader
    components/sections/# Hero, About, Impact, Skills, Experience, Projects, Testimonials, Contact
    context/ThemeContext.jsx
    lib/api.js

admin/
  src/
    components/ResourceManager.jsx   # generic list+form+delete, driven by a field config
    pages/                            # thin config files: Projects.jsx, Experience.jsx, Skills.jsx, Testimonials.jsx, Messages.jsx, Overview.jsx
    context/AuthContext.jsx
```

## Security notes before deploying

- `POST /api/auth/register` is open in this build so you can create the first admin easily —
  remove or protect it once your admin account exists.
- Set a long random `JWT_SECRET` in production and never commit `.env` files.
- Add HTTPS + `secure`/`sameSite` cookie flags if you switch from `Authorization: Bearer` headers
  to httpOnly cookies for the admin dashboard.
