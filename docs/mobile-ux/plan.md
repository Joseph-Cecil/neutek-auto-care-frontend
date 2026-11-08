# Neutek Auto Care — Mobile UX implementation plan

**Derived from:** [recommendations.md](./recommendations.md)  
**Tracker:** [progress.md](./progress.md)  
**Rule:** IDs map **1:1**. Scope changes → update recommendations first, then this plan, then code.  
**Out of scope:** Backend/API/auth Redis, Contabo/Dokploy/deploy, `/design-foundation` polish — unless a tiny UI-only badge/count needs an existing endpoint.

**Effort:** S ≤ ~2h · M ~half day · L ≥1 day

---

## Phase 1 — Shell & foundations

**Goal:** Shared mobile primitives so later pages plug in instead of forking layouts.  
**Depends on:** nothing  
**Unlocks:** Phases 2–5 list/detail work

| ID | Item | Effort | Likely files |
|----|------|--------|--------------|
| R-X-LIST-01 | Shared desktop table / mobile card list pattern (`.mlist` / `.mrow` or small component) | L | `src/app/nt-screens.css`, optional `src/components/ui/mobile-list.tsx` (or similar) |
| R-X-TOUCH-01 | Mobile touch sizing for `.btn.sm` / dense actions | S | `src/app/nt-screens.css`, `src/app/globals.css` |
| R-X-TABS-01 | Tab overflow affordance (± compact select) | M | `src/app/nt-screens.css`, list pages with `.tabs` |
| R-X-PAGEHEAD-01 | Mobile pagehead / primary CTA stacking | S | `src/app/nt-screens.css` |
| R-X-MODAL-01 | Mobile dialog/drawer sheet + sticky footer | M | `src/app/nt-screens.css`, dialog-using pages |
| R-X-KV-01 | Stack `.kv` on narrow | S | `src/app/nt-screens.css` |
| R-X-SAFE-01 | Safe-area insets | S | `src/app/globals.css`, `src/app/nt-screens.css` |
| R-X-STATES-01 | Empty/error consistency (as touched) | S | pages as edited; `.empty` in `nt-screens.css` |
| R-SHELL-TOP-01 | Topbar: icon search sheet, de-crowd | L | `src/components/layout/app-shell.tsx`, `src/app/globals.css` |
| R-SHELL-NAV-01 | Drawer: Escape, scroll lock, focus restore | M | `src/components/layout/app-shell.tsx`, `src/app/globals.css` |
| R-SHELL-CRUMB-01 | Truncate crumbs on mobile | S | `src/components/layout/app-shell.tsx`, `src/app/globals.css` |

**Phase 1 order:** R-X-LIST-01 + R-X-TOUCH-01 + R-X-PAGEHEAD-01 → R-SHELL-TOP-01 → R-SHELL-NAV-01 → R-SHELL-CRUMB-01 → R-X-TABS-01 → R-X-MODAL-01 → R-X-KV-01 → R-X-SAFE-01 → R-X-STATES-01 (ongoing).

---

## Phase 2 — Public & booking

**Goal:** Book → Track without dead ends; home/public nav complete.  
**Depends on:** Phase 1 CSS tokens helpful but public can start in parallel after R-PUB-HOME-01 / R-PUB-NAV-01

| ID | Item | Effort | Likely files |
|----|------|--------|--------------|
| R-PUB-ROOT-01 | Keep `/` redirect (no work) | — | `src/app/page.tsx` |
| R-PUB-HOME-01 | Marketing home mobile menu | M | `src/app/(public)/home/page.tsx`, `src/app/nt-screens.css` |
| R-PUB-HOME-02 | Stack hero CTAs | S | `src/app/(public)/home/page.tsx`, `nt-screens.css` |
| R-PUB-NAV-01 | Sign in / account in public mobile menu | S | `src/components/layout/public/PublicNavbar.tsx` |
| R-PUB-BOOK-01 | Booking wizard compact progress + sticky CTA | M | `src/app/(public)/booking/page.tsx`, `nt-screens.css` |
| R-PUB-BOOK-02 | Booking status header stack | S | `src/app/(public)/booking/status/page.tsx` |
| R-PUB-TRACK-02 | Tracking timeline stack | S | `src/app/nt-screens.css`, `tracking/[jobNumber]/page.tsx` |
| R-PUB-TRACK-01 | Tracking lookup polish | S | `src/app/(public)/tracking/page.tsx` |
| R-PUB-SERVICES-01 | Services card stack | S | `src/app/(public)/services/page.tsx`, `nt-screens.css` |
| R-PUB-BLOG-01 | Blog search flex | S | `src/app/(public)/blog/page.tsx` |
| R-PUB-BLOG-02 | Article content overflow CSS | S | `nt-screens.css`, `blog/[slug]/page.tsx` |
| R-PUB-FOOTER-01 | Footer stack | S | `PublicFooter.tsx`, home footer, `nt-screens.css` |

**Phase 2 order:** R-PUB-HOME-01 → R-PUB-NAV-01 → R-PUB-BOOK-01 → R-PUB-BOOK-02 → R-PUB-TRACK-02 → remaining P2s.

---

## Phase 3 — Auth

**Depends on:** can run after or with Phase 2

| ID | Item | Effort | Likely files |
|----|------|--------|--------------|
| R-AUTH-LAYOUT-01 | Single-column auth ≤960px verified/fixed | S | `src/app/(auth)/layout.tsx`, auth CSS in `nt-screens.css` |
| R-AUTH-LOGIN-01 | Full-width Sign in | S | `src/app/(auth)/login/page.tsx` |
| R-AUTH-REGISTER-01 | Full-width Create | S | `src/app/(auth)/register/page.tsx` |
| R-AUTH-FORGOT-01 | Full-width primary | S | `src/app/(auth)/forgot-password/page.tsx` |
| R-AUTH-RESET-01 | Full-width + missing-token UX | S | `src/app/(auth)/reset-password/page.tsx` |

---

## Phase 4 — Customer portal (core flows)

**Goal:** Approve quote → Pay invoice → Notifications; jobs list usable.  
**Depends on:** R-X-LIST-01, R-X-PAGEHEAD-01, R-X-TOUCH-01, R-X-MODAL-01

| ID | Item | Effort | Likely files |
|----|------|--------|--------------|
| R-PORTAL-QUOTES-01 | Quotes list → mobile cards | M | `portal/quotes/page.tsx`, list CSS/component |
| R-PORTAL-QUOTES-02 | Quote detail approve sticky + line stack | M | `portal/quotes/[id]/page.tsx` |
| R-PORTAL-INVOICES-01 | Invoices list → mobile cards | M | `portal/invoices/page.tsx` |
| R-PORTAL-INVOICES-02 | Invoice detail Pay sticky + line stack | M | `portal/invoices/[id]/page.tsx` |
| R-PORTAL-JOBS-01 | Jobs list cards + open | M | `portal/jobs/page.tsx` |
| R-PORTAL-NOTIF-01 | Full-row notification open | S | `portal/notifications/page.tsx` |
| R-PORTAL-BOOKINGS-01 | Bookings polish | S | `portal/bookings/page.tsx` |
| R-PORTAL-JOBS-02 | Job detail polish | S | `portal/jobs/[id]/page.tsx` |
| R-PORTAL-VEHICLES-01 | Vehicle card actions | S | `portal/vehicles/page.tsx` |
| R-PORTAL-DASH-01 | Dashboard row taps | S | `portal/dashboard/page.tsx` |
| R-PORTAL-PROFILE-01 | Profile stack | S | `portal/profile/page.tsx` |

**Phase 4 order:** Quotes list+detail → Invoices list+detail → Jobs list → Notifications → P2 polish.

---

## Phase 5 — Admin / workshop

**Depends on:** R-X-LIST-01 + Phase 1 shell

| ID | Item | Effort | Likely files |
|----|------|--------|--------------|
| R-ADMIN-SCHEDULE-01 | Mobile day/agenda alternate | L | `admin/schedule/page.tsx`, `nt-screens.css` |
| R-ADMIN-INVENTORY-01 | Inventory cards | M | `admin/inventory/page.tsx` |
| R-ADMIN-FEEDBACK-01 | Feedback cards + reply dialog | M | `admin/feedback/page.tsx` |
| R-ADMIN-BOOKINGS-01 | Bookings cards + actions | M | `admin/bookings/page.tsx` |
| R-ADMIN-JOBS-03 | Job detail status sheet | M | `admin/jobs/[id]/page.tsx` |
| R-ADMIN-INVOICES-01 | Invoices tabs + cards | M | `admin/invoices/page.tsx` |
| R-ADMIN-PAYMENTS-01 | Payments cards | M | `admin/payments/page.tsx` |
| R-ADMIN-SERVICES-01 | Services cards + confirm dialog | M | `admin/services/page.tsx` |
| R-ADMIN-FLEET-01 | Fleet list cards | S | `admin/fleet/page.tsx` |
| R-ADMIN-BLOG-01 | Blog list cards | S | `admin/blog/page.tsx` |
| R-ADMIN-MESSAGES-01 | Message log cards + template wrap | M | `admin/messages/page.tsx` |
| R-ADMIN-REMINDERS-01 | Reminders cards | M | `admin/reminders/page.tsx` |
| R-ADMIN-USERS-01 | Users cards | S | `admin/users/page.tsx` |
| R-ADMIN-JOBS-01 | Jobs list mobile | S | `admin/jobs/page.tsx` |
| R-ADMIN-JOBS-02 | Jobs create sticky | S | `admin/jobs/create/page.tsx` |
| R-ADMIN-CUSTOMERS-01 | Customers cards | S | `admin/customers/page.tsx` |
| R-ADMIN-QUOTES-01 | Quotes list cards | S | `admin/quotes/page.tsx` |
| R-ADMIN-QUOTES-02 | Quotes create sticky | S | `RaiseDocumentForm.tsx` |
| R-ADMIN-QUOTES-03 | Quote detail lines | S | `admin/quotes/[id]/page.tsx` |
| R-ADMIN-INVOICES-02 | Invoice create sticky | S | `RaiseDocumentForm.tsx` |
| R-ADMIN-INVOICES-03 | Invoice detail lines | S | `admin/invoices/[id]/page.tsx` |
| R-ADMIN-FLEET-02 | Fleet detail vehicles | S | `admin/fleet/[id]/page.tsx` |
| R-ADMIN-BLOG-02 | Blog form sticky | S | `BlogPostForm.tsx` |
| R-ADMIN-DASH-01 | Dashboard metrics grid | S | `admin/dashboard/page.tsx` |
| R-ADMIN-ANALYTICS-01 | Analytics controls stack | S | `admin/analytics/page.tsx` |

**Phase 5 order:** P0 schedule → inventory → feedback → P1 bookings/jobs detail/invoices/payments/… → P2.

---

## Phase 6 — Polish & DoD

| Work | Notes |
|------|--------|
| Finish remaining **P2** or park with Neutek agreement in `progress.md` | Explicit park list required |
| Re-verify core flows at 390 & 430 | Book → Track → Sign in → Approve quote → Pay → Notifications |
| Screenshots for former P0 pages | Prefer attach/note in progress |
| Sync docs | recommendations / plan / progress accurate |

---

## Dependency graph (summary)

```
Phase 1 foundations (LIST, TOUCH, PAGEHEAD, SHELL)
        ├─► Phase 2 Public (HOME/NAV first)
        ├─► Phase 3 Auth
        ├─► Phase 4 Portal (needs LIST)
        └─► Phase 5 Admin (needs LIST; SCHEDULE/INVENTORY/FEEDBACK first)
                └─► Phase 6 Polish / park P2
```

---

## Explicit out of scope

- API/auth Redis/session infrastructure  
- Contabo / Dokploy / Docker deploy  
- New product features beyond mobile presentation  
- Redesigning desktop information architecture  
- `/design-foundation` visual polish  
- Committing/pushing unless Neutek asks  
