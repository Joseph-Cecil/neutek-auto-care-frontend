# Plan

Phase 0 audit of the clickable prototype and the working trees. No application code was written. Status is awaiting approval in `PROGRESS.md`.

Audit date: 2026-10-25. Prototype path: `neutek-auto-care-frontend/Neutek Auto Care (clickable prototype)/`. App frontend: `neutek-auto-care-frontend` (Next.js, not the prototype). API: `nuetek-auto-care/neutek-api` (the parent directory is spelled `nuetek-auto-care`).

Lint, typecheck, build, and tests were not run in this phase. Commands are in section B. Do not treat the apps as green.

## A. Prototype inventory

Hash router (`#route` or `#route/param`) from `Main.dc.html`. Money is pesewas shown as GHS. The mock clock is `2026-10-24T09:42`. Workshop copy: 14 Spintex Road, Accra. Phone `030 277 4410`. Hours Mon–Fri 07:30–18:00, Sat 08:00–15:00.

Shared chrome for signed-in workshop and portal pages (`nt-core.js`, `nt.css`, `Skeleton.dc.html`):

- Skip link, collapsible sidebar (role-filtered), top bar, search popover, bell, account menu, toast (2.6s), top progress bar, first-visit page skeleton.
- Hover is global CSS, not a per-screen data state.
- First visit to a workshop or portal route shows a skeleton for 750 ms (`list`, `dash`, `detail`, `form`, `cards`). Later visits only run the progress bar (380 ms).
- Async submits set `.btn.loading` for the delays in `NT.ASYNC`.
- Public and auth routes have no page skeleton.
- Dialogs (`Dialogs.dc.html`): scrim, Escape closes, focus moves in and back. Drawer: customer detail, 440px.

### Screens

| Area | Route | File | States actually in the prototype |
|---|---|---|---|
| Marketing home | `#home` | `Marketing.dc.html`, `nt-mk.css` | Default, hover, FAQ open. Loading, empty, error: not shown. Reduced motion disables animation |
| Services | `#services` | `Public.dc.html`, `nt-pub.js` | Default. Empty, loading, error: not shown |
| Book | `#book` | same | Steps, selected service, field error summary, confirm loading, success `BK-2026-015`. Empty catalog: not shown |
| Track | `#track` | same | Default, blank error, not-found copy. Loading: not shown |
| Track result | `#track-job/{id}` | same | Timeline done/current/todo, cancelled and quote-rejected banners. Missing id falls back to `JOB-2026-088`, so not-found is not shown |
| Blog | `#blog` | same | Published posts. Empty, loading, error: not shown |
| Article | `#article/{id}` | same | Default. Missing id is not its own screen. A one-paragraph body is replaced with post `p1` |
| Sign in | `#signin` | `Auth.dc.html` | Field errors, submit loading. Any non-empty password works. Email containing `efua` is admin, `kwame` is technician, anything else is customer Ama. Wrong password: not shown |
| Register | `#register` | same | Field errors, loading, toast, then sign-in. It does not create a persisted account |
| Forgot | `#forgot` | same | Email required, loading, success copy, a button that opens the reset screen |
| Reset | `#reset` | same | Length and match errors, loading, toast, then sign-in |
| Denied | `#denied` | same | Copy only |
| Portal dashboard | `#portal` | `Portal.dc.html`, `nt-cu.js` | Cards, one empty copy when nothing is in the workshop. Other empty branches are empty tags. First-visit cards skeleton. Data is always customer `c1` |
| My jobs | `#my-jobs` | same | Default table. Empty: not shown |
| My job | `#my-job/{id}` | same | Status, notes, diagnostic, timeline, rating form when completed or ready and not yet rated. Missing id falls back to Ama's first job |
| Vehicles | `#vehicles` | same | Cards, add dialog. Empty list: not shown |
| Quotes | `#my-quotes` | same | Table. Empty: not shown |
| Quote | `#my-quote/{id}` | same | Approve confirm, reject reason, expired banner, loading. Missing id falls back |
| Invoices | `#my-invoices` | same | Table. Empty: not shown |
| Invoice | `#my-invoice/{id}` | same | Overdue, pay, pending. Missing id falls back |
| Notifications | `#notifications` | same | Unread, mark all read. Empty: not shown (`has` is unused) |
| Profile | `#profile` | same | Field errors, save loading, "Saved just now". Current password is not checked |
| Dashboard | `#dashboard` | `Workshop1.dc.html`, `nt-ws1.js` | KPI cards, today's bookings, jobs in intake or diagnosing. Several empty branches are unused. Customer and completed counts are literals, not the mock arrays |
| Bookings | `#bookings` | same | Tabs, filters, confirm, cancel with reason, empty "No bookings match", search skeleton |
| Jobs | `#jobs` | same | Filters, empty, new-job button |
| New job | `#job-new` | same | Validation, vehicle select disabled until a customer is chosen, create loading |
| Job | `#job/{id}` | same | Status moves, diagnostic, quote and invoice links, technician select for admin. Missing id falls back to the first job |
| Customers | `#customers` | `Workshop2.dc.html`, `nt-ws2.js` | Search, empty, row opens drawer |
| Quotes | `#quotes` | same | Status tabs and counts, empty per tab |
| Quote | `#quote/{id}` | same | Send draft. Expired flag `isExp` is computed and not rendered |
| Invoices | `#invoices` | same | Tabs, empty |
| Invoice | `#invoice/{id}` | same | Send only if Draft (no draft is seeded). Record payment. PDF banner says files are not generated |
| Payments | `#payments` | same | Table, record payment. Empty: not shown |
| Services admin | `#services-admin` | `Workshop3.dc.html`, `nt-ws3.js` | Edit, deactivate confirm, reactivate. Empty: not shown |
| Fleet | `#fleet` | same | One hardcoded company |
| Fleet account | `#fleet-account/{param}` | same | Title is hardcoded. Param is not read. Add vehicle, add schedule |
| Blog admin | `#blog-admin` | same | All statuses, edit, new |
| Post editor | `#blog-edit/{id}` | same | Required title, save loading |
| Analytics | `#analytics` | same | Week/month, charts, technician filter. Export is a toast, not a file |
| Users | `#users` | same | Deactivate (not yourself), reactivate, invite dialog (toast only) |
| Messages | `#messaging` | `Workshop4.dc.html`, `nt-ws4.js` | Templates, channel toggles, test send toast, delivery log |
| Reminders | `#reminders` | same | Due states, send one, send all, rule checkboxes. "39%" is a literal |
| Inventory | `#inventory` | same | All / low, receive stock, quick restock. Empty on the low tab only |
| Schedule | `#schedule` | same | Week capacity, unassigned jobs, bays 1–4. `canAssign` is unused, so a technician still sees Assign |
| Feedback | `#feedback` | same | Average, reply, feature checkbox. Featured flag does not change the marketing quotes |
| Inspection | `#inspection/{jobId}` | same | Not in the menu. Not-found is shown. Checklist, four placeholder photos, save, send to customer |

### Dialogs and drawer

`status`, `diag`, `cust`, `rec` (record payment), `svc`, `fveh`, `fsched`, `invite`, `veh`, `pay`. Customer pay is full balance only. Staff record-payment allows a partial amount. MoMo stage waits 4.2s then shows paid. Card and bank stay pending. Copy says no real provider is called. VIN is collected and not saved. Drawer has no edit. Empty jobs: "No jobs yet."

### Flows

- Public: marketing home, services, book (guest or signed-in), track by job id or plate, blog, article.
- Auth: sample buttons or the form. Register returns to sign-in. Forgot opens reset. Unknown or forbidden route is `#denied`.
- Customer menu: Dashboard, My jobs, My vehicles, Quotes, Invoices, Notifications, Profile. Approve or reject a sent quote. Pay an open invoice. Rate a completed job.
- Admin menu: Dashboard, Bookings, Jobs, Schedule, Customers, Quotes, Invoices, Payments, Messages, Reminders, Feedback, Services, Fleet, Inventory, Blog, Analytics, Users. Inspection opens from a job.
- Technician menu: Bookings, Jobs, Schedule, plus `#job`, `#job-new`, `#inspection`. Other workshop routes are `#denied`. The technician dropdown on a job is admin-only.

Job moves (`NT.JOB_FLOW`): Intake, Diagnosing, Quote sent, Quote approved, Quote rejected, In progress, Quality check, Ready for pickup, Completed, Cancelled. Completed and Cancelled have no next move.

### Tokens (`nt.css` `:root`)

```
--bg-page:#F4F1EB  --bg-primary:#FFFFFF  --bg-secondary:#F5F1EA
--bg-tertiary:#FAF7F2  --bg-hover:#F8F1E8  --bg-brand:#FFF1E8
--bg-brand-subtle:#FFDCC8  --surface-card:#FFFFFF
--surface-brand:#C2410C  --surface-brand-hover:#9A3412
--text-primary:#1C1917  --text-secondary:#57534E  --text-tertiary:#78716C
--text-on-brand:#FFFFFF  --border-default:#E7E2DA  --border-subtle:#F0EBE3
--border-brand:#9A3412
--bg-success:#ECFDF3  --text-success:#067647
--bg-warning:#FEF9C3  --text-warning:#854D0E
--bg-danger:#FEF2F2  --text-danger:#B42318
--s1:2px --s2:4px --s3:8px --s4:12px --s5:16px --s6:20px --s7:24px --s8:32px --s9:48px
--r1:6px --r2:8px --r3:12px --r4:999px
--shadow:0 8px 24px rgba(28,25,23,.12)
```

Type: Plus Jakarta Sans. Body 14px/1.5. h1 24px/700. Buttons and inputs 40px tall, radius `--r2`. Page max width 1280px. Sidebar 264px, collapsed 72px. Top bar 64px.

Breakpoints: sidebar off-canvas at `max-width: 900px`. Public nav collapses at 800px. Marketing hero stacks at 900px and has no mobile menu. `prefers-reduced-motion` slows the spinner and removes marketing motion.

The live app does not use these tokens. Public pages use a dark shell (`#0A1628` in the public layout) and Inter via `next/font`.

### Loading behavior to reproduce

Progress bar at the top during navigation and async work. Skeletons by page kind on first visit. Button spinner while a submit is in flight. Toast for success. Inline error summary for forms. Empty panels where the prototype has copy. Dialog and drawer. Marketing motion only when reduced-motion is not set.

## B. Current system audit

### Frontend

Next.js 16.2.6, React 19.2.4, App Router, Tailwind CSS v4, shadcn-style Radix primitives, TanStack Query 5, Zustand 5, Axios, react-hook-form, Zod 4. Port 3001. No `middleware.ts`. No `loading.tsx`. Almost every page is `'use client'` and fetches after hydration. Auth stores the user in `sessionStorage` and the access token in memory. Refresh uses the cookie. `socket.io-client` on public tracking. `recharts` on admin analytics. `sonner` toasts. No test runner and no `test` script. `next/image` is unused. Bundle size is unknown. `@next/bundle-analyzer` is not installed.

41 `page.tsx` routes. Groups `(public)`, `(auth)`, `(admin)`, `(portal)` are not in the URL.

Public: `/` redirects to `/home`, `/home`, `/services`, `/booking`, `/tracking`, `/tracking/[jobNumber]`, `/blog`, `/blog/[slug]`.

Auth: `/login`, `/register`, `/forgot-password`, `/reset-password`.

Portal: `/portal/dashboard`, `/jobs`, `/jobs/[id]`, `/vehicles`, `/quotes`, `/quotes/[id]`, `/invoices`, `/invoices/[id]`, `/notifications`, `/profile`.

Admin: `/admin/dashboard`, `/bookings`, `/jobs`, `/jobs/create`, `/jobs/[id]`, `/customers`, `/quotes`, `/quotes/[id]`, `/invoices`, `/invoices/[id]`, `/payments`, `/services`, `/fleet`, `/fleet/[id]`, `/blog`, `/blog/create`, `/blog/[id]`, `/analytics`, `/users`.

There is no page for messages, reminders, feedback, inventory, schedule, or inspection. Diagnostics, quote create, and invoice create exist in the client DAL and are not wired to a page. Admin job create and fleet "add vehicle" take raw UUIDs. Technician nav hides some links. The admin layout still lets a technician open those URLs. `RoleGuard` is unused.

Env names the frontend expects: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`, `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`, `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_ENV`. Sentry and the Paystack public key are not referenced under `src`. Checkout goes through `POST /payments/initialize`.

Commands, from `neutek-auto-care-frontend`:

```text
npm run lint
npm run type-check
npm run build
npm run format:check
```

There is no frontend test command.

### Backend

TypeScript, Express 5.2, Zod 4, `pg`, Redis, BullMQ, Socket.IO with the Redis adapter, JWT, bcrypt, Pino, Prometheus, Sentry, Helmet. Entrypoint `src/server.ts`. `ROLE` is `api`, `worker`, `scheduler`, or `all` (default `all`).

Modules with HTTP routers: auth, users, customers, vehicles, services, bookings, jobs, quotes, invoices, payments, tracking, diagnostics, notifications, blog, fleet, analytics, uploads. Audit has no router. Route table is in `API.md`.

Postgres 16. Raw SQL. Pool min default 2, max default `min(20, cpu*2+1)`, statement timeout 30s. Migrations `001` through `020` are forward-only. Seeds `npm run seed`. Indexes exist for the main list filters, trigram search on names, and a partial outbox index. `audit_logs` is partitioned.

Auth: access JWT (default 15 minutes) and a rotating hashed refresh token in an httpOnly cookie. Roles as in `API.md`. Customer access returns 404 on another customer's id.

Jobs: BullMQ queues email, sms, whatsapp, invoice-pdf, cleanup. Outbox poller every 2s, batch 10, `SKIP LOCKED`. Cron in `Africa/Accra` for partitions, quote expiry, token cleanup, overdue invoices, and optional reminder and follow-up. Email is SMTP. SMS is Hubtel when enabled. WhatsApp is the Graph API when enabled. PDF is PDFKit to S3-compatible storage. Payments are Paystack.

Cache: service catalogue 300s, analytics dashboard 60s. Rate limits exist and are skipped when `NODE_ENV=test`. Global and booking limiters fail open if Redis is down. Pagination is offset, max 100.

Jest `roots` is `tests/` only, so colocated `src/modules/**/*.test.ts` files are not part of `npm test`. What does run: integration auth, bookings, jobs, payments, plus `tests/unit/production-fixes.test.ts`. They need Postgres. Not run in Phase 0.

Commands, from `nuetek-auto-care/neutek-api`:

```text
npm run lint
npm run typecheck
npm run build
npm run test
npm run test:ci
```

Load scripts, not part of `npm test`:

```text
k6 run k6-smoke.js
k6 run k6-load-test.js
```

### Data, infra, tests

See `SCALE.md` and `DEPLOY.md`. Short version: API has Docker, a local compose file, an example Kubernetes manifest, and a CI workflow that builds an image and does not push it. `deploy-backend.yml` is empty. The frontend has no container, no CI, and no deploy file. The workspace root is not a git repository.

Working trees were already dirty before Phase 0. They were not modified by this phase and were not reverted. See `PROGRESS.md`.

## C. Gap analysis

### Visual only

| Item | Exists today? | Change | Risk | Notes |
|---|---|---|---|---|
| Warm token set, Plus Jakarta Sans, 14px body | No. Inter and a dark public shell | Frontend | Med | Shared by every screen. Phase 1 |
| Marketing layout and motion | Partial. `/home` exists with different sections and no token match | Frontend | Med | Two prototype homes. Use `Marketing.dc.html`. See open questions |
| Sidebar, top bar, dialogs, drawer, tables, pills | Partial shadcn shell | Frontend | Med | Do not delete the old shell until each page is moved |
| Skeletons, top progress bar, button spinners, empty copy | Partial. `LoadingSpinner`, `EmptyState`, `ErrorAlert` exist. No `loading.tsx`. Several pages treat errors as empty | Frontend | Low | Phase 3 |

### Behavior of existing features

| Item | Exists today? | Change | Risk | Notes |
|---|---|---|---|---|
| Auth, register, forgot, reset | Yes | Frontend visual. Keep API | High | Do not copy the prototype's "any password works" |
| Bookings confirm and cancel with reason | API and admin list exist | Frontend | Med | Preserve statuses |
| Job status machine | API `POST /jobs/:id/transition` | Frontend | High | Match API transitions. If they differ from `NT.JOB_FLOW`, log it. Do not invent moves |
| Quotes send, approve, reject | API and pages exist. No create page | Frontend, maybe a create screen | High | Create UI is missing in the prototype too. Recommended in open questions |
| Invoices send and pay | Paystack initialize and redirect | Frontend | High | Keep Paystack. Prototype MoMo screens are not a second provider |
| Customers, vehicles, services, blog, fleet, users, analytics | Pages exist, visually different | Frontend | Med | Fleet and job create still ask for UUIDs |
| Public tracking and sockets | Yes | Frontend | Med | Keep REST plus socket |
| Technician route blocking | Nav hide only | Frontend | Med | Enforce the same rules as the API |
| Blog edit loads slug with an id | Bug | Frontend | Med | Fix when that screen is redesigned |
| Profile form does not load phone from the API | Bug | Frontend | Low | Fix with the profile screen |

### Net-new

| Item | Exists today? | Change | Risk | Notes |
|---|---|---|---|---|
| Message template admin and delivery log | Workers exist. No admin API found | All | High | Needs a contract in `API.md` before UI |
| Reminder board | Scheduler only | All | Med | Flag `FEATURE_REMINDER_SCHEDULER` stays off until the feature is ready |
| Feedback and ratings | No module | All | Med | Marketing testimonials stay static until this exists |
| Inventory | No module | All | Med | Not tied to jobs in the prototype |
| Schedule and bays | No module. Job has a technician | All | High | Can disagree with the job technician field. See open questions |
| Inspection checklist | Diagnostics module is a different model | All | High | Do not pretend diagnostics is the checklist |
| Invoice PDF download | Worker exists. Download route not found | Backend and frontend | Med | Prototype says it does not generate files. The API does |
| Analytics CSV | No | All | Low | Prototype is a toast. Defer unless a phase needs it |
| User invite email | No create-user route found | Backend and frontend | Med | Deactivate and list exist |
| Quote and invoice create screens | `POST` exists. No UI | Frontend | Med | Recommended so Send is reachable |

### Scale and deploy

| Item | Exists today? | Change | Risk | Notes |
|---|---|---|---|---|
| Stateless API, Redis adapter, pools, rate limits, queues, health, metrics | Yes, on the API working tree | Hardening | Med | Measure before new pieces. `SCALE.md` |
| Frontend container and CI | No | Infra | Med | Phase 2. Do not deploy |
| Empty `deploy-backend.yml` | File is empty | Infra | Low | Write the workflow. Do not run it against a host |
| Forward-only migrations | Yes | Infra | High | Expand/contract. No down migration |
| 100k proof | k6 scripts exist. Not run | Infra | High | Extrapolation until Phase 10 staging |
| One-command local prod-like stack | API compose only | Infra | Med | Must include the frontend |

## D. Scalability

Full write-up: `SCALE.md`.

Assumed model, not confirmed: 100,000 concurrent sessions, 2,000 rps peak, 400 rps average, 90/10 read/write, 5,000 sockets, read p95 under 300 ms, 5xx under 0.1%. Cost band about 300–900 USD/month is extrapolated and is not a quote. Provider and budget are open questions. No cloud resource is created before "deploy".

## E. Deployment readiness

Full write-up: `DEPLOY.md`.

The API is partly ready (image, CI build, health, shutdown, local compose). The frontend is not. Deploy workflows must be written and left unexecuted. Staging and production happen only in Phase 10.

## F. Risks

- Dirty working trees in both app repos and in the `nuetek-auto-care` wrapper. A later chat must not revert them and must not treat them as a finished redesign.
- Two git histories see the API: the nested `neutek-api` repo and the parent `nuetek-auto-care` repo, which also deletes a Vite app named `neutek-web`. Commits during later phases go to `neutek-auto-care-frontend` and `nuetek-auto-care/neutek-api` unless that open question is answered differently.
- Auth and payments are easy to break with a visual rewrite. Baseline tests are required at the start of each phase. They were not run in Phase 0.
- Job transitions, quote totals, and invoice balances are shared contracts. UI must follow the API. Differences get logged, not patched on a guess.
- Technician authorization is weaker on the frontend than on the API.
- Customer portal in the prototype always shows Ama. The app must keep real ownership checks.
- Prototype not-found screens fall back to sample records. Shipping that would hide real 404s.
- New modules (inventory, schedule, inspection, feedback, templates) are the highest schema risk. They ship as expand-only migrations with API tests.
- `npm test` ignores colocated module tests. A phase that adds tests under `src/` will think they ran. Put them under `tests/` or change Jest roots and record the command.
- No measured baseline for latency or bundle size. Do not claim a regression or a win without a number.

## G. Phases

One phase per approval, unless the command is "proceed all". "proceed all" stops at the end of Phase 9. Verification commands are the ones in section B. Record real output in `PROGRESS.md`.

### Phase 1. Foundation

Goal: design tokens and primitives that match section A, plus a recorded baseline. No screen migration yet.

Deliverables: Tailwind theme mapped from the prototype tokens, Plus Jakarta Sans, focus ring, button, input, banner, pill, toast, and empty primitives. Baseline notes for lint, typecheck, build, and API test.

Areas: `neutek-auto-care-frontend` global CSS and `src/components/ui`. No API change expected.

Tests: frontend has no test runner. Do not add a library in this phase. Record the four frontend commands and the API `npm run test`.

Rollback: revert the phase branch. Tokens are not wired to pages yet, so the running UI stays as it is if the branch is not merged.

Depends on: Phase 0 approval.

Steps:

1. Record the command baseline. If a command is red, fix only what blocks the baseline or report it. Do not start tokens on an unexplained red API test.
2. Add the token theme beside the current theme. Do not delete the current look.
3. Add or align primitives (button, input, banner, pill, empty, toast) to the tokens, with visible focus.
4. Load Plus Jakarta Sans. Keep a fallback stack.
5. Note current build output. Bundle size is unknown until `next build` prints it. Do not install a bundle analyzer unless the build output is insufficient, and flag that library first.
6. Run the section B commands. Record results.

### Phase 2. Deployment readiness foundation

Goal: local production-like stack and CI. Build only. Do not deploy, push images, or create cloud resources.

Deliverables: frontend Dockerfile, compose at a documented path that starts Postgres, Redis, migrate, API, worker, scheduler, and frontend. Frontend CI workflow that runs lint, type-check, and build. API `deploy-backend.yml` either stays empty or gains a workflow that is not triggered. `.env.example` files cover every variable the code reads. Healthchecks on the local stack.

Areas: both repos, plus a compose file. See `DEPLOY.md`.

Tests: `docker compose` config check and a local boot. API `npm run test` still green. No remote host.

Rollback: delete the compose project. No remote state exists.

Depends on: Phase 1.

Steps:

1. Baseline commands.
2. Frontend image builds and serves `next start`.
3. Compose brings up the production-like stack locally, runs migrations, and `/health/ready` returns 200.
4. Frontend CI workflow on pull requests. No registry credentials.
5. Diff env var names against `.env.example`. Add missing names only.
6. Document the one command in `DEPLOY.md`.
7. Run section B commands and the compose boot. Record results.

### Phase 3. Loading system and data-fetching

Goal: one loading, error, and empty pattern used by later screens.

Deliverables: route-level loading where it helps, skeletons for list, dashboard, detail, form, and cards, top progress behavior or a documented equivalent, button pending state, error alerts that are not disguised as empty data, toast on success.

Areas: frontend shared components and the worst current mismatches (analytics error rendered as empty, portal notifications, job history). Fix those call sites because they are incorrect, not because the whole page is being redesigned.

Tests: no new frontend runner. Manual checklist in `PROGRESS.md`. API tests unchanged unless a bug fix needs one.

Rollback: revert the phase branch.

Depends on: Phase 1. Can overlap Phase 2 only if "proceed all" is in effect. Otherwise wait.

Steps:

1. Baseline.
2. Skeleton components for the five kinds.
3. Pending state on submit buttons and a single toast helper.
4. Fix the three "error looks like empty" cases named above.
5. Document the data-fetching convention (query keys, error rendering) in `PLAN.md` only if it is a logged addition, otherwise in `PROGRESS.md` decisions.
6. Run section B commands.

### Phase 4. Backend foundations for scale

Goal: close the gaps in `SCALE.md` that are real code defects, and write the connection budget. No new product features. No cloud.

Deliverables: pool budget written into `SCALE.md` from the compose process count. Scheduler lock released on failure or the TTL behavior documented if a code change is unsafe. A decision, with a measurement or a code citation, on the unlimited reads listed in `SCALE.md`. Rate-limit fail-open called out in `DEPLOY.md`. No new datastore.

Areas: `neutek-api` pool, schedulers, repositories only where a query is unbounded and cheap to cap.

Tests: API `npm run test` plus a focused test for any query or lock change.

Rollback: revert the migration if one is required. Prefer no migration in this phase. If an index is added, it is expand-only.

Depends on: Phase 2, because the production-like compose is the place to count pools. If Phase 2 slipped, this phase still may edit code, and the pool budget stays "not measured".

Steps:

1. Baseline, including `npm run test`.
2. Write the pool budget from compose (process count times `DB_POOL_MAX`).
3. Fix or explicitly defer each unlimited query and the scheduler lock. Deferrals go to `PROGRESS.md`.
4. Do not add a read replica, a second Redis, or cursor pagination without a measurement.
5. Run section B API commands. Record results in `SCALE.md` as measured or as "code review, not a load test".

### Phase 5. Layout and navigation shell

Goal: signed-in shell matches the prototype: sidebar, collapse, mobile off-canvas, top bar, search, bell, account menu, skip link. Role-filtered menus that also block the URL.

Deliverables: admin and portal shells. Technician cannot open finance, catalogue, blog, analytics, or users by typing the URL. Search and bell use real APIs. If staff and customer notifications are the same list, follow the open-question default.

Areas: `src/components/layout`, `src/config/navigation.ts`, admin and portal layouts. Backend only if search or notifications need a query they do not have. Document any new route in `API.md`.

Tests: API tests if a route is added. Frontend manual: keyboard to skip link, sidebar, and menus. Contrast of text on `--surface-brand`.

Rollback: feature-flag or keep the old shell components until the new ones are the only imports, then delete the old ones in this phase only after every layout imports the new shell.

Depends on: Phase 1 and Phase 3.

Steps:

1. Baseline.
2. Shell structure and tokens. Leave page bodies on the old components.
3. Role guards on admin routes that match `API.md`.
4. Wire search and notifications. Log a question if the payload cannot support the prototype.
5. Responsive check at 900px and a desktop width.
6. Section B commands.

### Phase 6. Screen-by-screen redesign

Goal: existing routes match the prototype. Lowest risk first. No new modules.

Order:

1. Auth screens.
2. Public marketing, services, blog, booking, tracking.
3. Portal list and detail screens.
4. Admin operations that already have APIs: bookings, jobs, customers, services.
5. Admin finance: quotes, invoices, payments.
6. Fleet, blog admin, analytics, users.

Each screen: visual match, real data, loading, empty, error, and success. Replace UUID inputs with search-and-pick where the prototype does. Fix blog edit to load by id. Do not delete a page's old components until that page no longer imports them.

Backend: only bug fixes required by the screen. Each one logged, tested, and noted in `API.md` if the contract changes.

Tests: API tests for any contract change. Frontend manual script per area, written into `PROGRESS.md` as it is done.

Rollback: per-screen commits. Revert the commit that broke a flow.

Depends on: Phase 5.

Steps:

1. Baseline.
2. Work the order above. After each area, tick the matching checkbox, update Last action and Next action, and commit.
3. Do not start messages, reminders, inventory, schedule, inspection, or feedback here.
4. Section B commands at the end. A red command blocks "done".

### Phase 7. New features

Goal: prototype features that have no module, as vertical slices.

Order, each slice is migration, API, API tests, UI, then the next slice:

1. Quote create and invoice create screens on the existing `POST` routes, if still missing after Phase 6.
2. Invoice PDF download, if the worker already produces a file and only the route is missing.
3. Inspection checklist, decided against the diagnostics model in the open questions before coding.
4. Feedback and ratings.
5. Reminder board on top of the existing scheduler.
6. Message templates and delivery log.
7. Inventory.
8. Schedule and bays.
9. User invite, if still missing.

Skip a slice if the open question for it is still blocking. Analytics CSV stays deferred unless you say otherwise.

Tests: success, failure, and permission cases for every new route, under `tests/` so `npm test` collects them. Frontend manual for each slice.

Rollback: expand-only migrations. Previous API image must still boot. UI flags or a single commit per slice.

Depends on: Phase 6. Phase 4's query rules apply to new lists (paginated, indexed).

Steps:

1. Baseline.
2. For each slice: contract note in `API.md`, migration, tests, UI, tick, commit.
3. Leave feature flags for reminder and follow-up schedulers off in examples unless the slice is done.
4. Section B commands.

### Phase 8. Performance and scale hardening

Goal: measured per-instance capacity and a written autoscaling policy. No cloud account.

Deliverables: before/after numbers in `SCALE.md` for each optimization. k6 journeys updated to the mix in `SCALE.md`. Local ramp on the Phase 2 stack. Extrapolated instance count. Frontend build size recorded. CDN and autoscaling written as config, not applied.

Tests: k6 locally. Section B commands. A failed threshold is a failed phase, not a footnote.

Rollback: revert the optimization commit. Keep the k6 script.

Depends on: Phase 2 and Phase 7. Screens should be the ones customers will hit.

Steps:

1. Baseline, including one k6 smoke against the local stack.
2. Profile the first bottleneck. Change one thing. Measure again.
3. Repeat until the local per-instance target in `SCALE.md` is met or a blocker is logged.
4. Write the extrapolation and the instance count. Label it extrapolated.
5. Record frontend build output.

### Phase 9. Polish and launch readiness

Goal: status READY TO DEPLOY. Still no remote deploy.

Deliverables: keyboard and contrast pass on the shell and the main flows, responsive pass, reduced-motion check, unused prototype leftovers removed only after imports are gone, dependency audit, authz check against `API.md`, security headers already in `next.config.ts` re-checked, full local regression, local rollback rehearsal (boot, migrate, "deploy" the compose stack, roll back to the previous local image), `DEPLOY.md` rewritten as the runbook, production checklist.

Tests: every command in section B, API `npm run test`, k6 smoke, compose boot.

Rollback: the rehearsal itself.

Depends on: Phase 8.

Steps:

1. Baseline.
2. Accessibility and responsive fixes.
3. Security pass. No new paid scanner without a flag.
4. Local deploy and rollback rehearsal. Record the commands and the output.
5. Finish `DEPLOY.md`.
6. Set status to READY TO DEPLOY and stop. Do not start Phase 10.

### Phase 10. Deployment

Starts only when you say "deploy" and status is READY TO DEPLOY.

Steps are the sequence in `DEPLOY.md`. Pause before each action that spends money or touches production. The full-scale staging load test is the first proof of 100k. Record it in `SCALE.md` as measured.

## H. Open questions

Also copied into `PROGRESS.md`.

| Id | Blocking? | Question | Recommended default |
|---|---|---|---|
| Q1 | No | Confirm the load model in `SCALE.md` (100k sessions, 2,000 rps peak, 5,000 sockets, p95 and error budgets) | Use that model until you change it. Revisit before Phase 8 |
| Q2 | No | Hosting provider and budget. Nothing in the repo names a host. Extrapolated band is about 300–900 USD/month plus vendor usage | Stay provider-agnostic (containers, healthchecks, env vars) until "deploy" |
| Q3 | No | Which git repo receives API commits? Nested `neutek-api` and parent `nuetek-auto-care` both have history | Commit only in `neutek-auto-care-frontend` and `nuetek-auto-care/neutek-api` |
| Q4 | No | Two homepages. `Main.dc.html` shows `Marketing.dc.html`. `Public.dc.html` has a home that does not render | Build the marketing home. Do not build the unused public home |
| Q5 | No | Booking earliest time. Date-step copy says 12:00. Validation uses `2026-10-24T11:42` (clock 09:42 plus two hours). Slots from 08:00 fail that check on that date | Keep the live API's slot rules. If the API has none, earliest bookable time is two hours ahead, and fix the 12:00 sentence to match |
| Q6 | No | Missing ids in the prototype fall back to a sample record | Real 404 or empty state. Do not fall back |
| Q7 | No | Technician Assign on the schedule. `canAssign` is false and unused | Technicians cannot assign |
| Q8 | No | Staff bell shows the same `NT.notifs` as the customer | Bell shows the signed-in user's notifications |
| Q9 | No | Quote and invoice have no create screen, so Send is hard to reach. `POST` already exists | Build the create screens in Phase 7 |
| Q10 | No | Inspection checklist versus the diagnostics module | Do not overload diagnostics. Add a checklist only if you accept a new table. Until then, show diagnostics on the job |
| Q11 | No | Customer pay UI lists MoMo brands. The API uses Paystack | Keep Paystack checkout. Do not add a second payment provider |
| Q12 | No | PDF. Prototype refuses to generate files. API has a PDF worker | Expose download if a file is already produced. Do not build a second PDF stack |
| Q13 | No | Analytics CSV is a toast in the prototype | Defer |
| Q14 | No | Dirty working trees predate Phase 0 | Leave them. Do not revert. Do not mix them into a phase commit without looking at each file |
