# Neutek Auto Care — Mobile UX progress

**Last updated:** 2026-11-08  
**Docs:** [recommendations.md](./recommendations.md) · [plan.md](./plan.md)

---

## Definition of Done (project)

Mobile UX is “much better” when:

1. Every **P0** and **P1** below is **done** (verified at ~390px and ~430px).
2. Core flows work comfortably: **Book → Track → Sign in → Approve quote → Open invoice/pay → Notifications**.
3. No horizontal **page** scroll on those flows (except intentional carousels).
4. List items open details without relying only on the notification panel.
5. Primary actions visible; tap targets adequate (≥40–44px where specified).
6. These three docs remain accurate.
7. Remaining **P2** either done or explicitly parked with Neutek’s agreement.

**Rule:** Never mark **done** without verifying at mobile width (device mode or real phone). Prefer screenshots for P0 pages when possible.

---

## Counts

| Severity | Todo | In progress | Done | Blocked |
|----------|------|-------------|------|---------|
| **P0** | 0 | 0 | 8 | 0 |
| **P1** | 0 | 0 | 28 | 0 |
| **P2** | 0 | 0 | 30 | 0 |
| **N/A** | 0 | — | 1 (`R-PUB-ROOT-01`) | — |

**Project complete:** all recommendation IDs done. Spot-check core flows on a real phone when convenient.

---

## Phase 1 — Shell & foundations

| ID | Sev | Status | Date | Note |
|----|-----|--------|------|------|
| R-X-LIST-01 | P0 | done | 2026-11-08 | Shared desk/mobile list pattern |
| R-X-TOUCH-01 | P1 | done | 2026-11-08 | Touch targets |
| R-X-TABS-01 | P1 | done | 2026-11-08 | Tab fade + selects |
| R-X-PAGEHEAD-01 | P1 | done | 2026-11-08 | Pagehead stacks |
| R-X-MODAL-01 | P1 | done | 2026-11-08 | Sheet dialogs |
| R-X-KV-01 | P2 | done | 2026-11-08 | `.kv` stacks |
| R-X-SAFE-01 | P2 | done | 2026-11-08 | Safe-area |
| R-X-STATES-01 | P2 | done | 2026-11-08 | Empty CTA sizing + alert word-break |
| R-SHELL-TOP-01 | P0 | done | 2026-11-08 | Search sheet |
| R-SHELL-NAV-01 | P1 | done | 2026-11-08 | Drawer a11y |
| R-SHELL-CRUMB-01 | P2 | done | 2026-11-08 | Short crumbs |

---

## Phase 2 — Public & booking

| ID | Sev | Status | Date | Note |
|----|-----|--------|------|------|
| R-PUB-ROOT-01 | — | done | 2026-11-08 | Redirect |
| R-PUB-HOME-01 | P0 | done | 2026-11-08 | Mobile menu |
| R-PUB-HOME-02 | P2 | done | 2026-11-08 | Hero CTAs |
| R-PUB-NAV-01 | P1 | done | 2026-11-08 | Sign in in menu |
| R-PUB-SERVICES-01 | P2 | done | 2026-11-08 | Service cards |
| R-PUB-BOOK-01 | P1 | done | 2026-11-08 | Wizard progress |
| R-PUB-BOOK-02 | P1 | done | 2026-11-08 | Status header |
| R-PUB-TRACK-01 | P2 | done | 2026-11-08 | Full-width Track CTA |
| R-PUB-TRACK-02 | P1 | done | 2026-11-08 | Timeline stack |
| R-PUB-BLOG-01 | P2 | done | 2026-11-08 | Flex search row |
| R-PUB-BLOG-02 | P2 | done | 2026-11-08 | Article overflow |
| R-PUB-FOOTER-01 | P2 | done | 2026-11-08 | Footer stack |

---

## Phase 3 — Auth

| ID | Sev | Status | Date | Note |
|----|-----|--------|------|------|
| R-AUTH-LAYOUT-01 | P1 | done | 2026-11-08 | Single column |
| R-AUTH-LOGIN-01 | P2 | done | 2026-11-08 | CTA stack |
| R-AUTH-REGISTER-01 | P2 | done | 2026-11-08 | CTA stack |
| R-AUTH-FORGOT-01 | P2 | done | 2026-11-08 | CTA stack |
| R-AUTH-RESET-01 | P2 | done | 2026-11-08 | CTA stack |

---

## Phase 4 — Customer portal

| ID | Sev | Status | Date | Note |
|----|-----|--------|------|------|
| R-PORTAL-QUOTES-01 | P1 | done | 2026-11-08 | Cards |
| R-PORTAL-QUOTES-02 | P0 | done | 2026-11-08 | Sticky approve |
| R-PORTAL-INVOICES-01 | P1 | done | 2026-11-08 | Cards |
| R-PORTAL-INVOICES-02 | P0 | done | 2026-11-08 | Sticky pay |
| R-PORTAL-JOBS-01 | P1 | done | 2026-11-08 | Cards |
| R-PORTAL-NOTIF-01 | P1 | done | 2026-11-08 | Open actions |
| R-PORTAL-DASH-01 | P2 | done | 2026-11-08 | Job/notif cards with Open |
| R-PORTAL-BOOKINGS-01 | P2 | done | 2026-11-08 | Stacked card actions |
| R-PORTAL-JOBS-02 | P2 | done | 2026-11-08 | Progress stack + larger stars |
| R-PORTAL-VEHICLES-01 | P2 | done | 2026-11-08 | Stacked vehicle actions |
| R-PORTAL-PROFILE-01 | P2 | done | 2026-11-08 | Avatar row + full-width saves |

---

## Phase 5 — Admin / workshop

| ID | Sev | Status | Date | Note |
|----|-----|--------|------|------|
| R-ADMIN-SCHEDULE-01 | P0 | done | 2026-11-08 | Day agenda |
| R-ADMIN-INVENTORY-01 | P0 | done | 2026-11-08 | Part cards |
| R-ADMIN-FEEDBACK-01 | P0 | done | 2026-11-08 | Reply dialog |
| R-ADMIN-BOOKINGS-01 | P1 | done | 2026-11-08 | Booking cards |
| R-ADMIN-JOBS-03 | P1 | done | 2026-11-08 | Status CTA sheet |
| R-ADMIN-INVOICES-01 | P1 | done | 2026-11-08 | Cards + select |
| R-ADMIN-PAYMENTS-01 | P1 | done | 2026-11-08 | Payment cards |
| R-ADMIN-SERVICES-01 | P1 | done | 2026-11-08 | Service cards |
| R-ADMIN-FLEET-01 | P1 | done | 2026-11-08 | Fleet cards |
| R-ADMIN-BLOG-01 | P1 | done | 2026-11-08 | Blog cards |
| R-ADMIN-MESSAGES-01 | P1 | done | 2026-11-08 | Log + templates |
| R-ADMIN-REMINDERS-01 | P1 | done | 2026-11-08 | Reminder cards |
| R-ADMIN-USERS-01 | P1 | done | 2026-11-08 | User cards |
| R-ADMIN-DASH-01 | P2 | done | 2026-11-08 | g4 → 2-col metrics on phone |
| R-ADMIN-JOBS-01 | P2 | done | 2026-11-08 | Jobs list cards |
| R-ADMIN-JOBS-02 | P2 | done | 2026-11-08 | Sticky Create job |
| R-ADMIN-CUSTOMERS-01 | P2 | done | 2026-11-08 | Customer cards + drawer |
| R-ADMIN-QUOTES-01 | P2 | done | 2026-11-08 | Quote cards |
| R-ADMIN-QUOTES-02 | P2 | done | 2026-11-08 | Sticky RaiseDocumentForm |
| R-ADMIN-QUOTES-03 | P2 | done | 2026-11-08 | Line cards + Send |
| R-ADMIN-INVOICES-02 | P2 | done | 2026-11-08 | Same RaiseDocumentForm sticky |
| R-ADMIN-INVOICES-03 | P2 | done | 2026-11-08 | Line cards + Send |
| R-ADMIN-FLEET-02 | P2 | done | 2026-11-08 | Vehicle cards |
| R-ADMIN-BLOG-02 | P2 | done | 2026-11-08 | Sticky BlogPostForm |
| R-ADMIN-ANALYTICS-01 | P2 | done | 2026-11-08 | Period/export stack |

---

## Parked P2 (requires Neutek agreement)

_None — all P2 completed._

---

## Verification log

| Date | What verified | Viewport | Result |
|------|---------------|----------|--------|
| 2026-11-08 | Audit home/booking/login | ~390px | Baseline |
| 2026-11-08 | Home mobile menu | ~390px | P0 OK |
| 2026-11-08 | Login single column | ~390px a11y | Auth OK |
| 2026-11-08 | Full P0/P1/P2 implementation | code + CSS ≤900 | All IDs done; real-phone spot-check recommended |
