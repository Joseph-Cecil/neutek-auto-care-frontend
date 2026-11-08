# Progress

## Current

- Phase: 9. Launch readiness
- Step: finished
- Status: READY TO DEPLOY
- Branch: frontend `redesign/phase-9-launch` at `45840eb`. API `redesign/phase-9-launch` at `4439293`.
- Last action: Local-prod boot, k6 smoke, and rollback rehearsal recorded in `DEPLOY.md`. Section B is green except the deferred `format:check`. Nothing was deployed.
- Next action: Stop. Phase 10 starts only when the user says "deploy".

`npm run format:check` is exit 1 on 201 files. That set was already unformatted, including the clickable prototype. It was not reformatted.

## Checklist

### Phase 0. Analysis and planning

- [x] Prototype inventory
- [x] Current system audit
- [x] Gap analysis
- [x] Scalability assessment
- [x] Deployment assessment
- [x] Risks and phases
- [x] Open questions
- [x] Workflow rule
- [x] Approval (2026-10-25, command "proceed"; Q1–Q14 defaults accepted)

### Phase 1. Foundation

- [x] Record baseline commands
- [x] Token theme beside the current theme
- [x] Primitives aligned to tokens, with visible focus
- [x] Plus Jakarta Sans
- [x] Record build output
- [x] Section B commands green

### Phase 2. Deployment readiness foundation

- [x] Baseline
- [x] Frontend image
- [x] Local production-like compose, migrate, `/health/ready` 200
- [x] Frontend CI, no registry push
- [x] `.env.example` names match code
- [x] One-command note in `DEPLOY.md`
- [x] Commands and compose boot recorded

### Phase 3. Loading system

- [x] Baseline
- [x] Five skeleton kinds
- [x] Button pending state and toast helper
- [x] Analytics, portal notifications, and job history no longer show errors as empty
- [x] Data-fetching convention noted
- [x] Section B commands green

### Phase 4. Backend foundations for scale

- [x] Baseline including API tests
- [x] Pool budget written in `SCALE.md`
- [x] Unlimited queries and scheduler lock fixed or explicitly deferred
- [x] No new datastore without a measurement
- [x] Results recorded as code review or measured, never as a load test unless k6 ran

### Phase 5. Shell

- [x] Baseline
- [x] Sidebar, top bar, search, bell, account, skip link
- [x] Technician URL guards match the API
- [x] Search and notifications use real APIs
- [x] Check at desktop width and at 900px
- [x] Section B commands green

### Phase 6. Existing screens

- [x] Baseline
- [x] Auth
- [x] Public marketing, services, blog, booking, tracking
- [x] Portal
- [x] Admin operations
- [x] Admin finance
- [x] Fleet, blog admin, analytics, users
- [x] Section B commands green

### Phase 7. New features

- [x] Baseline
- [x] Quote and invoice create, if still missing
- [x] Invoice PDF download, if the file already exists
- [x] Inspection, only after Q10 is accepted
- [x] Feedback and ratings
- [x] Reminder board
- [x] Message templates and delivery log
- [x] Inventory
- [x] Schedule and bays
- [x] User invite, if still missing
- [x] Section B commands green

### Phase 8. Scale hardening

- [x] Baseline and local k6 smoke
- [x] Measure, change, measure again until the per-instance target is met or a blocker is logged
- [x] Extrapolated instance count in `SCALE.md`
- [x] Autoscaling and CDN written, not applied
- [x] Frontend build size recorded
- [x] Section B commands green

### Phase 9. Launch readiness

- [x] Baseline
- [x] Accessibility and responsive pass
- [x] Security pass
- [x] Local deploy and rollback rehearsal
- [x] `DEPLOY.md` is the runbook
- [x] Status set to READY TO DEPLOY

### Phase 10. Deployment

- [ ] Not started. Requires the word "deploy" and status READY TO DEPLOY

## Decisions

| Date | Decision | Reason |
|---|---|---|
| 2026-10-25 | Phase 0 writes plans only | Bootstrap rule in `prompt.md` |
| 2026-10-25 | Audit describes the working trees, not a clean commit | Both app repos and the wrapper repo already had uncommitted work |
| 2026-10-25 | Pre-existing uncommitted work stays | It was not produced by this phase. Reverting it would destroy work that was not reviewed line by line. Q14 |
| 2026-10-25 | State files live at the workspace root `docs/redesign/` | The root is the only place that sees both the frontend repo and the API repo |
| 2026-10-25 | No test or build result is recorded as a pass | Those commands were not run |
| 2026-10-25 | "proceed" approves the plan and Q1–Q14 defaults | No blocking questions. Defaults are in `PLAN.md` section H |
| 2026-10-25 | Phase 1 tokens are opt-in (`.nt`, `NtButton`, `NtInput`, `Banner`, `Pill`, `NtEmpty`, `NtToaster`) | Putting them on the existing semantic colors would restyle every current screen. `/design-foundation` is the only page that uses them |
| 2026-10-25 | `npm run lint` in the frontend runs `eslint .` | `next lint` on Next 16.2.6 treats `lint` as a project directory and exits 1 |
| 2026-10-25 | Pre-existing typecheck, build, and the Paystack webhook test failure are not fixed in Phase 1 | They are outside the foundation file list. Fixing them would start screen and payment work early |
| 2026-10-25 | The recorded red baseline is fixed after the user asked to fix it | Frontend type and lint errors are committed on `redesign/phase-1-foundation`. The webhook early-return stays uncommitted because `payments.service.ts` already had a large unrelated diff |
| 2026-10-25 | Repo-wide `format:check` is deferred | It fails on 200 already-unformatted files, including the prototype. Formatting them is not the baseline that was red |
| 2026-10-25 | Local production-like stack sets `ALLOW_INSECURE_BOOT=true` | `NODE_ENV=production` rejects localhost origins and empty Sentry, Paystack, SMTP, and storage settings. This stack uses none of those paid services |
| 2026-10-25 | Published ports are 13000 and 13001 | The dev servers already use 3000 and 3001. Postgres and Redis are not published |
| 2026-10-25 | `deploy-backend.yml` stays empty | An empty workflow cannot trigger a deploy. The plan allows that |
| 2026-10-25 | The existing dev compose file was not edited | Phase 2 adds `docker/docker-compose.local-prod.yml`. The dev file already had unrelated uncommitted changes |
| 2026-10-25 | API `.env.example` commit is the missing names only | `SMS_ENABLED`, `WHATSAPP_ENABLED`, and `METRICS_TOKEN` were already edited in the working tree and are read by `environment.ts` |
| 2026-10-25 | Phase 3 loading pieces are opt-in | Skeletons, `TopProgress`, and `notify()` are for later screens. No route `loading.tsx`, because these pages fetch after hydration and public routes have no skeleton |
| 2026-10-25 | `dashboard` is the prototype skeleton kind `dash` | The five kinds are `list`, `dashboard`, `detail`, `form`, `cards` |
| 2026-10-25 | The API was not changed in Phase 3 | The three empty-on-error screens could be fixed from `isError` on the client |
| 2026-10-25 | Portal dashboard notifications card is part of the notifications fix | The notifications page list already used `ErrorAlert`. Its subtitle and the dashboard card still said the customer was caught up when the fetch failed |
| 2026-10-25 | Phase 4 is API-only | The frontend stays on `redesign/phase-3-loading`. No new API route, so `API.md` is unchanged |
| 2026-10-25 | The scheduler lock is deleted only when the job throws | A successful run keeps `scheduler:lock:<name>` until the TTL so a second replica does not repeat it. A killed process still waits for the TTL. The known jobs are one transaction, `CREATE TABLE IF NOT EXISTS`, an idempotent `UPDATE`, or an enqueue |
| 2026-10-25 | Unlimited reads stay uncapped | A silent `LIMIT` would drop the newest job transitions, hide vehicles or photos, or skip reminder customers. The overdue list is not the live cron. Several of those files are already dirty and were not edited |
| 2026-10-25 | Pool budget is counted from compose, not measured | Local-prod steady state is api 5 + worker 2 + scheduler 2 = 9. Migrate uses 5 and exits first. Postgres `max_connections` was not queried |
| 2026-10-25 | `rate-limiter.ts` was not committed | Fail-open for global and booking is already on the committed tree. The only uncommitted diff is `trackingRateLimiter`, which fails closed |
| 2026-10-25 | Technician workshop URLs are bookings and jobs only | The nav already hid the rest. The prototype denies every other workshop route. Typed URLs now show "You do not have access to this page." Dashboard and customers are included even though the API would return customer rows to a technician |
| 2026-10-25 | A technician signs in to `/admin/jobs` | `/admin/dashboard` is not on the technician menu, so landing there would only show the denied page |
| 2026-10-25 | The bell is the signed-in user's notifications | Q8 default. There is still no separate staff feed. A click opens the job when `metadata.jobId` is set, otherwise `/portal/notifications` |
| 2026-10-25 | Shell search uses list endpoints | Admin search includes `GET /customers?search=`. Everyone searches `GET /jobs?search=` and `GET /vehicles?search=`. A customer does not call the staff customer list. Staff vehicle results open `/admin/jobs` because there is no vehicle page |
| 2026-10-25 | The staff account menu is sign out only | The prototype shows Profile only for a customer. The old admin header linked to the portal profile |
| 2026-10-25 | The jobs sidebar badge is not shown | Pending bookings use `GET /bookings?status=pending` total. There is no active-jobs filter, so a jobs count would be wrong |
| 2026-10-25 | `jobs.service.ts` commit is the search argument only | The file already had an unrelated diff. That diff was left unstaged |
| 2026-10-25 | Service deactivate sends `isActive` | The services table and repository already stored it. The update schema dropped the field, so the new deactivate button could not stick |
| 2026-10-25 | Booking cancel requires a reason | The bookings table already had `cancellation_reason`. The admin screen collects it, and `POST /bookings/:id/cancel` now stores it. A cancel with no body is 400 |
| 2026-10-25 | Quote and invoice send stay in the dirty API tree | The screens call `POST /quotes/:id/send` and `POST /invoices/:id/send`. Those handlers use the uncommitted outbox. They were not committed |
| 2026-10-25 | Checkout reads both payment URL shapes | `useInitializePayment` accepts `authorizationUrl` or `authorization_url`. The upload helper change stays unstaged |
| 2026-10-25 | Portal quote and invoice lists omit `customerId` | Sending the login user id made the API return 404. The API already scopes a customer to their own rows |
| 2026-10-25 | Record payment picks from the first 100 invoices | The list route filters one status. The dialog keeps sent, partially paid, and overdue rows from that page |
| 2026-10-25 | Invite and analytics export do not download or create anything | Invite says it is not available. Export says no file is downloaded. Both stay for Phase 7 |
| 2026-10-25 | Quote and invoice create use the existing POST routes | Staff search a job and send line items. No new path |
| 2026-10-25 | Invoice PDF is a link only when `pdf_url` starts with `http` | No new download route and no second PDF generator. A storage key is not offered as a file |
| 2026-10-25 | The job page shows diagnostics, not a new inspection checklist | Q10 default stands. One report per job uses the existing diagnostics routes |
| 2026-10-25 | A customer can rate a finished job once | Status must be completed or ready for pickup. Featuring a review does not change the marketing page |
| 2026-10-25 | The reminder board records a send and does not deliver a message | The committed scheduler only logs. The working-tree send path uses the uncommitted outbox and was left there. `FEATURE_REMINDER_SCHEDULER` stays false. The prototype 39 percent figure is not shown |
| 2026-10-25 | The inventory shelf starts empty | The prototype shows ten sample parts and has no create form. Staff add a part. Restock-low raises only parts whose minimum is above zero. Money stays in pesewas |
| 2026-10-25 | Technicians cannot open or assign the schedule | Q7. The prototype menu includes Schedule for a technician and still shows Assign because `canAssign` is unused. The Phase 5 URL guard stays bookings and jobs only. Assign sets `assigned_technician_id` and a 3 hour slot on the least busy day of the next six workshop days in Africa/Accra. Sunday is skipped. Saturday is 5 hours. The prototype had no bay control, so the page can place and clear a job |
| 2026-10-25 | Invite creates the account and does not send email | The prototype flashes "Invitation sent" and collects no password. `users.password_hash` is required and no committed sender is used, so the dialog collects a password and `POST /users/invite` returns `emailed: false`. Customer and super_admin cannot be created. `auth.service.ts` stays uncommitted |
| 2026-10-26 | "proceed" approves Phase 7 and starts Phase 8 | Q1 stays the load model in `SCALE.md`. No cloud account and no remote deploy |
| 2026-10-26 | The global request cap stays 300 unless `RATE_LIMIT_GLOBAL_MAX` is set | The first local smoke from one address stopped at 300 catalogue responses. Health p95 stayed 17 ms. The measurement compose file sets 100000. The one-command boot does not |
| 2026-10-26 | k6 runs from the `grafana/k6` image | k6 is not on PATH. No application dependency was added |
| 2026-10-26 | The capacity number is public reads on an empty catalogue | Portal, staff, booking, and payment were not in the hold. Payment would call Paystack, which this stack does not configure. Tracking 404s are 4xx and are outside the error budget |
| 2026-10-26 | Plan for 5 API instances | Measured clean rate is 400 requests/second, p95 44 ms. `2000 / 400 = 5`, extrapolated. The 800/s hold still had p95 93 ms. The 1200/s hold had p95 2.65 s. The HPA example allows 2 to 8 and was not applied. 100k is not proven |
| 2026-10-26 | "proceed" approves Phase 8 and starts Phase 9 | No remote deploy. Status stays short of READY TO DEPLOY until the Phase 9 checklist is done |
| 2026-10-26 | Shell motion stops when reduced motion is requested | The old rule set the spinner to 1.8s. The shell now uses a 0.01ms duration. Checked in the browser: sidebar computed duration `1e-05s`, and at 900px the menu button opens the sidebar. Search results are a labeled group of buttons, not a listbox |
| 2026-10-26 | Next stays on an exact pin and moved from 16.2.6 to 16.4.3 | 16.2.6 is inside the critical advisory range. `npm audit fix` without `--force` could not leave that pin. `eslint-config-next` moved with it. After that, `npm audit` on the frontend reported 0 vulnerabilities. Nodemailer was not forced to 10 |
| 2026-10-26 | API production audit has no critical finding after the lockfile update | `npm audit fix` without `--force` set `proxy-addr` to 2.0.8. Remaining: nodemailer high (fix is 10.2.1, breaking) and node-cron's uuid moderate (fix is node-cron 4.6.0, breaking). esbuild's Windows dev-server advisory is not in the production image. No Content-Security-Policy was added to Next. The API helmet CSP stays. Headers already in `next.config.ts` were re-read and left as they are |
| 2026-10-26 | Committed route roles match `API.md` | Messages, inventory, schedule, and reminders are admin or super_admin. Feedback list and patch are admin. Feedback create is customer. Invite and user list are admin. User delete is super_admin. Quotes, invoices, jobs, diagnostics, and payment record also allow technician. Fleet and analytics are admin only. No route change |
| 2026-10-26 | `next dev` does not rewrite `AGENTS.md` | Next 16.4.3 adds that file on startup. `agentRules: false` leaves the existing deletion in the working tree |
| 2026-10-26 | The rehearsal built clean worktrees, then `up --no-build` | Both working trees have unrelated uncommitted files. `up --build` from those trees would have put that work into the image. The worktrees were removed after the stack was torn down |
| 2026-10-26 | Status is READY TO DEPLOY | The checklist is done. Nodemailer stays on 6 because 10 is a breaking upgrade. Phase 10 has not started |

## Data-fetching convention

- Query keys stay in `src/lib/api/queryKeys.ts`. A list key includes the filter params. A detail key includes the id.
- A query function calls the DAL and returns the response body. It does not catch errors.
- Render in this order: pending (`isLoading`), then error (`isError` with no data) using `ErrorAlert`, then the empty copy, then the data.
- Do not treat `!data` or `length === 0` as empty until `isError` is false. A failed fetch has no data, so that check hides the error.
- New toasts use `notify('success' | 'error', message)` from `src/lib/notify.ts`. Existing `toast` calls stay until that screen is redesigned.
- A submit sets `pending` on `Button`, or `loading` on `NtButton`.
- `PageSkeleton` kinds are `list`, `dashboard`, `detail`, `form`, and `cards`. Mount one when a later screen wants a first-visit placeholder.
- `TopProgress` is the prototype top bar. Mount it on a screen that is waiting. Layouts do not mount it until the shell phase.

## Open questions

All non-blocking. Defaults are in `PLAN.md` section H.

- Q1 Load model
- Q2 Provider and budget
- Q3 Which API git repo to commit to
- Q4 Which homepage
- Q5 Booking earliest time
- Q6 Sample-record fallback versus real 404
- Q7 Technician assign
- Q8 Whose notifications the bell shows
- Q9 Quote and invoice create screens
- Q10 Inspection versus diagnostics
- Q11 Paystack versus prototype MoMo brands
- Q12 PDF download
- Q13 Analytics CSV
- Q14 Dirty working trees

## Deferred

- Analytics CSV export (Q13)
- Read replica, Redis cluster, and cursor pagination until a measurement in Phase 8
- Any remote deploy, remote migration, or paid service until Phase 10

## Known issues (pre-existing, not fixed)

- Frontend payment initialize response is read in two shapes. The checkout screen now accepts both. The upload helper still has an uncommitted download-URL change.
- Other screens may still render a failed fetch as an empty state. Analytics, portal notifications (page and dashboard card), and job history were fixed in Phase 3.
- Technician restrictions now block the URL as well as the menu. Bookings and jobs stay open.
- Admin job create searches for a customer and vehicle. Fleet add-vehicle searches by plate.
- API `npm test` does not collect colocated `src/**/*.test.ts`.
- API `deploy-backend.yml` is empty.
- Frontend has no test script. The Dockerfile and CI workflow were added in Phase 2.
- Frontend `npm run format:check` exits 1 on 201 files, including the clickable prototype. Left as-is.
- Parent folder of the API is spelled `nuetek-auto-care`.

## Verification commands

Not run in Phase 0.

Frontend, from `neutek-auto-care-frontend`:

```text
npm run lint
npm run type-check
npm run build
npm run format:check
```

API, from `nuetek-auto-care/neutek-api`:

```text
npm run lint
npm run typecheck
npm run build
npm run test
npm run test:ci
```

## Results

Measured 2026-10-25 on the working trees before the Phase 1 commit. Not a load test.

Frontend, from `neutek-auto-care-frontend`:

- `npm run lint` (then `next lint`): exit 1. `Invalid project directory provided, no such directory: ...\neutek-auto-care-frontend\lint`
- `npm run type-check`: exit 2. Errors in admin analytics, bookings, fleet, blog form, `PasswordStrength.tsx`, and `tailwind.config.ts`. First error is the Recharts formatter in `analytics/page.tsx`.
- `npm run build`: exit 1. Compiled successfully in 23.1s, then failed typecheck at `analytics/page.tsx:156`. No route size table was printed.
- `npm run format:check`: not run repo-wide. Prettier was run on the Phase 1 files only.

After the lint script change, `npx eslint` on the Phase 1 files exited 0. Repo-wide `eslint .` was not run.

API, from `nuetek-auto-care/neutek-api`:

- `npm test`: exit 1. Test Suites: 1 failed, 4 passed, 5 total. Tests: 1 failed, 68 passed, 69 total. Time 172.399 s.
- Failure: `tests/integration/payments.integration.test.ts` "returns 200 for valid signature with unknown reference". Expected 200, received 500. Log: `Paystack verify failed: 401 Unauthorized`.

Browser check after the commit's files were saved: `/design-foundation` shows the warm page `#F4F1EB`, primary button `#C2410C`, Plus Jakarta Sans, loading spinner, empty-name error "Enter a name.", and a success toast. `/home` is still the existing dark theme.

Measured again 2026-10-25 after the baseline fix. Not a load test.

Frontend, from `neutek-auto-care-frontend`, after `0a8653d`:

- `npm run lint` (`eslint .`): exit 0. 30 warnings, 0 errors. Warnings are unused imports, `form.watch`, and `<img>`.
- `npx tsc --noEmit`: exit 0.
- `npm run build`: exit 0. Compiled in 10.8s, TypeScript in 9.1s, 35 static pages. Route table includes `/design-foundation`.
- `npm run format:check`: exit 1. 200 files, including the clickable prototype, config files, and most of `src`. Not reformatted.

API, from `nuetek-auto-care/neutek-api`, on the dirty working tree:

- `npm test`: exit 0. Test Suites: 5 passed, 5 total. Tests: 69 passed, 69 total. Time 123.282 s.
- The unknown-reference webhook test passes because `handleWebhook` returns before `paystackGateway.verify` when `findByGatewayReference` is missing or the payment is already completed. That change is uncommitted. `payments.service.ts` already had a large unrelated diff, so the file was not committed.
- API lint, typecheck, build, and `test:ci` were not re-run. They were not the recorded failure.

Opening `/admin/bookings` in the browser redirected to `/portal/dashboard` because the session is a customer. The walk-in name and phone labels were not seen on screen. Type-check confirms those fields exist on the booking DTO.

Measured 2026-10-25 for Phase 2. Not a load test. The API image was built from the dirty working tree, so it includes pre-existing uncommitted API files. Those files are not in the Phase 2 commit.

- `docker compose -f docker/docker-compose.local-prod.yml config`: exit 0.
- `docker compose -f docker/docker-compose.local-prod.yml up --build -d`: exit 0. Images `neutek-api:local-prod` and `neutek-frontend:local-prod` built locally. No registry push.
- Migrate container exit 0. API healthy. Worker log: `Worker process running`. Scheduler log: `Scheduler process running`.
- `GET http://127.0.0.1:13000/health/ready`: 200, body `{"status":"ready",...}`.
- `GET http://127.0.0.1:13001/`: 200, 55586 bytes. The browser opened `/home` and showed the existing marketing page.
- `docker compose -f docker/docker-compose.local-prod.yml down -v`: exit 0. Containers, network, and the Postgres volume were removed.

Frontend, from `neutek-auto-care-frontend`, after `711280f`:

- `npm run lint`: exit 0. 30 warnings, 0 errors.
- `npm run type-check`: exit 0.
- Image build ran `npm run build` inside Docker and the container served `next start`.
- `npm run format:check`: still the deferred exit 1 from Phase 1. Not re-run.

API, from `nuetek-auto-care/neutek-api`, on the dirty working tree:

- `npm run lint`: exit 0. 8 warnings, 0 errors.
- `npm run typecheck`: exit 0.
- `npm test`: exit 0. Test Suites: 5 passed. Tests: 69 passed. Time 138.228 s.
- Image build ran `npm run build`. `npm run test:ci` was not re-run.

Measured 2026-10-25 for Phase 3. Not a load test. Baseline was taken on `redesign/phase-3-loading` before the Phase 3 edits. `npm run build` was run after the edits because the dev server on port 3001 was already using `.next`.

Frontend, from `neutek-auto-care-frontend`, before the Phase 3 commits:

- `npm run lint`: exit 0. 30 warnings, 0 errors.
- `npm run type-check`: exit 0.

Frontend, from `neutek-auto-care-frontend`, after `8d8c188`:

- `npm run lint`: exit 0. 30 warnings, 0 errors. The warnings are the same unused imports, `form.watch`, and `<img>` warnings as Phase 2.
- `npm run type-check`: exit 0.
- `npm run build`: exit 0. Compiled in 10.0s, TypeScript in 9.7s, 35 static pages. Routes include `/design-foundation`, `/admin/analytics`, `/portal/notifications`, and `/portal/jobs/[id]`.
- `npm run format:check`: exit 1. 201 files, including the clickable prototype. Not reformatted.

API commands were not re-run. No API file changed. Phase 2 already recorded lint, typecheck, and `npm test` green on the dirty tree.

Browser, on the running dev servers (frontend port 3001, API port 4000 in this environment):

- `/design-foundation`: empty name shows "Enter a name." A name of "Ama" makes both Save buttons busy, then the toast "Saved just now". The five skeleton kinds switch and render list, dashboard, detail, form, and cards.
- `/portal/notifications` with the notifications request blocked: subtitle "Could not load notifications" and an error alert. It does not say "All caught up" or "No notifications". With the request allowed, the page shows the unread items.
- `/portal/dashboard` with the same request blocked: the notifications card says "Failed to load notifications." It does not say "You're all caught up!"
- Portal job `6aab69bd-72cb-488d-98d2-736ebd65ef18` with history allowed: "No history yet" after a completed history request. With history blocked: "Failed to load status history."
- `/admin/analytics` with the API allowed: totals render (Total Revenue GH₵0.00, Total Jobs 2). Empty charts keep "No revenue data available", "No data available", and "No technician data available". With `/analytics` blocked: five error alerts, including "Failed to load workshop totals" and "Failed to load revenue."
- Admin job `43d20ae9-9a4c-41c1-a5f6-0d5c05199f19` with history blocked: "Failed to load status history." The rest of the job page still renders.

Measured 2026-10-25 for Phase 4. Not a load test. No k6 run. The pool budget and the unlimited-read decisions are code review of the compose file and the repositories. Postgres `max_connections` was not queried.

API, from `nuetek-auto-care/neutek-api`, on `redesign/phase-4-scale`, before the lock edit. The dirty tree includes uncommitted `tests/unit/production-fixes.test.ts`:

- `npm test`: exit 0. Test Suites: 5 passed, 5 total. Tests: 69 passed, 69 total. Time 155.305 s.

API, after `53248c6`, still on the dirty tree:

- `npx cross-env NODE_ENV=test jest --runInBand tests/unit/scheduler-lock.test.ts`: exit 0. Test Suites: 1 passed. Tests: 3 passed. Time 6.237 s. The logged "boom" error is the failure case under test.
- `npm run lint`: exit 0. 8 warnings, 0 errors. None are in `scheduler-lock.ts`.
- `npm run typecheck`: exit 0.
- `npm run build`: exit 0.
- `npm run test:ci`: exit 0. Test Suites: 6 passed, 6 total. Tests: 72 passed, 72 total. Time 176.729 s. Coverage for `scheduler-lock.ts` is 92.85% lines. Line 24, the log when deleting the lock fails, is uncovered.

Frontend commands were not re-run. No frontend file changed.

Measured 2026-10-25 for Phase 5. Not a load test.

Frontend, from `neutek-auto-care-frontend`, before the Phase 5 edits, on `redesign/phase-5-shell` at `8d8c188`:

- `npm run lint`: exit 0. 30 warnings, 0 errors.
- `npm run type-check`: exit 0.

Frontend, after `7359262`:

- `npm run lint`: exit 0. 30 warnings, 0 errors. Same unused-import and `form.watch` warnings as the baseline.
- `npm run type-check`: exit 0.
- `npm run build`: exit 0. Compiled in 11.2s, TypeScript in 9.8s, 35 static pages.
- `npm run format:check` was not re-run. It remains the deferred exit 1 on 201 files.

API, from `nuetek-auto-care/neutek-api`, after `ada84d5`, on the dirty tree:

- `npx cross-env NODE_ENV=test jest --runInBand tests/unit/list-search.test.ts`: exit 0. 1 suite, 3 tests, 5.788 s.
- `npm run lint`: exit 0. 8 warnings, 0 errors. None are in the search files.
- `npm run typecheck`: exit 0.
- `npm test`: exit 0. Test Suites: 7 passed, 7 total. Tests: 75 passed, 75 total. Time 153.852 s.
- `npm run test:ci` was not re-run. `npm test` is the same suite without coverage.

Browser, on the dev server at port 3001. Page bodies stayed on the old components.

- Customer portal: skip link is the first tab stop, sidebar collapses to the mark, bell says "You are all caught up.", search for "aa" says "Nothing matches that."
- At a 900px-wide viewport the menu button shows, the sidebar starts off-canvas, and opening it clears the transform. The account name hides.
- Desktop sidebar width measured 264px. The NT mark and the skip link are white `#FFFFFF` on `#C2410C`.
- Technician menu is Bookings (pending count 1) and Jobs. `/admin/analytics` says "You do not have access to this page." Sign-in lands on `/admin/jobs`. The account menu is sign out only.
- Admin menu shows Overview, Operations, Finance, Catalogue, Content, Insights, and System. The account title is "Workshop manager".

## Git at the time of the audit

| Repo | Branch | HEAD | Working tree |
|---|---|---|---|
| `neutek-auto-care-frontend` | `redesign/phase-5-shell` | `7359262d6d44ef767132c58229c637feebca0e8e` | Phase 5 commit is the shell. Pre-existing dirty files are still unstaged |
| `nuetek-auto-care/neutek-api` | `redesign/phase-5-shell` | `ada84d5f1799649694fdb117d1d798254943b602` | Phase 5 commit is optional `search` on job and vehicle lists, plus `tests/unit/list-search.test.ts`. `payments.service.ts`, the rest of `jobs.service.ts`, `rate-limiter.ts`, and `tests/unit/production-fixes.test.ts` stay unstaged |
| `nuetek-auto-care` (wrapper) | `main` | `6ab6d55742d0d555fd8f616afb4114a73efbaa1e` | Dirty. Large delete of `neutek-web` and many API path changes. Do not commit this repo unless Q3 changes |
| Workspace root | none | none | `prompt.md`, `docs/redesign/`, `.cursor/rules/` are not in a git repo |

## How to verify this phase

Sign in and open `/admin/dashboard` or `/portal/dashboard`. Tab to "Skip to content". Collapse the sidebar. At a window about 900px wide, open the menu from the top bar. Search two or more characters. Open the bell. Sign in as a technician and open `/admin/analytics`: the page says you do not have access, and the menu lists Bookings and Jobs. Nothing was deployed.

Measured 2026-10-25 for Phase 6. Not a load test. Before the screen edits, frontend `npm run lint` was exit 0 with 30 warnings and `npm run type-check` was exit 0. `npm run format:check` was not re-run.

Frontend, from `neutek-auto-care-frontend`, after `3a44a3f`:

- `npm run lint`: exit 0. 14 warnings, 0 errors. The warnings are `form.watch`, two `<img>` tags, and unused imports in files this phase did not need to rewrite.
- `npm run type-check`: exit 0.
- `npm run build`: exit 0. Compiled in 12.6s, TypeScript in 11.2s, 35 static pages.

API, from `nuetek-auto-care/neutek-api`, after `d67a580`, on the dirty tree:

- `npm run lint`: exit 0. 8 warnings, 0 errors. None are in the blog id route.
- `npm run typecheck`: exit 0.
- `npm test`: exit 0. Test Suites: 9 passed, 9 total. Tests: 81 passed, 81 total. Time 168.019 s. That includes `tests/unit/blog-by-id.test.ts` and `tests/unit/screen-fixes.test.ts`.

Browser, on `http://localhost:3001`:

- Empty sign-in shows the field errors. The seeded manager reaches `/admin/dashboard`. Services lists the live categories. Tracking asks for the job number and the last 4 phone digits, and a blank submit says "Enter the job number."
- A service was deactivated and then reactivated. An empty booking cancel reason is rejected. Booking `BK-20260831-000001` was left in place. New job searches for a customer, and the vehicle list stays disabled until one is chosen.
- Record payment offers `INV-20261025-000001` instead of a UUID field. The payments list itself is empty.
- Fleet has no accounts. The add-account form is company, contact, phone, email, address, and credit limit. Blog edit for `bc9f9f07-0401-41c1-a45b-8dacc18e9c7f` loads "Why Regular Oil Changes Are Critical for Your Vehicle". Analytics shows Intake 2 and empty revenue. Export says no file is downloaded. Invite says it is not available. Users lists 3 people.
- Customer Ama Boateng lands on `/portal/dashboard` with "Hello, Ama" and an empty workshop. Quotes shows `QT-20261025-000001`. Invoices shows `INV-20261025-000001` with Pay now.

Nothing was deployed.

Measured 2026-10-25 for Phase 7. Not a load test. `format:check` stays the deferred red. It was not reformatted. The file count is now 229 because the new phase files are in that unformatted set. It does not block this phase.

Frontend, from `neutek-auto-care-frontend`, after `675a9e8`:

- `npm run lint`: exit 0. 14 warnings, 0 errors. The warnings are `form.watch`, two `<img>` tags, and unused imports in files this phase did not need to rewrite.
- `npm run type-check`: exit 0.
- `npm run build`: exit 0. Compiled in 15.0s, TypeScript in 12.5s, 42 static pages. Routes include `/admin/messages`, `/admin/inventory`, `/admin/schedule`, and `/admin/users`.
- `npm run format:check`: exit 1. `Code style issues found in 229 files.` Includes the clickable prototype and the new phase pages. Not reformatted.

API, from `nuetek-auto-care/neutek-api`, after `a4dc491`, on the dirty tree. `auth.service.ts`, the outbox, schedulers, and migrations 018–020 stayed unstaged:

- `npm run lint`: exit 0. 8 warnings, 0 errors. One warning is the existing `any` on `GET /users/me` in `users.routes.ts`.
- `npm run typecheck`: exit 0.
- `npm run build`: exit 0.
- `npm test`: exit 0. Test Suites: 15 passed, 15 total. Tests: 123 passed, 123 total. Time 207.319 s. The logged "boom" error is the scheduler-lock failure case.
- `npm run test:ci`: exit 0. Test Suites: 15 passed, 15 total. Tests: 123 passed, 123 total. Time 150.549 s. All files statement coverage 52.93%. A deadlock was logged during `TRUNCATE TABLE customers` in `jobs.integration.test.ts` and the suite still passed.

Browser, on `http://localhost:3001`, after `GET http://localhost:4000/api/v1/reminders` returned 401 `No access token provided`:

- Messages: 7 templates. Recording a test stored Kofi Mensah, Car received, Not sent, Recorded. Delivered stayed 0.
- Inventory started empty. Oil filter, SKU OF-UNI, was saved and received up to quantity 7, in stock.
- Schedule on Sunday 2026-10-25 starts Monday 26. JOB-TEST-002 was assigned to Kwame Asante for 3 hours on Monday 26. Bay 1 took JOB-TEST-001 and was cleared. JOB-TEST-001 stayed unassigned.
- Users: an empty invite says "Enter a first and last name." Efua Boateng (`efua.boateng.phase7@example.com`, technician) raised the list from 3 to 4. Akosua Owusu (`akosua.phase7@example.com`, technician) raised it to 5. The toast was "Account created. No email was sent."

Nothing was deployed. Status is awaiting approval. Phase 8 has not started.

Measured 2026-10-26 for Phase 8. Not a proof of 100,000 sessions. The numbers are in `SCALE.md`. `format:check` stays the deferred red and was not reformatted.

Frontend, from `neutek-auto-care-frontend`, on `redesign/phase-8-scale` at `675a9e8`. No frontend file changed in this phase:

- `npm run lint`: exit 0. 14 warnings, 0 errors.
- `npm run type-check`: exit 0.
- `npm run build`: exit 0. Compiled in 33.0 s, TypeScript in 30.6 s, 42 pages. `.next/static` is 3,062,340 bytes. `.next/static/chunks` is 2,758,158 bytes. The largest chunk is 397,203 bytes.
- `npm run format:check`: exit 1. `Code style issues found in 229 files.` Not reformatted.

API, from `nuetek-auto-care/neutek-api`, after `56c9d9a`, on the dirty tree. `auth.service.ts`, the outbox, schedulers, migrations 018–020, and the tracking rate limiter stayed unstaged:

- `npm run lint`: exit 0. 8 warnings, 0 errors.
- `npm run typecheck`: exit 0.
- `npm run build`: exit 0.
- `npm test`: exit 0. Test Suites: 16 passed, 16 total. Tests: 126 passed, 126 total. Time 246.6 s. That includes `tests/unit/rate-limit-cap.test.ts` (3 tests). The logged "boom" error is the scheduler-lock failure case.
- `npm run test:ci`: exit 0. Test Suites: 16 passed. Tests: 126 passed. Time 217.907 s. All files statement coverage 52.95%. `rate-limit-cap.ts` is 100%.

Local k6, one API container, then `docker compose -f docker/docker-compose.local-prod.yml down -v` (exit 0). The dev containers on 5432, 6379, and 4001 were still up afterward. Port 4000 was not touched.

- First smoke, default cap: exit 99. Service checks 300 passed and 830 failed. p95 17.23 ms.
- Smoke after the measurement cap: exit 0. p95 40.19 ms. Failed requests 0.
- Hold at 400/s: exit 0. p95 44.1 ms. No 5xx. No dropped iterations.
- Hold at 1200/s: exit 99. p95 2.65 s.

Extrapolated API count is 5. The HPA and CDN files were not applied. Nothing was deployed. Status is awaiting approval. Phase 9 has not started.

Measured 2026-10-26 for Phase 9. Not a remote deploy. `format:check` stays the deferred red and was not reformatted. The first frontend `npm run build` exited 1 because Google Fonts could not be reached. The retry exited 0.

Frontend, from `neutek-auto-care-frontend`, on `redesign/phase-9-launch` at `45840eb`:

- `npm run lint`: exit 0. 15 warnings, 0 errors. The warnings are `form.watch`, `<img>`, and unused imports.
- `npm run type-check`: exit 0.
- `npm run build`: exit 0 on the retry. Compiled in 9.6 s, TypeScript in 13.8 s, 42 pages.
- `npm run format:check`: exit 1. `Code style issues found in 229 files.` Not reformatted.

API, from `nuetek-auto-care/neutek-api`, after `4439293`, on the dirty tree. `auth.service.ts`, the outbox, schedulers, migrations 018–020, and the tracking rate limiter stayed unstaged:

- `npm run lint`: exit 0. 8 warnings, 0 errors.
- `npm run typecheck`: exit 0.
- `npm run build`: exit 0.
- `npm test`: exit 0. Test Suites: 16 passed, 16 total. Tests: 126 passed, 126 total. Time 202.057 s. The logged "boom" error is the scheduler-lock failure case.
- `npm run test:ci`: exit 0. Test Suites: 16 passed, 16 total. Tests: 126 passed, 126 total. Time 171.996 s. All files statement coverage 52.95%.

Local production-like stack, then rollback, then `down -v` (exit 0). Commands and image ids are in `DEPLOY.md`.

- Migrate exit 0. `Ran 22 migration(s)`.
- `GET http://127.0.0.1:13000/health/ready` returned 200.
- `GET http://127.0.0.1:13001/home` returned 200. `/` was 307 to `/home`.
- k6 smoke with the measurement cap: exit 0. Checks 4468 of 4468. `http_req_failed` 0.00%. p95 24.29 ms.
- Rollback recreate: migrate `No pending migrations`, exit 0. Readiness 200. `/home` 200. Running API image `sha256:ec73838a7571...`. Running frontend image `sha256:ea326def9ec1...`.
- Dev containers on 5432, 6379, and 4001 were still up. `GET http://127.0.0.1:4000/health` stayed 200.

Browser, on `http://localhost:3001/home` after the dev server was restarted on Next 16.4.3: the marketing page rendered, including Book a service, Track a car, and the question buttons.

Nothing was deployed. Status is READY TO DEPLOY. Phase 10 has not started.


