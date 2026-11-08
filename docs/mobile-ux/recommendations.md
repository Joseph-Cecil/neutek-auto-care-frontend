# Neutek Auto Care — Mobile UX recommendations

**Product:** Neutek Auto Care (Ghana workshop: book → diagnose → quote approve → invoice/pay → pickup)  
**Repo:** `neutek-auto-care-frontend`  
**Stack:** Next.js App Router, `globals.css` + `nt-screens.css`, `AppShell` for portal/admin  
**Audit date:** 2026-11-08  
**Viewports:** ~390px and ~430px (phone-first)  
**Sources:** Code walk of every inventory route + live mobile check of `/home`, `/booking`, `/login` at 390px  

**Severity**

| Level | Meaning |
|-------|---------|
| **P0** | Blocks a core mobile task |
| **P1** | Painful / easy to fail the task |
| **P2** | Polish |

**ID convention:** `R-<AREA>-<TOPIC>-NN` — every ID appears in `plan.md` and `progress.md`.

---

## Cross-cutting

### R-X-LIST-01 — Shared mobile list pattern (tables → cards)

| | |
|--|--|
| **Scope** | All list pages that use `.tw` + `table.tbl` |
| **Problem** | Only mitigation is horizontal scroll (`.tw`). `th { white-space: nowrap }` forces wide min-width. No shared card/stack pattern. Portal bookings/vehicles already use cards — not reused elsewhere. |
| **Severity** | **P0** |
| **Recommendation** | Add a reusable presentational pattern (CSS + thin helpers): desktop keeps `.tbl`; ≤900px show stacked `.mlist` / `.mrow` cards with primary line, meta, status pill, and ≥44px Open/action. Prefer CSS dual-render or one component reused across portal + admin lists. |
| **Acceptance** | At 390/430px, priority list pages open a row without sideways page scroll; desktop tables unchanged. |

### R-X-TOUCH-01 — Touch targets for `.btn.sm` and dense actions

| | |
|--|--|
| **Scope** | Global `.btn.sm` (32px), table action cells, icon-only controls |
| **Problem** | `.btn.sm` is 32px — below ~44px comfort. Dense action cells pack Confirm/Cancel/Open into tiny hits. |
| **Severity** | **P1** |
| **Recommendation** | At ≤900px, raise `.btn.sm` min-height/min-width to ≥40–44px; give table/card primary actions full-width or spaced row; keep desktop density. |
| **Acceptance** | Primary list/detail actions on phone measure ≥40px tall; no overlapping hit boxes. |

### R-X-TABS-01 — Filter tab overflow affordance

| | |
|--|--|
| **Scope** | `.tabs` / `.tab` on bookings, jobs, quotes, invoices, blog, analytics |
| **Problem** | `overflow-x: auto` works but has no fade/scroll hint; admin invoices has **7** tabs. |
| **Severity** | **P1** |
| **Recommendation** | Keep horizontal scroll; add edge fade or “swipe for more” affordance; optional compact select on very narrow for 6+ tabs. |
| **Acceptance** | At 390px, all tabs reachable; user can tell there are more tabs off-screen. |

### R-X-KV-01 — Definition list (`.kv`) on narrow widths

| | |
|--|--|
| **Scope** | Detail pages, profile, vehicles, booking confirm, tracking |
| **Problem** | Fixed `grid-template-columns: 140px 1fr` squeezes values (VIN, long status text). |
| **Severity** | **P2** |
| **Recommendation** | At ≤480px, stack `.kv` to single column (label above value). |
| **Acceptance** | Long values wrap fully; no horizontal page scroll from `.kv`. |

### R-X-PAGEHEAD-01 — Dense pagehead + CTA wrap

| | |
|--|--|
| **Scope** | `.pagehead` across portal/admin |
| **Problem** | Title + 2–5 CTAs wrap into tall, cluttered headers; primary action can bury. |
| **Severity** | **P1** |
| **Recommendation** | On mobile: title/subtitle stack full width; primary CTA full-width or sticky when single primary task; secondary actions as text/ghost below or in overflow. |
| **Acceptance** | Primary action visible without hunting; pagehead doesn’t force sideways scroll. |

### R-X-MODAL-01 — Modals / drawers vs keyboard & thumb reach

| | |
|--|--|
| **Scope** | `.dlg`, `.drawer`, approve/pay/create flows |
| **Problem** | Long forms + sticky keyboard can cover CTAs; some dialogs centered with limited max-height handling. |
| **Severity** | **P1** |
| **Recommendation** | Mobile dialogs: near-full-sheet, scrollable body, sticky footer actions; ensure safe-area padding; Escape/scrim still close. |
| **Acceptance** | On 390px with soft keyboard (or simulated), primary Submit/Approve remains tappable after scroll. |

### R-X-STATES-01 — Loading / empty / error consistency

| | |
|--|--|
| **Scope** | Lists and details |
| **Problem** | Mixed muted text vs `.empty`; some errors only in banners. |
| **Severity** | **P2** |
| **Recommendation** | Prefer `.empty` + short retry for lists; keep skeleton/`TopProgress` patterns. |
| **Acceptance** | Empty and error states readable and centered on phone without overflow. |

### R-X-SAFE-01 — Safe-area and sticky CTA padding

| | |
|--|--|
| **Scope** | Shell page bottom, public sticky CTAs, mobile drawers |
| **Problem** | Page padding ends at 48px; no `env(safe-area-inset-*)` for notched phones. |
| **Severity** | **P2** |
| **Recommendation** | Add safe-area padding to shell page, pubbar, sticky footers, sidebar. |
| **Acceptance** | Content/CTAs clear home indicator on iOS-like safe areas (CSS verified). |

---

## Shell & foundations

### R-SHELL-NAV-01 — Off-canvas sidebar open/close, scrim, focus

| | |
|--|--|
| **Path** | Portal + Admin via `AppShell` |
| **Job** | Navigate between areas on phone |
| **Problem** | Drawer + scrim exist; collapse control hidden on mobile (good). Missing: focus trap / return focus to menu button; body scroll lock while open; Escape to close drawer. |
| **Severity** | **P1** |
| **Recommendation** | On `mobileOpen`: lock body scroll, Escape closes, focus first nav link (or trap), restore focus to menu button on close; keep badge `.cnt` visible. |
| **Acceptance** | Open/close reliable; scrim dismisses; Escape works; badges visible in drawer at 390px. |

### R-SHELL-TOP-01 — Topbar crowding (search / bell / account)

| | |
|--|--|
| **Path** | All AppShell pages |
| **Job** | Search, notifications, account |
| **Problem** | Search input forced to **140px** at ≤900px; crumbs + menu + search + bell + avatar compete; popovers may clip. |
| **Severity** | **P0** |
| **Recommendation** | Mobile: icon-button opens full-width search sheet/popover (not tiny inline input); hide or truncate crumbs to last segment; keep bell + avatar ≥40px; search pop full viewport width. |
| **Acceptance** | At 390px topbar has no overflow; search usable (≥280px effective field); bell/account not clipped. |

### R-SHELL-CRUMB-01 — Breadcrumb truncation

| | |
|--|--|
| **Path** | AppShell crumbs |
| **Job** | Orient + go up |
| **Problem** | Multi-segment crumbs wrap/truncate poorly beside menu button. |
| **Severity** | **P2** |
| **Recommendation** | ≤900px: show last crumb (and optional Back) only. |
| **Acceptance** | Crumbs don’t push actions off-screen. |

---

## Public

### R-PUB-ROOT-01 — `/`

| | |
|--|--|
| **Path** | `/` |
| **Job** | Land on marketing home |
| **Problem** | Redirect only — no UI. |
| **Severity** | — (N/A) |
| **Recommendation** | Keep redirect; no mobile work. |
| **Acceptance** | `/` → `/home`. |

### R-PUB-HOME-01 — Marketing home missing mobile nav

| | |
|--|--|
| **Path** | `/home` |
| **Job** | Learn value; reach Book / Track / Services / Sign in |
| **Problem** | At ≤900px, `.mk .nav .links` and `.hide` remove section links and Sign in; **no hamburger** (unlike `PublicNavbar`). Verified at 390px: only logo + “Book service”. |
| **Severity** | **P0** |
| **Recommendation** | Add mobile menu to `/home` (reuse pubmenu pattern or share component): Services, Check booking, Track, Blog, Sign in / Account + Book CTA. |
| **Acceptance** | At 390/430px all primary public destinations reachable from home header. |

### R-PUB-HOME-02 — Hero CTA row crowding

| | |
|--|--|
| **Path** | `/home` |
| **Job** | Start Book or Track |
| **Problem** | “Book a service” + “Track a car” sit side-by-side; tight on ~390px. |
| **Severity** | **P2** |
| **Recommendation** | Stack CTAs full-width under ~480px. |
| **Acceptance** | Both CTAs full-width, ≥44px, no edge collision. |

### R-PUB-NAV-01 — Public chrome: Sign in hidden on mobile

| | |
|--|--|
| **Path** | `/services`, `/booking`, `/booking/status`, `/tracking`, `/tracking/[jobNumber]`, `/blog`, `/blog/[slug]` |
| **Job** | Sign in / open account from any public page |
| **Problem** | `PublicNavbar` puts Sign in / Open my account in `.hide` (hidden ≤800px); mobile menu links omit Sign in. |
| **Severity** | **P1** |
| **Recommendation** | Include Sign in / Open my account inside the open `pubnav` menu (and/or keep a compact account icon). |
| **Acceptance** | From `/booking` at 390px, user can open Sign in without knowing the URL. |

### R-PUB-SERVICES-01 — `/services` card row crowding

| | |
|--|--|
| **Path** | `/services` |
| **Job** | Browse services → book with `?service=` |
| **Problem** | `.pcard` packs description + pill + Book; can crowd when wrapped. Fixed `h1` 36px. |
| **Severity** | **P2** |
| **Recommendation** | Stack meta/pill above Book on narrow; optional `clamp` on title. |
| **Acceptance** | Each service Book control ≥44px; no horizontal overflow. |

### R-PUB-BOOK-01 — `/booking` wizard step chrome

| | |
|--|--|
| **Path** | `/booking` |
| **Job** | Complete 4-step booking |
| **Problem** | Four `nowrap` step pills at once clutter the header; Continue can sit awkwardly with long service lists. |
| **Severity** | **P1** |
| **Recommendation** | Compact progress (“Step 2 of 4 · Date”) + sticky bottom Continue/Back on mobile; keep full pills on desktop. |
| **Acceptance** | At 390px, current step obvious; Continue always reachable without hunting; no horizontal page scroll. |

### R-PUB-BOOK-02 — `/booking/status` header pill crunch

| | |
|--|--|
| **Path** | `/booking/status` |
| **Job** | Look up booking by number + phone last 4 |
| **Problem** | Result header `row sb` with long status pill (`Waiting for workshop confirmation`) + nowrap pressure. |
| **Severity** | **P1** |
| **Recommendation** | Stack number and status; allow pill wrap. |
| **Acceptance** | Status fully readable; no sideways scroll. |

### R-PUB-TRACK-01 — `/tracking` lookup form

| | |
|--|--|
| **Path** | `/tracking` |
| **Job** | Enter job number + last 4 → detail |
| **Problem** | Generally OK; long hint text only. |
| **Severity** | **P2** |
| **Recommendation** | Ensure primary submit full-width on mobile; tighten hint. |
| **Acceptance** | Form usable one-handed; submit ≥44px. |

### R-PUB-TRACK-02 — `/tracking/[jobNumber]` timeline layout

| | |
|--|--|
| **Path** | `/tracking/[jobNumber]` |
| **Job** | See job status steps + timestamps |
| **Problem** | `.tl li` keeps step name, “Current” pill, and date on one flex row — overflow / tiny timestamps. |
| **Severity** | **P1** |
| **Recommendation** | Mobile: stack label+pill; put `.when` on second line. |
| **Acceptance** | All 8 steps readable at 390px without horizontal scroll. |

### R-PUB-BLOG-01 — `/blog` search + filters

| | |
|--|--|
| **Path** | `/blog` |
| **Job** | Find and open articles |
| **Problem** | Search input `maxWidth: 320` doesn’t flex; category pills make a tall band. |
| **Severity** | **P2** |
| **Recommendation** | `flex: 1` search; keep pill wrap. |
| **Acceptance** | Search field uses available width; cards single-column. |

### R-PUB-BLOG-02 — `/blog/[slug]` content overflow

| | |
|--|--|
| **Path** | `/blog/[slug]` |
| **Job** | Read article |
| **Problem** | Raw HTML without `img/table { max-width: 100% }` / prose constraints. |
| **Severity** | **P2** |
| **Recommendation** | Add article content CSS: images/tables max 100%, word-break for URLs. |
| **Acceptance** | Typical post doesn’t cause page-level horizontal scroll. |

### R-PUB-FOOTER-01 — Public footer columns

| | |
|--|--|
| **Path** | Public layout footer + home footer |
| **Job** | Contact / hours |
| **Problem** | `row sb` three columns wrap unevenly. |
| **Severity** | **P2** |
| **Recommendation** | Stack footer blocks under ~600px. |
| **Acceptance** | Address/phone/hours readable stacked. |

---

## Auth

### R-AUTH-LAYOUT-01 — Split layout mobile behavior

| | |
|--|--|
| **Path** | `/login`, `/register`, `/forgot-password`, `/reset-password` |
| **Job** | Authenticate |
| **Problem** | Split visual intended hidden &lt;960px; verify single-column card padding and branding remain clear (no wasted split remnant). |
| **Severity** | **P1** |
| **Recommendation** | Confirm/fix auth CSS so ≤960px is single column, brand + card centered, adequate top padding; no empty navy column. |
| **Acceptance** | At 390/430px only form column; logo + Sign in above fold without sideways waste. |

### R-AUTH-LOGIN-01 — `/login` action row

| | |
|--|--|
| **Path** | `/login` |
| **Job** | Sign in |
| **Problem** | Forgot + Submit in `row sb` — primary not full-width. |
| **Severity** | **P2** |
| **Recommendation** | Stack: full-width Sign in; Forgot as text link above/below. |
| **Acceptance** | Sign in full-width ≥44px at 390px. |

### R-AUTH-REGISTER-01 — `/register` dual CTAs

| | |
|--|--|
| **Path** | `/register` |
| **Job** | Create account |
| **Problem** | Back + Create in `row end` can crowd; long form + keyboard. |
| **Severity** | **P2** |
| **Recommendation** | Full-width Create; Back as text/ghost above; ensure password strength readable. |
| **Acceptance** | Create account easily tappable; no horizontal overflow with errors. |

### R-AUTH-FORGOT-01 — `/forgot-password`

| | |
|--|--|
| **Path** | `/forgot-password` |
| **Job** | Request reset |
| **Problem** | Same dual-button row pattern. |
| **Severity** | **P2** |
| **Recommendation** | Full-width primary; secondary as link. |
| **Acceptance** | Single-column form, primary full-width. |

### R-AUTH-RESET-01 — `/reset-password`

| | |
|--|--|
| **Path** | `/reset-password` |
| **Job** | Set new password |
| **Problem** | Dual CTAs; missing-token messaging vs form coexistence. |
| **Severity** | **P2** |
| **Recommendation** | Same CTA treatment as register; if token missing, show only recovery message + link. |
| **Acceptance** | Clear state; primary full-width when form shown. |

---

## Customer portal

### R-PORTAL-DASH-01 — `/portal/dashboard`

| | |
|--|--|
| **Path** | `/portal/dashboard` |
| **Job** | Snapshot + book / open jobs |
| **Problem** | Job number links are small tap targets; notification titles only (not full-row). |
| **Severity** | **P2** |
| **Recommendation** | Make job/notification rows full-card tap (≥44px) with clear Open. |
| **Acceptance** | Tap anywhere on a job/notification card opens detail. |

### R-PORTAL-BOOKINGS-01 — `/portal/bookings`

| | |
|--|--|
| **Path** | `/portal/bookings` |
| **Job** | List bookings; book or check status |
| **Problem** | Already card-based (good). Pagehead 3 CTAs + 5 tabs; card `row sb` can squeeze pill + Details. |
| **Severity** | **P2** |
| **Recommendation** | Apply R-X-PAGEHEAD / R-X-TABS; ensure Details ≥44px; optional whole-card tap. |
| **Acceptance** | Cards usable at 390px; Details easy to hit. |

### R-PORTAL-JOBS-01 — `/portal/jobs` table without easy open

| | |
|--|--|
| **Path** | `/portal/jobs` |
| **Job** | Filter and open jobs |
| **Problem** | `.tbl` + tabs; **no `tr.click`**; only small job-number link; no Open column. |
| **Severity** | **P1** |
| **Recommendation** | Apply R-X-LIST-01: mobile cards + Open; desktop keep table with clickable rows or Open. |
| **Acceptance** | Open a job at 390px without horizontal scroll or tiny link hunting. |

### R-PORTAL-JOBS-02 — `/portal/jobs/[id]` detail density

| | |
|--|--|
| **Path** | `/portal/jobs/[id]` |
| **Job** | Track job, rate, live tracking |
| **Problem** | Dense pagehead; progress `row sb` cramped; rating uses `.btn.sm`. |
| **Severity** | **P2** |
| **Recommendation** | Stack header meta; larger star targets; apply R-X-KV. |
| **Acceptance** | Live tracking + rating usable with thumb; no overflow. |

### R-PORTAL-VEHICLES-01 — `/portal/vehicles`

| | |
|--|--|
| **Path** | `/portal/vehicles` |
| **Job** | Manage vehicles |
| **Problem** | Cards good; three `.btn.sm` per card tight; modal forms OK. |
| **Severity** | **P2** |
| **Recommendation** | Stack card actions or icon+label with ≥40px hits; apply R-X-MODAL. |
| **Acceptance** | Edit/Remove/Service history all tappable without mis-tap. |

### R-PORTAL-QUOTES-01 — `/portal/quotes` wide table

| | |
|--|--|
| **Path** | `/portal/quotes` |
| **Job** | Find and review quotes |
| **Problem** | 6-column table → heavy horizontal scroll despite `tr.click` + Review/Open (keep these). |
| **Severity** | **P1** |
| **Recommendation** | Mobile card list showing number, vehicle/job, total, status, Review/Open ≥44px; keep desktop table + clickable rows. |
| **Acceptance** | At 390/430px open/review without page sideways scroll; desktop unchanged. |

### R-PORTAL-QUOTES-02 — `/portal/quotes/[id]` approve path

| | |
|--|--|
| **Path** | `/portal/quotes/[id]` |
| **Job** | Approve or reject quote |
| **Problem** | Line-item table scrolls; Approve/Reject may not stay thumb-reachable. |
| **Severity** | **P0** |
| **Recommendation** | Mobile line items as stacked rows; sticky bottom Approve (and Reject secondary) when status=`sent`; apply R-X-MODAL if reject needs reason. |
| **Acceptance** | Core flow: open quote → see totals → approve/reject without horizontal page scroll; CTAs visible. |

### R-PORTAL-INVOICES-01 — `/portal/invoices` wide table

| | |
|--|--|
| **Path** | `/portal/invoices` |
| **Job** | Find invoices; pay |
| **Problem** | 6-column table + Pay/open; same scroll pain as quotes. |
| **Severity** | **P1** |
| **Recommendation** | Mobile cards with amount due, status, Pay/open ≥44px; keep row click desktop. |
| **Acceptance** | Pay/open reachable at 390px without sideways scroll. |

### R-PORTAL-INVOICES-02 — `/portal/invoices/[id]` pay CTA

| | |
|--|--|
| **Path** | `/portal/invoices/[id]` |
| **Job** | Pay invoice (Paystack) |
| **Problem** | Line table scrolls; Pay in pagehead good but can compete with PDF; keyboard/scroll risk. |
| **Severity** | **P0** |
| **Recommendation** | Sticky/full-width Pay when payable; mobile line stack; PDF secondary. |
| **Acceptance** | Payable invoice shows clear Pay at 390/430px without hunting; no page horizontal scroll. |

### R-PORTAL-NOTIF-01 — `/portal/notifications`

| | |
|--|--|
| **Path** | `/portal/notifications` |
| **Job** | Read / mark notifications; jump to entity |
| **Problem** | Mark read is small ghost; title-only navigation. |
| **Severity** | **P1** |
| **Recommendation** | Full-row tap opens linked entity; Mark read ≥40px or swipe/secondary. |
| **Acceptance** | Notifications open jobs/quotes/invoices without relying only on topbar bell. |

### R-PORTAL-PROFILE-01 — `/portal/profile`

| | |
|--|--|
| **Path** | `/portal/profile` |
| **Job** | Edit profile & password |
| **Problem** | Avatar row overflows; forms mostly OK. |
| **Severity** | **P2** |
| **Recommendation** | Stack avatar/actions; full-width Save. |
| **Acceptance** | Profile editable without horizontal overflow. |

---

## Admin / workshop

### R-ADMIN-DASH-01 — `/admin/dashboard`

| | |
|--|--|
| **Path** | `/admin/dashboard` |
| **Job** | Workshop KPIs |
| **Problem** | Many metric cards → long scroll; secondary links `.btn.sm`. |
| **Severity** | **P2** |
| **Recommendation** | 2-col metric grid on phone; larger deep-links. |
| **Acceptance** | Metrics readable; no horizontal scroll. |

### R-ADMIN-BOOKINGS-01 — `/admin/bookings` table + actions

| | |
|--|--|
| **Path** | `/admin/bookings` |
| **Job** | Confirm/cancel; open jobs |
| **Problem** | 6-col table + Confirm/Cancel/Open job `.btn.sm` — extreme scroll; no row navigation. |
| **Severity** | **P1** |
| **Recommendation** | Mobile cards with status + primary actions stacked ≥44px; keep cancel modal. |
| **Acceptance** | Confirm/cancel/open job at 390px without horizontal page scroll. |

### R-ADMIN-JOBS-01 — `/admin/jobs` list

| | |
|--|--|
| **Path** | `/admin/jobs` |
| **Job** | Search/filter; open/create jobs |
| **Problem** | Filters tall; table 5 cols — scroll; `tr.click` helps. |
| **Severity** | **P2** |
| **Recommendation** | Mobile card list (or compact rows); collapsible filters. |
| **Acceptance** | Open job without sideways scroll; filters usable. |

### R-ADMIN-JOBS-02 — `/admin/jobs/create`

| | |
|--|--|
| **Path** | `/admin/jobs/create` |
| **Job** | Intake job |
| **Problem** | Long form acceptable; back links small; native selects with long labels. |
| **Severity** | **P2** |
| **Recommendation** | Sticky Save/Create; full-width fields; apply R-X-MODAL if needed. |
| **Acceptance** | Create completable on 390px without lost CTAs. |

### R-ADMIN-JOBS-03 — `/admin/jobs/[id]` status action row

| | |
|--|--|
| **Path** | `/admin/jobs/[id]` |
| **Job** | Advance job; open finance |
| **Problem** | Many status `.btn.sm` in a row → mis-taps; history table scrolls. |
| **Severity** | **P1** |
| **Recommendation** | Mobile: primary next-status full-width; other transitions in menu/sheet; stack finance links. |
| **Acceptance** | Most common status change is one clear tap; no horizontal page scroll. |

### R-ADMIN-SCHEDULE-01 — `/admin/schedule` matrix unusable

| | |
|--|--|
| **Path** | `/admin/schedule` |
| **Job** | Assign techs / view week |
| **Problem** | Tech × day matrix table unusable on phone. |
| **Severity** | **P0** |
| **Recommendation** | Mobile alternate: day picker + per-tech card list / agenda; keep matrix desktop. Unassigned jobs as cards with Assign. |
| **Acceptance** | At 390px, view a day and assign without relying on wide matrix; no page-level sideways scroll required for core assign. |

### R-ADMIN-CUSTOMERS-01 — `/admin/customers`

| | |
|--|--|
| **Path** | `/admin/customers` |
| **Job** | Find customer; drawer detail |
| **Problem** | Table scrolls; drawer pattern is good. |
| **Severity** | **P2** |
| **Recommendation** | Mobile cards + keep drawer; apply R-X-LIST. |
| **Acceptance** | Open customer drawer without sideways scroll. |

### R-ADMIN-QUOTES-01 — `/admin/quotes`

| | |
|--|--|
| **Path** | `/admin/quotes` |
| **Job** | Browse/send quotes |
| **Problem** | 6 tabs + 5-col table; clickable rows OK. |
| **Severity** | **P2** |
| **Recommendation** | Mobile cards + R-X-TABS. |
| **Acceptance** | Open quote at 390px without horizontal page scroll. |

### R-ADMIN-QUOTES-02 — `/admin/quotes/create`

| | |
|--|--|
| **Path** | `/admin/quotes/create` |
| **Job** | Raise quote |
| **Problem** | `RaiseDocumentForm` long; line grids OK when stacked. |
| **Severity** | **P2** |
| **Recommendation** | Sticky submit; ensure line editors stack cleanly. |
| **Acceptance** | Create quote on phone without lost primary CTA. |

### R-ADMIN-QUOTES-03 — `/admin/quotes/[id]`

| | |
|--|--|
| **Path** | `/admin/quotes/[id]` |
| **Job** | Send quote; view lines |
| **Problem** | Line table scroll; Send in pagehead. |
| **Severity** | **P2** |
| **Recommendation** | Mobile line stack; sticky Send when draft. |
| **Acceptance** | Send reachable; lines readable without page sideways scroll. |

### R-ADMIN-INVOICES-01 — `/admin/invoices` tabs + table

| | |
|--|--|
| **Path** | `/admin/invoices` |
| **Job** | Browse invoices |
| **Problem** | **7 tabs** + 6-col table — worst tab overflow. |
| **Severity** | **P1** |
| **Recommendation** | R-X-LIST cards + R-X-TABS (consider select for status on mobile). |
| **Acceptance** | Filter + open invoice at 390px without horizontal page scroll. |

### R-ADMIN-INVOICES-02 — `/admin/invoices/create`

| | |
|--|--|
| **Path** | `/admin/invoices/create` |
| **Job** | Raise invoice |
| **Problem** | Same as quote create. |
| **Severity** | **P2** |
| **Recommendation** | Same as R-ADMIN-QUOTES-02. |
| **Acceptance** | Create invoice CTAs reachable on phone. |

### R-ADMIN-INVOICES-03 — `/admin/invoices/[id]`

| | |
|--|--|
| **Path** | `/admin/invoices/[id]` |
| **Job** | Send / PDF |
| **Problem** | Line table scroll. |
| **Severity** | **P2** |
| **Recommendation** | Mobile line stack; sticky Send. |
| **Acceptance** | Detail usable at 390px. |

### R-ADMIN-PAYMENTS-01 — `/admin/payments`

| | |
|--|--|
| **Path** | `/admin/payments` |
| **Job** | Ledger + record payment |
| **Problem** | 6-col table; no row click; Record modal OK. |
| **Severity** | **P1** |
| **Recommendation** | Mobile cards; keep Record payment modal with R-X-MODAL. |
| **Acceptance** | Browse + record payment at 390px without page sideways scroll. |

### R-ADMIN-SERVICES-01 — `/admin/services`

| | |
|--|--|
| **Path** | `/admin/services` |
| **Job** | Manage catalog |
| **Problem** | 6 cols + inline deactivate confirm with multiple controls in cell. |
| **Severity** | **P1** |
| **Recommendation** | Mobile cards; confirm in dialog not in-cell. |
| **Acceptance** | Edit/deactivate without horizontal scroll or tiny multi-control cells. |

### R-ADMIN-FLEET-01 — `/admin/fleet`

| | |
|--|--|
| **Path** | `/admin/fleet` |
| **Job** | Open fleet accounts |
| **Problem** | 6-col credit table; clickable rows help. |
| **Severity** | **P1** |
| **Recommendation** | Mobile cards with credit snapshot + Open. |
| **Acceptance** | Open fleet detail at 390px without sideways scroll. |

### R-ADMIN-FLEET-02 — `/admin/fleet/[id]`

| | |
|--|--|
| **Path** | `/admin/fleet/[id]` |
| **Job** | Credit + vehicles |
| **Problem** | g4 figs OK; vehicles table scrolls. |
| **Severity** | **P2** |
| **Recommendation** | Vehicle cards on mobile. |
| **Acceptance** | Vehicles list readable; add vehicle modal OK. |

### R-ADMIN-INVENTORY-01 — `/admin/inventory` ultra-wide table

| | |
|--|--|
| **Path** | `/admin/inventory` |
| **Job** | Parts shelf, restock, add |
| **Problem** | ~8 columns + in-cell +5/+10 — among worst. |
| **Severity** | **P0** |
| **Recommendation** | Mobile cards: name, stock, status, Restock actions; keep table desktop. |
| **Acceptance** | Check stock and restock at 390px without page sideways scroll. |

### R-ADMIN-BLOG-01 — `/admin/blog`

| | |
|--|--|
| **Path** | `/admin/blog` |
| **Job** | Manage posts |
| **Problem** | Actions cell packs View/Edit/Delete. |
| **Severity** | **P1** |
| **Recommendation** | Mobile cards with stacked actions. |
| **Acceptance** | Edit/delete at 390px without horizontal scroll. |

### R-ADMIN-BLOG-02 — `/admin/blog/create` & `/admin/blog/[id]`

| | |
|--|--|
| **Path** | `/admin/blog/create`, `/admin/blog/[id]` |
| **Job** | Author post |
| **Problem** | Long form; mostly stacks. |
| **Severity** | **P2** |
| **Recommendation** | Sticky Save/Publish; full-width fields. |
| **Acceptance** | Save reachable; no overflow. |

### R-ADMIN-MESSAGES-01 — `/admin/messages`

| | |
|--|--|
| **Path** | `/admin/messages` |
| **Job** | Templates + sent log |
| **Problem** | Templates already cards (good); channel toggles wrap; log table 5-col. |
| **Severity** | **P1** (log) / **P2** (templates) — track as **P1** for log |
| **Recommendation** | Fix template header wrap; mobile cards for log. |
| **Acceptance** | Templates editable; log readable without sideways scroll. |

### R-ADMIN-REMINDERS-01 — `/admin/reminders`

| | |
|--|--|
| **Path** | `/admin/reminders` |
| **Job** | Rules + send reminders |
| **Problem** | 6-col table + Send `.btn.sm`. |
| **Severity** | **P1** |
| **Recommendation** | Mobile cards + larger Send. |
| **Acceptance** | Send reminder at 390px without horizontal page scroll. |

### R-ADMIN-FEEDBACK-01 — `/admin/feedback` in-table reply

| | |
|--|--|
| **Path** | `/admin/feedback` |
| **Job** | Review / feature / reply |
| **Problem** | Reply textarea + buttons **inside table cells** — broken on mobile. |
| **Severity** | **P0** |
| **Recommendation** | Card list; reply in dialog/sheet, not in-cell. |
| **Acceptance** | Read and reply at 390px without horizontal page scroll. |

### R-ADMIN-ANALYTICS-01 — `/admin/analytics`

| | |
|--|--|
| **Path** | `/admin/analytics` |
| **Job** | Charts + export |
| **Problem** | Tabs + Export cramped in pagehead; charts mostly OK. |
| **Severity** | **P2** |
| **Recommendation** | Stack tabs/export; keep responsive charts. |
| **Acceptance** | Charts fit width; controls usable. |

### R-ADMIN-USERS-01 — `/admin/users`

| | |
|--|--|
| **Path** | `/admin/users` |
| **Job** | Invite/delete users |
| **Problem** | Table + tiny Delete; invite modal OK. |
| **Severity** | **P1** |
| **Recommendation** | Mobile cards; Delete confirmed in dialog with adequate targets. |
| **Acceptance** | Invite/delete completable at 390px without sideways scroll. |

---

## Out of inventory (explicit skip)

| Path | Note |
|------|------|
| `/design-foundation` | Token reference only — no polish budget |

---

## Priority rollup

| Severity | Count (approx) | Highest leverage |
|----------|----------------|------------------|
| **P0** | 8 | Shell search crowding; home nav; list→card foundation; portal quote approve & invoice pay; admin schedule, inventory, feedback |
| **P1** | ~28 | Public sign-in in menu; booking/tracking; portal jobs/quotes/invoices/notif; admin bookings/jobs detail/invoices/payments/services/fleet/blog/messages/reminders/users; shell drawer a11y; touch/tabs/pagehead/modals |
| **P2** | ~30 | Polish: kv, safe-area, footers, auth CTAs, dashboards, create forms |

**Core mobile flows to protect**

1. Book → Track  
2. Sign in  
3. Approve quote  
4. Open invoice / pay  
5. Notifications → entity  

---

## Pattern keep-list (do not regress)

- Portal quotes/invoices: clickable rows + Open/Review/Pay buttons  
- Sidebar badges for actionable counts  
- Portal bookings & vehicles card layouts  
- Admin customers drawer  
- Admin messages template cards  
- Public `PublicNavbar` hamburger (extend; don’t remove)  
- Neutek navy `#081F41` + existing CSS tokens — no new purple/generic theme  
