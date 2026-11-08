# API contracts

Phase 0 created or changed no contract. This is the baseline the redesign must keep, plus the prototype gaps that do not have a module yet.

Base path: `/api/v1`. Source: `nuetek-auto-care/neutek-api/src`. Auth is a Bearer access JWT unless noted. Refresh token is an httpOnly cookie named `refreshToken`, path `/api/v1/auth`.

Outside `/api/v1`: `GET /health/live`, `GET /health/ready`, `GET /health`, `GET /metrics` (token outside dev/test). Swagger `/api-docs` when `NODE_ENV` is not production.

Roles: `customer`, `technician`, `admin`, `super_admin`. Staff is technician, admin, and super_admin. Customer routes are scoped to the caller's customer row.

## Existing modules

| Module | Methods and paths | Who |
|---|---|---|
| Auth | `POST /auth/register`, `/login`, `/refresh`, `/logout`, `/forgot-password`, `/reset-password`, `/verify-email`. `POST /auth/change-password`, `GET /auth/me` | Public except change-password and me. Refresh and logout use the cookie |
| Users | `GET /users`, `GET/PATCH /users/me`, `PATCH /users/me/avatar`, `GET /users/:id`, `DELETE /users/:id` | Bearer. List and get are admin or super_admin. Delete is super_admin |
| Customers | `GET/POST /customers`, `GET /customers/me`, `GET/PATCH/DELETE /customers/:id` | Bearer. List, create, update are staff. Delete is admin or super_admin |
| Vehicles | `GET/POST /vehicles`, `GET /vehicles/customer/:customerId`, `GET/PATCH/DELETE /vehicles/:id` | Bearer. Ownership in the controller. `GET /vehicles` accepts optional `search` |
| Services | `GET /services/categories`, `GET /services`, `GET /services/:id`, `POST/PATCH/DELETE /services` and `/:id` | Reads public. Writes admin or super_admin |
| Bookings | `POST /bookings`, `GET /bookings`, `GET/PATCH /bookings/:id`, `POST /bookings/:id/cancel` | Create is public, optional auth. Patch is staff |
| Jobs | `GET/POST /jobs`, `GET /jobs/number/:jobNumber`, `GET/PATCH /jobs/:id`, `GET /jobs/:id/history`, `POST /jobs/:id/transition` | Bearer. Create, patch, and transition are staff. `GET /jobs` accepts optional `search` |
| Quotes | `GET/POST /quotes`, `GET /quotes/:id`, `POST /quotes/:id/approve`, `/reject`, `/send` | Bearer. Create and send are staff. Approve and reject are the owning customer |
| Invoices | `GET/POST /invoices`, `POST /invoices/:id/send`, `GET /invoices/:id` | Bearer. Create and send are staff |
| Payments | `POST /payments/webhook`, `GET /payments`, `GET /payments/:id`, `POST /payments/record`, `POST /payments/initialize` | Webhook is Paystack signature, not JWT. Record is staff. Initialize is the owning customer |
| Tracking | `GET /tracking/:jobNumber`, `GET /tracking/token/:trackingToken` | Public, rate limited |
| Diagnostics | `GET /diagnostics/job/:jobId`, `POST /diagnostics`, `POST /diagnostics/:id/photos`, `DELETE /diagnostics/:id/photos/:photoId` | Bearer. Writes are staff |
| Notifications | `GET /notifications`, `PATCH /notifications/:id/read`, `POST /notifications/mark-all-read` | Bearer. No separate staff feed was found |
| Blog | `GET /blog/categories`, `GET /blog`, `GET /blog/:slug`, `POST /blog`, `PATCH/DELETE /blog/:id` | Reads public. Writes admin or super_admin |
| Fleet | `GET/POST /fleet`, `GET/PATCH /fleet/:id`, `GET/POST /fleet/:id/vehicles` | Bearer, admin or super_admin only. Technicians are not included |
| Analytics | `GET /analytics/dashboard`, `/revenue`, `/jobs`, `/services`, `/technicians` | Bearer, admin or super_admin. Technicians are not included |
| Uploads | `POST /uploads/presign`, `POST /uploads/confirm` | Bearer |

Socket.IO is not REST. Handshake requires an access JWT. Events: `join:job`, `leave:job`, server `job:updated`. Staff may join any job room. A customer may join only their job.

Money in the prototype is integer pesewas displayed as GHS. Do not document a second currency. Field-level shapes stay in the Zod schemas until a phase changes them. When a phase changes a request or response, add the before/after to this file in that phase.

## Frontend calls that do not match a clean contract

Recorded so later phases do not "fix" them silently:

- Admin blog edit calls `GET /blog/:slug` with the post id (`blog.dal` has no get-by-id). Update and delete correctly use `/blog/:id`.
- `payment` initialize is typed two ways (`authorization_url` nested, and `authorizationUrl`). The portal reads both.
- `GET /vehicles`, quote create, invoice create, and the diagnostics DAL exist on the client and have no page.
- Public tracking uses `/tracking/:jobNumber`, not `/jobs/number/:jobNumber`.

## Prototype behavior with no module yet

Do not invent these routes in Phase 0. The phase that builds one documents it here first.

| Prototype surface | Backend today |
|---|---|
| Message templates, SMS/WhatsApp toggles, delivery log | Phase 7. `GET/PATCH /messages/templates` and `GET /messages/deliveries`. A test is recorded and not sent |
| Service reminder board and rules | Phase 7. `GET/POST /reminders`, send, and settings. The scheduler flag stays off |
| Follow-up | Follow-up scheduler behind `FEATURE_FOLLOW_UP_SCHEDULER` |
| Inventory, stock, suppliers | Phase 7. `GET/POST /inventory`, receive, and restock-low. Admin or super_admin |
| Technician week schedule and bays | Phase 7. `GET /schedule`, `POST /schedule/assign`, `PATCH /schedule/bays/:id`. Admin or super_admin. Technicians cannot assign |
| Inspection checklist (OK / Watch / Fix, send to customer) | Diagnostics reports and photos exist. Not the checklist model |
| Star rating, staff reply, "show on website" | No module. Marketing testimonials are hardcoded |
| Invoice PDF download | PDFKit worker and outbox kind exist. No customer download route was found in the route list |
| Analytics CSV export | Toast only in the prototype. No export route found |
| In-app user invite | Phase 7. `POST /users/invite` creates a technician or admin. No email is sent |
| Staff notification feed distinct from the customer bell | Not found. Open question |

## Contracts changed

### Phase 6. Blog read by id

`GET /blog/id/:id` returns one post, including a draft. Admin or super_admin only. `GET /blog/:slug` is unchanged and still public. The admin editor uses the id route. A missing id is 404.

Public tracking was already `GET /tracking/:jobNumber?phoneLast4=`. The track form now sends those 4 digits. No new path.

### Phase 6. Service active flag and booking cancel reason

`PATCH /services/:id` accepts `isActive`. `false` deactivates a service and `true` reactivates it. The other update fields are unchanged. The admin services screen sends only that flag.

`POST /bookings/:id/cancel` now requires `{ "reason": "..." }`. A blank reason is 400. The reason is stored on `cancellation_reason`, and `cancelled_at` is set. A cancel with no body used to succeed and leave the reason empty.

`POST /quotes/:id/send` and `POST /invoices/:id/send` are called by the finance screens. Those handlers are in the uncommitted API working tree because they enqueue through the outbox. They are not part of the Phase 6 commits. A clean checkout of `d67a580` does not have them.

Checkout still uses `POST /payments/initialize`. The client accepts `authorizationUrl` or `authorization_url` in the response. No new path.

### Phase 7. Quote and invoice create screens

`POST /quotes` and `POST /invoices` are unchanged. The new screens send `jobId`, `lineItems` (`description`, `quantity`, `unitPricePesewas`), `taxPercent`, `discountPercent`, and `validDays` or `dueDays`. No new path.

### Phase 7. Invoice PDF link

No new download route. The invoice detail already returns `pdf_url`. The admin and portal screens show Download PDF only when that value starts with `http`. A storage key is not offered as a link. The PDF worker and the uncommitted signed-URL rewrite are not part of this change.

### Phase 7. Diagnostics on the job

`GET /diagnostics/job/:jobId` is unchanged. A missing report is 404, and the job page treats that as empty. `POST /diagnostics` is unchanged: staff send `jobId` and `findings`, with optional `recommendations`. No inspection checklist table.

### Phase 7. Feedback

`job_feedback` is new. One row per job.

| Route | Who | Body |
|---|---|---|
| `POST /feedback` | The customer who owns the job | `jobId`, `stars` 1–5, optional `comment` |
| `GET /feedback/job/:jobId` | That customer, or staff | None. 404 when the job has no rating |
| `GET /feedback` | Admin or super_admin | Query `page`, `limit`. Adds `summary` (`count`, `average`, `featured`, `distribution`) beside the page |
| `PATCH /feedback/:id` | Admin or super_admin | `featured` and/or `reply` |

A job can be rated only when its status is `completed` or `ready_for_pickup`. A second rating is 409. Staff cannot submit. A customer who does not own the job gets 404. Featuring a review does not change the marketing page.

### Phase 7. Service reminders

`service_reminders` and `reminder_settings` are new. Admin or super_admin only.

| Route | Body |
|---|---|
| `GET /reminders` | Query `page`, `limit`. Each row includes a display status. The response also has `summary` and `settings` |
| `POST /reminders` | `vehicleId`, `serviceName`, `basis`, `dueOn` (`YYYY-MM-DD`) |
| `POST /reminders/:id/send` | None. Marks that row sent |
| `POST /reminders/send-due` | None. Marks due and overdue rows sent |
| `PATCH /reminders/settings` | Any of `remindDaysBefore`, `remindAgain`, `whatsappThenSms` |

Display status is `booked` when the vehicle has a pending or confirmed booking from now on, otherwise `reminder_sent` after a send, otherwise `overdue`, `due_soon` (within 14 days while that rule is on), or `upcoming`. A booked or already sent row cannot be sent again. Send does not call WhatsApp, SMS, or email. `FEATURE_REMINDER_SCHEDULER` stays false. The committed scheduler still only logs. The prototype figure of 39 percent is not shown.

### Phase 7. Message templates and delivery log

`message_templates` and `message_deliveries` are new. Admin or super_admin only. The seven workshop templates are inserted by migration `023_message_templates.sql`. A test writes a delivery row and does not call the outbox, SMS, WhatsApp, or email. `FEATURE_REMINDER_SCHEDULER` and `FEATURE_FOLLOW_UP_SCHEDULER` stay false.

| Route | Body |
|---|---|
| `GET /messages/templates` | Query `page`, `limit`. Response adds `summary` (`automatic`, `total`) |
| `PATCH /messages/templates/:id` | Any of `body`, `sms`, `whatsapp`, `automatic`. A blank body is 400. An empty patch is 400 |
| `POST /messages/templates/:id/test` | None. Writes one delivery for the signed-in user |
| `GET /messages/deliveries` | Query `page`, `limit`. Response adds `summary` (`recordedThisWeek`, `delivered`) |

A delivery row is `channel: "none"` and `status: "recorded"`. `delivered` is always 0. The detail text says no SMS, WhatsApp, or email was sent. A missing template is 404. A customer or technician is 403.

### Phase 7. Inventory

`inventory_parts` is new. Admin or super_admin only. The table starts empty. The prototype's ten sample parts are not inserted.

| Route | Body |
|---|---|
| `GET /inventory` | Query `page`, `limit`, and `filter` `all` or `low`. `low` is `quantity <= minimum`. Response adds `summary` |
| `POST /inventory` | `name`, `sku`, `quantity`, `minimum`, `costPesewas`, `pricePesewas`, `supplier`. A duplicate SKU is 409 |
| `POST /inventory/:id/receive` | `quantity` above zero. Adds to the quantity on hand |
| `POST /inventory/restock-low` | None. Sets `quantity` to `minimum * 3` where `quantity <= minimum` and `minimum > 0` |

Each row includes `stock_status`: `out_of_stock` when quantity is 0, otherwise `low_stock` when quantity is at or below the minimum, otherwise `in_stock`. `summary` is `items`, `stockValuePesewas`, `averageMarginPercent` (null when the shelf has no selling value), `lowCount`, and `supplierCount`. A part whose minimum is 0 is not raised by restock-low. A missing part is 404. A customer or technician is 403.

### Phase 7. Schedule and bays

`workshop_bays` and `schedule_slots` are new. Admin or super_admin only. A technician is 403, including assign. Four bays are inserted by migration `025_schedule_bays.sql`.

| Route | Body |
|---|---|
| `GET /schedule` | None. The next six workshop days from today in `Africa/Accra`, skipping Sunday. Saturday capacity is 5 hours. Other days are 8 |
| `POST /schedule/assign` | `jobId`, `technicianId`. Sets the job technician and adds a 3 hour slot on the least busy day in that week. Ties pick the earlier day |
| `PATCH /schedule/bays/:id` | `jobId` or `null`. A job sits in one bay. `null` clears it |

An active job is not `completed`, `cancelled`, or `quote_rejected`. Unassigned jobs and the bay job list are capped at 100. A job that already has a technician cannot be assigned again from this route. A missing job, technician, or bay is 404. The prototype shows Assign on the technician schedule because `canAssign` is unused. This route does not.

### Phase 7. User invite

`POST /users/invite` is new. Admin or super_admin only. There is still no `POST /users`.

Body: `firstName`, `lastName`, `email`, `password`, `role` (`technician` or `admin`). The password uses the same rules as registration. A duplicate email is 409. A customer or technician caller is 403. `super_admin` and `customer` are not roles this route can create.

The response is the public user plus `emailed: false`. No email, reset link, or outbox message is sent. The account can sign in with the password the admin entered. `auth.service.ts` is not part of this change.

### Phase 5. Optional list search

`GET /jobs` and `GET /vehicles` accept an optional `search` query string. It is omitted the same way as before when the client does not send it. Customers stay scoped to their own rows.

| Route | Match |
|---|---|
| `GET /jobs?search=` | `job_number` or `customer_concern`, case-insensitive |
| `GET /vehicles?search=` | `license_plate`, case-insensitive |

`GET /customers?search=` already matched name, phone, and email. No new path was added. The bell still uses `GET /notifications`.
