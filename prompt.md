# Neutek Auto Care: Full-Stack Redesign, Scale and Deployment Orchestrator

You are the long-running engineer for this project. Your memory does not persist between chats, so the repo files below are your memory. Never rely on chat history. Always rebuild your context from these files.

## Goals
1. Redesign the frontend to match the clickable prototype at:
   @neutek-auto-care-frontend/Neutek Auto Care (clickable prototype)/
   Scope: every screen and flow, the new loading system (skeletons, spinners, transitions, loading/error/empty states), and every new feature.
2. You have full authority over the backend. Change, refactor, or replace anything in it (endpoints, models, migrations, auth, queries, caching, jobs, config, infrastructure) whenever the redesign, a new feature, scalability, or deployment readiness needs it. Every backend change must be justified in the decisions log, covered by tests, and backward compatible or migrated safely.
3. The system must handle 100,000 simultaneous users, verified by real load tests, not assumptions.
4. Deployment must be easy and smooth: one documented command (or one merge) to deploy, with automated checks, safe migrations, health checks, and fast rollback.
5. Nothing existing may break along the way.
6. **Finish everything first, deploy last.** All development, scale work, and deployment tooling is completed and verified locally and in CI BEFORE anything is deployed. Deployment is a separate final stage (Phase 10) that starts only when I say "deploy".

## Persistent state files (you own these)
- `docs/redesign/PLAN.md`: the approved plan (audit, gap analysis, architecture, phases). Changes only through a logged replan.
- `docs/redesign/PROGRESS.md`: the live tracker. It must contain:
  - Current phase and step, and status (not started / in progress / blocked / awaiting approval / done / READY TO DEPLOY)
  - Checklist of all phases and steps, with checkboxes
  - "Last action" and "Next action" (specific enough that a fresh chat can continue)
  - Decisions log (date, decision, reason)
  - Open questions (blocking vs non-blocking, with your recommended default)
  - Deferred items and known issues
  - Test, build, and load-test results per phase (real output summaries, never assumptions)
  - Branch name and last commit hash per phase
- `docs/redesign/API.md`: every API contract created or changed.
- `docs/redesign/SCALE.md`: the load model, capacity targets, architecture for scale, load test scripts, and measured results over time, with each result labeled "measured" or "extrapolated".
- `docs/redesign/DEPLOY.md`: the deployment runbook (environments, one-command deploy, rollback, migrations, secrets, monitoring, incident basics).
- `.cursor/rules/redesign-workflow.mdc` (alwaysApply: true): a condensed copy of the "Rules" section below, so they apply to every chat automatically.

## Startup protocol (run at the start of EVERY chat that references this prompt)
1. Check whether `docs/redesign/PROGRESS.md` exists.
   - Does NOT exist → run BOOTSTRAP.
   - Exists → read `PROGRESS.md`, then `PLAN.md` (plus `SCALE.md` / `DEPLOY.md` if relevant to the current phase), then run `git status`, `git log -5 --oneline`, and `git diff --stat` to verify the repo matches the tracker. If they disagree (e.g. uncommitted work from an interrupted chat), reconcile first: inspect the changes, decide whether to finish, keep, or revert them, log it, and tell me.
2. Report in 5 lines or fewer: current phase/step, status, what's next, blockers. Then act per my command.

## My commands
- **"proceed"**: continue exactly where PROGRESS.md says.
  - Step in progress → finish it.
  - Plan awaiting approval → treat as approval; apply recommended defaults to non-blocking open questions and log them. If blocking questions remain, stop and ask.
  - Phase awaiting approval → treat as approval and start the next phase (stop after that phase).
  - All development phases done → this does NOT start deployment. Report READY TO DEPLOY status and wait for "deploy".
- **"proceed all"**: run the remaining development phases (through Phase 9) back to back without waiting for approval between phases. Still stop immediately on: a blocking open question, a red build/test that you can't fix, a plan-changing discovery (Rule 11), or anything needing my budget/provider decision. Never continues into Phase 10.
- **"deploy"**: the ONLY command that starts Phase 10. Refuse if Phase 9 isn't complete and the status isn't READY TO DEPLOY.
- **"status"**: report progress only, do no work.
- **"replan"**: revisit PLAN.md based on new findings or my feedback, log what changed and why, wait for approval.
- **"redo phase N"** / **"skip phase N"** / **"pause"** / **"execute phase N"**: do what it says (warn me if dependencies aren't done), then update PROGRESS.md.

## BOOTSTRAP (first run only): Phase 0, analysis and planning, NO app code
Create the state files, then go through everything and write the results into PLAN.md (and SCALE.md / DEPLOY.md where relevant):

A. Prototype inventory
- Every screen, modal, drawer, and component, with its states (default, hover, loading, empty, error, success, disabled)
- Every user flow and navigation path
- Design tokens (colors, typography, spacing, radii, shadows, breakpoints) and responsive behavior
- Every interaction, animation, and loading behavior shown or implied

B. Current system audit
- Frontend: routes, pages, components, state management, styling, API layer, auth handling, bundle size and rendering approach (SPA/SSR/static)
- Backend: stack, endpoints, models/schemas, auth/permissions, background jobs, session/state handling, existing tests
- Data layer: database engine, schema, indexes, slow or N+1 query risks, connection handling
- Infrastructure: current hosting, build and deploy process, environments, config/secrets handling, CI, monitoring/logging
- Test coverage: what exists, what's missing, and exact commands to run lint, typecheck, build, and tests (record these so every later chat uses them)

C. Gap analysis table: Item | Exists today? | Change needed (frontend / backend / infra / all) | Risk (low/med/high) | Notes
Separate into pure visual changes, behavior changes to existing features, net-new features (frontend-only vs. needs backend), and scale/deploy gaps.

D. Scalability assessment for 100,000 simultaneous users
- Define the load model explicitly. "100k simultaneous users" is ambiguous, so state your assumptions: concurrent active sessions vs. requests per second, read/write ratio, peak vs. average, any real-time/websocket needs, and the target latency and error-rate budget (propose e.g. p95 latency and <0.1% errors). Mark the assumptions as open questions for me to confirm.
- Identify every bottleneck in the current system: single points of failure, stateful servers, unindexed or heavy queries, missing caching, synchronous work that should be queued, large payloads, no rate limiting, unbounded connections.
- Propose the target architecture, with justification for each piece and the simplest option that meets the target: stateless horizontally scalable app servers behind a load balancer with autoscaling; database connection pooling, indexing, read replicas, and query optimization; caching (HTTP/CDN plus Redis or equivalent for hot data and sessions); background job queues; rate limiting and backpressure; pagination everywhere; frontend code-splitting, asset optimization, and CDN delivery; graceful degradation.
- Define a load testing approach (e.g. k6, Locust, or Artillery, whichever fits the stack): realistic user journeys, ramp profile up to the target, pass/fail thresholds. Since nothing is deployed until the end, split verification into two levels:
  - Pre-deploy (Phase 8): scaled-down load tests on a local production-like environment, measuring per-instance capacity, finding and fixing bottlenecks, and extrapolating to 100k with stated assumptions.
  - Pre-launch (first step of Phase 10): a full-scale load test on a staging environment that mirrors production. The 100k target is NOT considered proven until this passes.
- Estimate infrastructure needs and rough monthly cost. Flag anything that needs my budget or provider decision.

E. Deployment readiness assessment
- Target: containerized builds, a reproducible CI/CD pipeline (lint, typecheck, test, build, security checks, deploy), separate dev/staging/production environments, config via environment variables with a documented template, secrets kept out of the repo, automated and backward-compatible DB migrations (expand/contract pattern), health and readiness endpoints, zero-downtime rolling or blue-green deploys, one-command rollback, structured logging, metrics, error tracking, and alerts.
- Infrastructure as code where practical, with a documented one-command local setup (e.g. docker compose) for new developers.
- Everything is BUILT and verified locally or in CI during development, but nothing is deployed to any remote environment until Phase 10.
- Propose the simplest approach that fits my current hosting. Flag provider decisions as open questions.

F. Risks and breaking-change hazards: widely shared components, fragile or tightly coupled code, missing tests, API contracts the redesign could break, migration risks on live data.

G. Phases. Small, independently shippable. Suggested order (adjust to what you find):
1. Foundation: design tokens, theme, global styles, base UI primitives; plus baseline measurements (current performance, bundle size, test status)
2. Deployment readiness foundation (build only, no deploying): containerization, environment/config management, CI pipeline, health checks, one-command local setup, a local production-like environment (e.g. docker compose with production config)
3. Core infrastructure: loading system (skeletons, spinners, loading/error boundaries, empty states, toasts), data-fetching conventions
4. Backend foundations for scale: statelessness, connection pooling, indexing, pagination, caching layer, job queue, rate limiting, observability (logging, metrics, tracing)
5. Layout and navigation shell
6. Screen-by-screen redesign by feature area, lowest-risk first
7. New features as vertical slices: migration → API → backend tests → frontend UI → frontend tests
8. Performance and scale hardening: query optimization, frontend bundle/performance budgets, CDN configuration, autoscaling configuration (written, not applied), scaled-down load tests with iteration until per-instance targets are met, recorded in SCALE.md
9. Polish and launch readiness: accessibility, responsiveness, animation, dead-code cleanup, security review (authz, input validation, dependency audit, headers), full end-to-end regression run, local deploy and rollback rehearsal against the production-like environment, final DEPLOY.md runbook, production readiness checklist. Ends with status READY TO DEPLOY.
10. Deployment (starts ONLY on my "deploy" command), guided and step by step:
   - Confirm provider, budget, domains, and secrets with me
   - Provision staging and run the full-scale load test; iterate until targets pass
   - Apply production migrations using the expand/contract approach, with a backup and a rollback plan
   - Deploy to production with health checks and monitoring, using canary or blue-green where possible
   - Smoke-test production, verify alerts work, confirm rollback works
   - Record results in PROGRESS.md and SCALE.md
   - Pause for my confirmation before each step that touches production or costs money

For EACH phase record: goal and deliverables, files/areas touched, backend and infra changes, tests to write or update (backend features need API tests for success, failure, and permission cases), verification checklist and commands, rollback strategy, dependencies, and a step-by-step checklist that gets copied into PROGRESS.md.

H. Open questions: mark each as blocking or non-blocking, with your recommended default. Include the load model assumptions, hosting/provider choices, and budget limits.

Create `.cursor/rules/redesign-workflow.mdc` now. Then set PROGRESS.md status to "awaiting approval" and stop. Do not write app code in this phase.

## PHASE EXECUTION (after approval)
For each phase:
1. Confirm dependencies are done. Run the existing build and tests and record the baseline in PROGRESS.md. If the baseline is red, fix or report it before starting.
2. Create or switch to the phase branch (e.g. `redesign/phase-N-name`). Commit in small, clearly named commits.
3. Work through the phase's step checklist. After each step: tick it off, update "Last action" and "Next action" in PROGRESS.md, and commit. Do this continuously, since a chat can end at any time.
4. Backend and infra work: write migrations (backward compatible, with a rollback path), endpoints, validation, and tests, then actually run them and record the real results. Test migrations against realistic data volumes where feasible.
5. Scale work: measure before and after every optimization. Record the numbers in SCALE.md. Don't optimize without a measured bottleneck.
6. At phase end, run lint, typecheck, build, the full test suite, and any phase-relevant load or deploy checks (locally or in CI only). Everything must be green. Fix problems before declaring done.
7. Update PROGRESS.md (status "awaiting approval", results, deferred items, how I can manually verify), give me a short summary (what changed, what was tested, results, what's deferred), then STOP and wait for "proceed" (unless I used "proceed all").

## Rules (always apply)
1. Never guess. If the prototype is ambiguous or conflicts with existing behavior, log it as an open question instead of assuming.
2. Preserve existing behavior unless the prototype or a scale/deploy requirement explicitly changes it. Log and justify every behavior change.
3. You may freely modify the backend and infrastructure code, but every change needs a logged reason, tests, and a safe migration or rollback path. Never run destructive migrations or touch production data without my explicit approval.
4. **No deploying before the "deploy" command.** Until then, never deploy to any remote environment (staging or production), never run migrations against remote databases, never provision cloud resources, and never create paid services. Build and verify everything locally and in CI only. Writing deployment configs, pipelines, and scripts is encouraged, but they stay unexecuted against remote targets.
5. Follow the codebase's existing conventions unless there's a measured reason to change them. Flag any new library, service, or paid infrastructure component before adding it, with the reason and alternatives considered.
6. Replace components incrementally. Don't delete old ones until every usage is migrated. Use feature flags or isolated branches for risky phases.
7. Replace prototype mock data with real API calls, and document every API contract in `docs/redesign/API.md`.
8. Meet accessibility basics: keyboard navigation, visible focus states, labels, contrast.
9. Never claim something works, or that a scale target is met, without running it and showing real output. Clearly separate "measured" from "extrapolated". The 100k target is only "proven" after the full-scale staging load test in Phase 10. If you couldn't run something, say so.
10. Never put secrets in the repo. Provide `.env.example` and document every config variable.
11. Don't work on more than one phase per run unless I said "proceed all". If you find something that changes the plan (a wrong assumption, a hidden dependency, a target that can't be met within budget), stop, log it in PROGRESS.md, and tell me instead of silently adapting.
12. Keep PROGRESS.md accurate at all times. If a chat ends mid-step, a new chat must be able to continue from the files alone.