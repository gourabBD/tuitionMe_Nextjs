# Tuition Me

A course marketplace — browse tutors, buy a course through Stripe, watch the
lessons, leave a review. Built as a single **Next.js (App Router)** application
in JavaScript: pages, API and authentication all live in one deployable unit.

This replaces an earlier two-service setup (a Create React App client calling a
separate Express server). Collapsing them removed the CORS configuration, the
`/api` rewrite proxy, and the class of failure where the page loaded but every
fetch to the second hostname timed out.

---

## Stack

| Concern     | Choice                                                       |
| ----------- | ------------------------------------------------------------ |
| Framework   | Next.js 16 (App Router, Server Components), React 19          |
| Language    | JavaScript (ESM), JSDoc typedefs in `src/lib/types.js`        |
| Database    | MongoDB Atlas (driver v6)                                     |
| Auth        | Auth.js / NextAuth v5 — credentials (bcrypt) + Google OAuth   |
| Payments    | Stripe Checkout + signed webhook                              |
| UI          | Bootstrap 5 + React-Bootstrap, custom design tokens           |
| Validation  | Zod on every request body and query string                    |

---

## Running locally

```bash
cp .env.example .env.local     # then fill in MONGODB_URI and AUTH_SECRET
npm install
npm run seed                   # optional: populate the course catalogue
npm run dev                    # http://localhost:3000
```

Generate `AUTH_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Google sign-in is optional. Leave `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` blank
and the button simply doesn't render — email/password still works.

Scripts: `npm run dev` · `build` · `start` · `lint` · `seed`.

---

## How it fits together

```
src/
  auth.js                  Auth.js configuration (providers, callbacks, session)
  proxy.js                 Edge routing guard for signed-in-only paths
  instrumentation.js       Runs once per server boot: creates indexes
  app/
    page.js                Home — reads MongoDB directly in a Server Component
    services/              Catalogue + course detail
    manage/[id]/           Instructor lesson editor (owner only)
    api/                   Route handlers (the entire backend)
  components/              Client components: forms, navbar, cards
  lib/
    data.js                Read-side queries, shared by pages and API
    api.js                 Route-handler helpers: auth, CSRF, body limits
    users.js               Credentials accounts (bcrypt)
    validation.js          Zod schemas
    enrollment.js          Idempotent "record a paid enrollment"
```

**Pages read the database directly.** A Server Component calls `lib/data.js`
rather than fetching its own HTTP API — one hop instead of two, and there is no
second hostname that has to be reachable for a page to render.

**The API exists for mutations** and for the few things the browser must fetch
after load. It is same-origin, so the session cookie rides along automatically.

---

## Security

The rebuild closed a set of real holes in the previous version. Each item below
is a behaviour change, not a hardening tweak:

| Previously | Now |
| ---------- | --- |
| Identity was `?email=` in the URL — anyone could pass anyone's address and read their purchased course content | Identity comes from the session cookie only. `?email=` is gone from every endpoint |
| `POST /services` accepted `instructorEmail` from the request body | The owner is taken from the session; the body field is ignored |
| `PATCH` / `DELETE /review/:id` had no ownership check at all — any visitor could edit or delete any review | Ownership is part of the update filter itself, so there is no check-then-write window |
| Reviews carried whatever `name`/`email`/`photoURL` the client sent | Author details come from the session; the course title from the database |
| Payment was confirmed by a client-triggered `GET` | A signature-verified Stripe webhook is authoritative; the client-side confirm is a `POST`, re-reads the session from Stripe, and requires the session to belong to the caller |
| Search interpolated the raw term into `$regex` | The term is escaped before it reaches the query |
| Rate limiting was per-process, which is meaningless across serverless instances | Counters live in MongoDB with a TTL index, so every instance shares one budget |

Also in place:

- **Sessions** — Auth.js JWE cookie: `HttpOnly`, `SameSite=Lax`, `Secure` over
  HTTPS. Not readable from JavaScript, so an XSS bug cannot lift it.
- **Passwords** — bcrypt, cost 12. A login for an unknown address still runs a
  comparison against a dummy hash so response time can't be used to enumerate
  accounts, and every credential failure returns one identical message.
- **CSRF** — `SameSite=Lax` plus an explicit `Origin`-vs-`Host` check on every
  mutating route handler. Auth.js adds its own CSRF token on top for sign-in.
- **Paid content** — access is resolved server-side in one place
  (`resolveCourseAccess`), and locked lesson URLs are never included in the
  page payload at all.
- **Input** — every body and query string goes through Zod. URLs must be
  `http(s)` (blocking stored `javascript:` XSS), bodies are capped at 1 MiB,
  and only YouTube links are ever put inside an iframe.
- **Headers** — CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options: DENY`,
  `Referrer-Policy`, `Permissions-Policy`. Fonts are self-hosted via
  `next/font`, so no third-party origin is needed for styling.
- **Errors** — internal messages never reach the client; a 500 carries only a
  digest that matches a server log line.

### Migrating from the Firebase-era accounts

Authentication now lives in this app's own `users` collection. Anyone who had a
Firebase login signs up again with the same email address — courses, reviews and
enrollments are keyed by email, so their existing data reattaches on first login.

---

## Deployment

### Vercel (current)

Push, or:

```bash
vercel --prod
```

Required environment variables (Production and Preview):
`MONGODB_URI`, `MONGODB_DB`, `AUTH_SECRET`, plus `AUTH_GOOGLE_ID` /
`AUTH_GOOGLE_SECRET` and `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` if you
want Google sign-in and payments. `APP_URL` and `AUTH_URL` are derived
automatically from the deployment host.

The site is always reachable — Vercel functions don't idle down — but they are
serverless, so the first request after a quiet period pays a cold start.

### Always-on container

For a process that truly never restarts between requests, the repo ships a
production `Dockerfile` (Next standalone output, non-root user, `/api/health`
healthcheck) plus:

- `fly.toml` — `min_machines_running = 1`, `auto_stop_machines = false`
- `render.yaml` — `starter` plan (the free plan sleeps after 15 minutes idle)

```bash
docker build -t tuition-me .
docker run -p 3000:3000 --env-file .env.local tuition-me
```

No code changes are needed to move between these targets; set `AUTH_URL` and
`APP_URL` to the public origin and keep `AUTH_TRUST_HOST=true`.

### Stripe webhook

Point a webhook at `https://<host>/api/stripe/webhook` for
`checkout.session.completed` and `checkout.session.async_payment_succeeded`, and
set `STRIPE_WEBHOOK_SECRET`. Locally:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Without the secret the endpoint refuses every request — including forged ones,
which is the point.
