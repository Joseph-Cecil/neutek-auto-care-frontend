# Scale

Phase 0 record. No load test was run. Every number below is an assumption or an extrapolation, not a measurement. The 100,000-user target is not proven.

## Load model (assumptions, open questions)

"100,000 simultaneous users" is not a request rate. These are the working assumptions until confirmed. See open questions in `PROGRESS.md`.

| Assumption | Proposed default |
|---|---|
| What 100k means | 100,000 concurrent sessions (open site or logged-in session), not 100,000 requests per second |
| Peak activity | 2% of sessions send one request in a given second → **2,000 requests/second peak** |
| Average | 20% of peak → **400 requests/second** |
| Read/write | 90% read / 10% write |
| Real time | 5% of sessions hold a Socket.IO connection → **5,000 concurrent sockets** at the target |
| Latency budget | Read API p95 under 300 ms. Write API p95 under 800 ms. Payment initialize and PDF generation are outside the read budget |
| Error budget | Under 0.1% of responses are 5xx. Client 4xx does not count |
| Peak vs average | Peak is a short window (booking rush, status fan-out). Size for peak, pay for average with autoscaling |
| Tenancy | One deployment. The prototype describes one workshop; the target still applies to that deployment |

Journey mix used later for k6 (weights are assumptions):

- 40% public catalogue, blog, and home
- 25% public job tracking (REST, and a fraction also join the socket)
- 15% customer portal reads (jobs, quotes, invoices, notifications)
- 10% staff list and detail reads
- 7% writes (booking, status transition, quote decision, profile)
- 3% payment initialize (not a completed charge)

## Current bottlenecks (from code, not from a profile)

Audited on the working tree of `nuetek-auto-care/neutek-api` and `neutek-auto-care-frontend`. Not measured.

- `ROLE` defaults to `all`, so one process can be API, workers, cron, and the outbox poller (`server.ts`). Production compose splits them. Nothing deploys that split.
- Dev compose runs two API containers and a Redis Socket.IO adapter. There is no load balancer in compose, and the Kubernetes file is an example with no Service.
- Postgres pool max is per process (`DB_POOL_MAX`, default about `min(20, cpu*2+1)`). API, worker, and scheduler each open a pool. The local-prod budget is in the Phase 4 section below.
- Lists use `LIMIT`/`OFFSET` (max limit 100) plus a separate `COUNT(*)`. Deep pages still scan skipped rows.
- Analytics dashboard and technician queries aggregate whole tables (`analytics.repository.ts`). Dashboard is cached 60s. Other analytics routes are not cached.
- Some reads have no limit: job status history, vehicles by customer, fleet vehicles, diagnostic photos, overdue-invoice finder (the live cron uses one `UPDATE` instead). Phase 4 left these uncapped. See the table below.
- Reminder and follow-up schedulers select every matching row in the window and insert outbox rows in one transaction. Phase 4 left that window as the bound.
- Invoice PDF is built with PDFKit on the worker path. The outbox poller can do that work inline. BullMQ `invoice-pdf` concurrency is 3.
- Outbox poller is a 2s `setInterval` with `FOR UPDATE SKIP LOCKED` (safe to run twice) and no leader lock.
- Scheduler lock is Redis `SET NX`. A thrown job deletes the key. A successful run keeps it until TTL (1 hour, audit job 24 hours). A killed process still waits for the TTL.
- Global and booking rate limiters fail open if Redis is down. Auth, webhook, and tracking fail closed.
- Sockets require a JWT. Public tracking can still poll REST. Redis adapter is required once more than one API process runs.
- Frontend pages are client components. There is no `loading.tsx`, no `next/dynamic`, and `next/image` is unused. Bundle size has not been measured. The `analyze` script expects `@next/bundle-analyzer`, which is not installed.

## Target architecture

Simplest set that can reach the assumed 2,000 rps and 5,000 sockets. Do not add a piece until a measured bottleneck needs it (Phase 8). Writing the config is allowed. Applying it to a cloud account is Phase 10.

| Piece | Why | When |
|---|---|---|
| Stateless API processes behind a load balancer | Dev compose already runs two APIs. Sessions are JWT plus an httpOnly refresh cookie, not server memory | Phase 2 local compose, Phase 8 prove per-instance capacity, Phase 10 provision |
| Split `ROLE=api`, `worker`, `scheduler` | Stops cron and PDF work from stealing API latency | Already in prod compose. Keep it |
| Pool budget | `processes × DB_POOL_MAX` must stay under Postgres `max_connections` | Written in the Phase 4 section from the local-prod compose file. Not measured against a running Postgres |
| Indexes and query review | Heavy aggregates and the unlimited reads above | Phase 4 and Phase 8, only after a measured slow query |
| Redis | Already used for cache, rate limits, BullMQ, scheduler locks, Socket.IO adapter | Keep one Redis. Cluster only if a measurement says so |
| Cache | Categories and service lists (5 min) and dashboard (60s) exist. Add keys only for measured hot reads | Phase 4 / 8 |
| Queues | Email, SMS, WhatsApp, PDF, cleanup already exist. Domain sends go through the outbox | Keep. Do not add a second queue system |
| Rate limits and pagination | Exist. Cursor pagination only if OFFSET shows up in a profile | Phase 8 |
| Frontend split and CDN | Static assets and the Next.js build on a CDN. Code-split heavy charts | Phase 8 |
| Read replica | Only if the primary's read CPU is the measured limit | Phase 8 decision, Phase 10 provision |
| Autoscaling | Write the policy. Do not create the cloud scaler until Phase 10 | Phase 8 writes it |

## Load tests

Tool: k6. Scripts already in `nuetek-auto-care/neutek-api`: `k6-smoke.js`, `k6-load-test.js`. CI workflow `load-test-smoke.yml` is manual and was not run.

Phase 8 (local, production-like compose):

- Realistic journeys at the mix above.
- Ramp until p95 or error rate breaks one API instance. Record requests/second per instance.
- Pass on the local run: p95 and error rate inside the budget **at the per-instance load**, with headroom stated.
- Extrapolate instance count as `2000 / measured rps per instance`, labeled **extrapolated**.
- Fix the measured bottleneck and rerun. Do not tune without a before/after number in this file.

Phase 10 (staging, only after "deploy"):

- Same journeys at 2,000 rps and 5,000 sockets, or whatever confirmed model replaces them.
- The 100k target is proven only when this run passes. Until then, status text must say extrapolated.

## Phase 4 pool budget and query decisions

Code review of `docker/docker-compose.local-prod.yml` and the repositories named below. Not a load test. Postgres `max_connections` was not queried on a running server. The Postgres 16 image default is 100, and this compose file does not set it.

Long-running processes in that compose file, and the pool each one is given:

| Process | Count | `DB_POOL_MAX` | Connections at the cap |
|---|---|---|---|
| api | 1 | 5, from the shared env | 5 |
| worker | 1 | 2, set on that service | 2 |
| scheduler | 1 | 2, set on that service | 2 |
| Steady state | 3 | | **9** |

`DB_POOL_MIN` stays at its default of 2, so those three processes can also hold 6 idle connections. The migrate container uses the shared cap of 5 and exits before the others start (`service_completed_successfully`). It is not part of the steady-state 9. Nine is under the image default of 100. No pool size was changed.

Unlimited reads, left as they are:

| Read | Where | Decision |
|---|---|---|
| Job status history | `jobs.repository.ts` `getStatusHistory`, `ORDER BY created_at ASC`, no `LIMIT` | Deferred. A limit on that order drops the newest transitions. The job page shows the whole timeline |
| Vehicles for one customer | `vehicles.repository.ts` `findByCustomer`, no `LIMIT` | Deferred. `findAll` is already paged. A silent cap on this route would hide vehicles and there is no next page |
| Fleet vehicles | `fleet.repository.ts` `getVehicles`, no `LIMIT` | Deferred, same reason |
| Diagnostic photos | `diagnostics.repository.ts` `getPhotos`, no `LIMIT` | Deferred. A silent cap would hide later photos |
| Overdue invoice list | `invoices.repository.ts` `findOverdue`, no `LIMIT` | Deferred. The live cron in `overdue-invoice.scheduler.ts` is one `UPDATE`, not this select. `markOverdueInvoices` is the only caller and nothing else calls it. The repository file is also in the pre-existing dirty tree |
| Reminder and follow-up | `reminder.scheduler.ts` and `follow-up.scheduler.ts` | Deferred. Each select is a date window (the next Accra day, or jobs completed 7 to 14 days ago), then one transaction. A row cap would skip customers. Both files are in the pre-existing dirty tree |

No read replica, second Redis, or cursor pagination was added.

The scheduler lock in `scheduler-lock.ts` now deletes its Redis key when the job throws. A successful run still holds the key until the TTL, so a second replica does not repeat a finished run. A killed process cannot delete the key; the TTL is still the release. Quote expiry is hourly with a 3600 second TTL, so a thrown error used to block the next hour.

## Capacity and cost (extrapolated, not a quote)

No hosting account was found. This is a planning range for the assumed model, not a bill.

| Piece | Sketch | Rough monthly USD |
|---|---|---|
| API, 4–10 small instances | Depends on Phase 8 rps/instance. 2,000 rps at 250 rps each → 8 instances | 80–250 |
| Worker ×2, scheduler ×1 | PDF and notifications off the API | 30–80 |
| Postgres primary | Plus a replica only if measured | 80–300 |
| Redis | Cache, queues, sockets, rate limits | 20–80 |
| Load balancer | One | 15–25 |
| Object storage and CDN | Uploads and Next.js assets | 20–60 |
| Staging | A smaller copy during the load test | 50–150 while it exists |
| Sentry / SMS / WhatsApp / email / Paystack | Usage priced by those vendors | Not estimated |

Planning band before a provider quote: **about 300–900 USD/month** for production at the extrapolated footprint, plus staging during Phase 10, plus vendor usage. This needs a budget decision before anything is provisioned. It is not approval to spend.

## Phase 8 measurements

Measured on 2026-10-26 against one API container from `docker/docker-compose.local-prod.yml`. The image was built from commit `a4dc491` for the first smoke, then from `f241f75` for the rest. Postgres, Redis, the worker, and the scheduler were in that compose project. The dev stack on ports 5432, 6379, and 4001 was left running. k6 is not installed on the host. The runs used the `grafana/k6` container, which is the same tool named in this file, not a new application dependency.

The catalogue was empty. The hold is public reads: service list, blog list, and `/health/live`. It does not include portal reads, staff reads, booking writes, or payment initialize. Payment initialize would call Paystack, which this stack does not configure. A 5xx from a missing vendor would not be an instance-capacity result. Tracking `JOB-NONE` in the ramp returns 404. Those 4xx responses are not in the error budget.

| Run | What | Result | Label |
|---|---|---|---|
| Smoke, default cap 300 | `k6-smoke.js`, 10 VUs, 1 minute, exit 99 | `http_req_failed` 18.36% (830 of 4520). Services checks 300 passed and 830 failed. Live, ready, and metrics passed. p95 17.23 ms. 74.9 requests/second were attempted | measured |
| Smoke, `RATE_LIMIT_GLOBAL_MAX=100000` | same script, exit 0 | `http_req_failed` 0%. All 4368 checks passed. p95 40.19 ms. 72.2 requests/second | measured |
| Ramp to 150/s | `k6-phase8.js`, exit 0 | Read p95 12.17 ms. Server errors 0. `http_req_failed` 24.42% is the tracking 404s. 52.5 completed requests/second average over the ramp, ending at 150/s | measured |
| Hold 400/s | `k6-phase8-hold.js`, exit 0 | p95 44.1 ms. Server errors 0. Dropped iterations 0. 399.93 requests/second. 10,001 requests | measured |
| Hold 800/s | same script, exit 99 | p95 92.83 ms. Server errors 0. Dropped iterations 126. 789.86 requests/second completed | measured |
| Hold 1200/s | same script, exit 99 | p95 2.65 s. Server errors 0. Dropped iterations 8,596. k6 reached 500 VUs and stopped adding more. 839.82 requests/second completed | measured |

The first bottleneck was the anonymous global cap of 300 requests per 15 minutes for one address. Health stayed fast. The default cap is unchanged. Only `docker/docker-compose.phase8-measure.yml` sets `RATE_LIMIT_GLOBAL_MAX=100000`, and that file is not part of the one-command boot.

The clean per-instance rate inside the read budget is **400 requests/second** (p95 44 ms, no dropped iterations, no 5xx). The 800/s hold still had p95 93 ms and no 5xx, with 126 iterations the generator did not start on time. The 1200/s hold broke the latency budget.

Extrapolation, not a proof of 100,000 sessions: `2000 / 400 = 5` API instances at the clean point. `2000 / 790 ≈ 2.6`, so 3 instances if the stressed point is used. Planning number is **5**, because p95 at 400/s is 44 ms against a 300 ms budget and the next step up already dropped iterations. `docker/k8s-hpa.example.yaml` says min 2 and max 8. It was not applied. `docker/cdn.example.conf` was not applied.

Frontend production build on 2026-10-26, exit 0: compiled in 33.0 s, TypeScript in 30.6 s, 42 pages. `.next/static` is 3,062,340 bytes. `.next/static/chunks` is 2,758,158 bytes. Largest chunk 397,203 bytes. The whole `.next` directory is about 2.8 GB because it includes the build cache. That cache size is not the browser payload.

This is not the Phase 10 staging test. The 100,000-session target is not proven.
