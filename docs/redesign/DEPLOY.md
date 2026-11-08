# Deployment runbook

Phase 9 runbook. Nothing here has been run against a remote host. Phase 10 is the only time that happens, and only after the word "deploy" while status is READY TO DEPLOY.

## Repos

The workspace root `auto-care` is not a git repo.

| Repo | Path | Role |
|---|---|---|
| Frontend | `neutek-auto-care-frontend` | Next.js. Dev and `next start` on port 3001 |
| API | `nuetek-auto-care/neutek-api` | Express 5. The parent folder is spelled `nuetek-auto-care` |

Commit in those two repos only. Do not commit the wrapper repo.

## One-command local production-like stack

From `nuetek-auto-care/neutek-api`, on a clean checkout:

```text
docker compose -f docker/docker-compose.local-prod.yml up --build
```

Stop it and delete the disposable database:

```text
docker compose -f docker/docker-compose.local-prod.yml down -v
```

| Published port | Service |
|---|---|
| 13000 | API. Readiness is `http://127.0.0.1:13000/health/ready` |
| 13001 | Frontend (`next start`). `/` redirects to `/home` |

`NODE_ENV` is `production`. `ALLOW_INSECURE_BOOT=true` because this stack is localhost and does not use Sentry, Paystack, SMTP, or object storage. Postgres and Redis are not published. The passwords in that compose file are for this disposable project only. Do not copy them into a shared environment.

`docker/docker-compose.yml` stays the development stack (Postgres on 5432, Redis on 6379, API on 4001). Do not stop it to boot local-prod. Do not free port 4000. That port is the workshop API on the host.

The measurement overlay `docker/docker-compose.phase8-measure.yml` sets `RATE_LIMIT_GLOBAL_MAX=100000` on the API only. It is not part of the one-command boot. Use it when one load generator would otherwise stop at the anonymous cap of 300 requests per 15 minutes.

## Phase 9 rehearsal (2026-10-26)

Both working trees had unrelated uncommitted files, so the images were built from clean worktrees at the commits below, then started with `--no-build`. The worktrees were removed afterward.

| Image | Commit | Id |
|---|---|---|
| `neutek-api:phase9` (also `neutek-api:local-prod` after the rehearsal) | `4439293` | `sha256:fa36ca4e7da5637346a81a82b221fb9c16199e2bf8eb6a25d32e722614a991bb` |
| `neutek-api:rollback-previous` | Phase 8 image, kept from the earlier local build | `sha256:ec73838a7571911915ac30dcd7f758155d4c6b3d416572e86866d902e201cc56` |
| `neutek-frontend:phase9` | `1e9f5c6` | `sha256:5ae7a779f59fd8680f8d4223d399e8fae54e3e76dfd77bf1d5af8847a81e280f` |
| `neutek-frontend:rollback-previous` | Phase 2 image | `sha256:ea326def9ec1f5a3a97b48dcca53ac408ae0f70f63d13bf2ba187bf0ee635b21` |

`45840eb` is after that frontend image. It only stops `next dev` from rewriting `AGENTS.md`. It does not change the production response.

Boot, from `nuetek-auto-care/neutek-api`, after the images were tagged `local-prod`:

```text
docker compose -f docker/docker-compose.local-prod.yml -f docker/docker-compose.phase8-measure.yml up -d --no-build
```

Exit 0. Migrate exit 0. Log line `Ran 22 migration(s)`, through `025_schedule_bays.sql`. Migrations 018–020 are not in this image. `GET http://127.0.0.1:13000/health/ready` returned 200 `{"status":"ready",...}`. `GET http://127.0.0.1:13001/` returned 307 to `/home`, and `/home` returned 200. The frontend response included `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, and `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`.

k6 is not on PATH. Smoke used the local `grafana/k6` image, with the measurement cap so one client is not stopped at 300:

```text
docker run --rm -v <clean-api-checkout>:/scripts -e BASE_URL=http://host.docker.internal:13000/api/v1 grafana/k6 run /scripts/k6-smoke.js
```

Exit 0. Checks 4468 of 4468. `http_req_failed` 0.00%. p95 24.29 ms. Live, ready, services, and metrics passed.

Rollback. The previous tags were applied back onto `local-prod`, then:

```text
docker compose -f docker/docker-compose.local-prod.yml up -d --no-build --force-recreate api worker scheduler frontend
```

Compose also recreated migrate because the image tag changed. Migrate exit 0. Log line `No pending migrations`. The running API image was `sha256:ec73838a7571...`. The running frontend image was `sha256:ea326def9ec1...`. Readiness returned 200. `/home` returned 200.

Tear-down:

```text
docker compose -f docker/docker-compose.local-prod.yml down -v
```

Exit 0. The local-prod volume and network were removed. Dev containers `neutek_postgres` (5432), `neutek_redis` (6379), `neutek_api_2` (4001), `neutek_worker`, and `neutek_scheduler` were still running. `GET http://127.0.0.1:4000/health` stayed 200.

## Health

| Path | Meaning |
|---|---|
| `GET /health/live` | Process is up |
| `GET /health/ready` | Postgres `SELECT 1` and Redis `PING`. Returns 503 while shutting down or when either check fails |
| `GET /health` | Same family of checks. The workshop process on port 4000 answers this |
| `GET /metrics` | Prometheus. On a production boot without `ALLOW_INSECURE_BOOT`, the working tree requires `METRICS_TOKEN`. The committed image used in this rehearsal answered 200 without a token |

Readiness 503: the process is shutting down, or Postgres or Redis failed. Check `/health/ready`, then the pool and Redis.

## Rollback

- App: tag the previous image as `neutek-api:local-prod` (and the frontend the same way) and recreate the app containers with `--no-build`. Do not use `--build` on a rollback.
- Schema: migrations are forward-only (`npm run migrate`). There is no down migration. Ship expand/contract changes so the previous image still runs. The rehearsal's previous image found no pending migrations on a database that already had 001–017 and 021–025.
- Data: restore a backup taken before a production migration. That step is Phase 10 and waits for confirmation.

## Environment names

Values stay in `.env`, `.env.local`, or the host secret store. The templates are `nuetek-auto-care/neutek-api/.env.example` and `neutek-auto-care-frontend/.env.example`.

API names: `NODE_ENV`, `PORT`, `DATABASE_URL`, `DATABASE_SSL`, `DB_POOL_MIN`, `DB_POOL_MAX`, `RATE_LIMIT_GLOBAL_MAX`, `REDIS_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRY`, `JWT_REFRESH_EXPIRY`, `ALLOWED_ORIGINS`, `STORAGE_ENDPOINT`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`, `STORAGE_BUCKET`, `STORAGE_REGION`, `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`, `PAYSTACK_WEBHOOK_SECRET`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`, `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `WHATSAPP_VERIFY_TOKEN`, `SMS_API_KEY`, `SMS_SENDER_ID`, `SMS_ENABLED`, `WHATSAPP_ENABLED`, `METRICS_TOKEN`, `SENTRY_DSN`, `FRONTEND_URL`, `ALLOW_INSECURE_BOOT`, `ROLE`, `TRUST_PROXY`, `PAYSTACK_WEBHOOK_IPS`, `FEATURE_REMINDER_SCHEDULER`, `FEATURE_FOLLOW_UP_SCHEDULER`, `REDIS_CACHE_URL`, `COOKIE_SAME_SITE`, `COOKIE_DOMAIN`, `SHUTDOWN_DEREGISTER_MS`, `SHUTDOWN_GRACE_MS`, `SHUTDOWN_SOCKET_MS`, `SHUTDOWN_WORKER_MS`, `LOG_LEVEL`.

Frontend names, inlined at build time when they start with `NEXT_PUBLIC_`: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`, `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`, `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_ENV`, `ANALYZE`.

`FEATURE_REMINDER_SCHEDULER` and `FEATURE_FOLLOW_UP_SCHEDULER` stay false in `.env.example`. The local-prod scheduler sets both true for that disposable stack only.

`RATE_LIMIT_GLOBAL_MAX` empty keeps the anonymous cap at 300 and the authenticated cap at 600 per 15 minutes. Health and metrics are mounted before the limiter.

## Security notes from the Phase 9 pass

- Frontend `npm audit` after Next `16.4.3` and `npm audit fix` (no `--force`): 0 vulnerabilities. `next` and `eslint-config-next` stay exact pins.
- API `npm audit fix` (no `--force`) moved `proxy-addr` to 2.0.8. Production audit after that: 0 critical. Still open: nodemailer high (the fix is 10.2.1, a breaking major) and node-cron's uuid moderate (the fix is node-cron 4.6.0, a breaking major). esbuild's Windows dev-server advisory is not in the production image. Do not run `npm audit fix --force` for those.
- Next response headers are the five listed in the rehearsal. `compress` is true. `poweredByHeader` is false. No Content-Security-Policy was added on Next, because a static policy can block Next's scripts. The API helmet policy is on `/health/ready` and the rest of the API.
- Committed route roles match `API.md`. No route change in this phase.

## Rate limits when Redis is down

From the committed `src/shared/middleware/rate-limiter.ts`. The uncommitted tracking limiter is not in the image from this rehearsal.

If the cache client is closed, or the limiter throws, `createLimiter` calls `next()` unless `failClosed` is set.

| Limiter | Redis down |
|---|---|
| Global, booking | Fail open |
| Auth, webhook | Fail closed, HTTP 503 |
| Tracking | Fail closed, HTTP 503, only in the uncommitted working tree |

Limits are skipped when `NODE_ENV=test`. A Redis outage on a fail-open route is a capacity risk, not a 503.

A thrown scheduler job deletes `scheduler:lock:<name>`. A successful run keeps that key until its TTL (3600 seconds, 86400 for the audit partition).

## Incidents

- Readiness 503: shutting down, or Postgres or Redis failed.
- Auth responses of 503: the auth limiter failed closed because Redis is down.
- Bad deploy: put the previous image tag back and recreate. Do not fix a failed production migration forward without an explicit approval.
- Error spike: Sentry when `SENTRY_DSN` is set, and `GET /metrics`.

## Phase 10 checklist (do not start)

1. Confirm provider, budget, domains, and who holds secrets.
2. Provision staging. Run the full-scale load test in `SCALE.md`. Iterate until it passes. That test is the first proof of 100,000 sessions.
3. Production migration with a backup and an expand/contract plan. Wait for confirmation.
4. Production deploy with the health checks above. Canary or blue-green if the host supports it. Wait for confirmation before traffic shifts onto a new paid resource.
5. Smoke test, confirm an alert fires, confirm rollback on staging or on a canary.
6. Record the results in `PROGRESS.md` and `SCALE.md`.

`deploy-backend.yml` is empty. CI does not push an image. No registry, no remote migration, and no paid scanner is part of this runbook.
