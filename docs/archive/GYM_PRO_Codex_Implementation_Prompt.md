# GYM PRO — Complete Gym Management System Specification

> **Purpose:** Give this document to Codex CLI as the source of truth for building a production-ready management system for one existing gym with approximately 100–300 members.
>
> **Project type:** Single-gym application (not multi-tenant SaaS)  
> **Platform:** Responsive web application + installable PWA  
> **Attendance:** Secure QR-code check-in/check-out  
> **Payments:** Cash + manually verified UPI + Razorpay online payments  
> **Suggested stack:** Laravel 13, PHP 8.3+, MySQL 8, Blade, Bootstrap 5, Alpine.js

---

## 1. Instructions to Codex

Act as a senior Laravel architect, full-stack developer, database engineer, UI/UX designer, and QA engineer.

Build this application incrementally. Do not attempt to generate the entire system in one uncontrolled operation.

### Required working method

1. Inspect the current directory and installed PHP, Composer, Node.js, npm, and database versions before changing anything.
2. If the directory is empty, create the Laravel project. If it contains an existing project, inspect it and preserve useful work.
3. Check Laravel 13 and dependency compatibility with the installed environment. If Laravel 13 is incompatible, explain why and select a compatible supported version rather than silently breaking the environment.
4. Create `DEVELOPMENT_PROGRESS.md` and use it to track completed work, pending work, changed files, test results, known issues, and the next milestone.
5. Implement one milestone at a time.
6. Run relevant tests after each milestone; fix failures before moving forward.
7. Do not claim that a feature is complete unless it has been implemented and tested.
8. Do not fake payment success, QR validation, dashboard statistics, or notification delivery.
9. Ask for credentials only when required. Use `.env` variables and document setup steps; never commit secrets.
10. At the end of each milestone, summarize what changed, commands run, test results, and remaining work.

### Project principles

- Use a Laravel modular monolith. Microservices are unnecessary for this gym.
- Use Laravel conventions, Eloquent relationships, Form Requests, Policies, middleware, service classes, database transactions, queues, and scheduled tasks where appropriate.
- Keep controllers thin. Put important business rules in service classes.
- Use server-side authorization for every protected action. Hiding a menu item is not authorization.
- Use database migrations for schema changes.
- Use factories and seeders for realistic demo data.
- Avoid N+1 queries; use eager loading and pagination.
- Use decimal database columns for money, never floating-point money columns.
- Keep financial records auditable; do not hard-delete completed payment records.
- Store dates consistently and use the gym's configured timezone for business rules.
- Do not expose member documents or sensitive profile information publicly.

---

## 2. Product overview

Build **GYM PRO**, a professional system to digitize daily operations for one existing offline gym.

The system must provide:

- Gym administration dashboard.
- Receptionist workflow.
- Member registration and profiles.
- Membership plans, purchases, renewals, freezes, and expiry.
- Cash, UPI, and Razorpay payment records.
- Receipts and refunds.
- QR-based attendance.
- Trainer management and member assignments.
- Workout plans and diet plans.
- Member fitness progress.
- Expenses and financial reports.
- Enquiry management.
- Notifications and expiry reminders.
- Member self-service portal.
- Public gym website.
- Installable PWA.

### User roles

1. **Super Admin** — full system configuration and access.
2. **Gym Admin** — daily gym operations, staff, members, payments, reports, and settings.
3. **Receptionist** — member registration, membership operations, permitted payment collection, and attendance.
4. **Trainer** — assigned members, workout/diet plans, and progress.
5. **Member** — only their own profile, membership, QR, attendance, payments, plans, and progress.

A single gym is the initial deployment. Do not add tenant IDs or multi-tenant complexity unless explicitly requested later.

---

## 3. Technology choices

| Layer | Preferred technology |
|---|---|
| Backend | Laravel 13 (or compatible supported Laravel version if environment requires) |
| Runtime | PHP 8.3+ |
| Database | MySQL 8 |
| Templates | Blade |
| CSS/UI | Bootstrap 5 |
| JavaScript | Alpine.js and standard JavaScript |
| Authentication | Laravel-supported authentication scaffolding |
| Roles/permissions | Spatie Laravel Permission |
| Payments | Razorpay |
| QR | Maintained QR generation/scanning libraries compatible with project |
| Charts | Chart.js |
| PDF receipts | DomPDF or compatible maintained package |
| Excel | Laravel Excel or compatible maintained package |
| PWA | Web App Manifest + Service Worker |
| Tests | Pest or PHPUnit |
| Web server | Nginx + PHP-FPM |
| Source control | Git |

Before installing a package, check its maintenance status and compatibility with the chosen Laravel/PHP version. Avoid unnecessary packages.

---

## 4. Application architecture and folder organization

Use standard Laravel structure and organize application code by responsibility.

Suggested structure:

```text
app/
├── Enums/
├── Http/
│   ├── Controllers/
│   │   ├── Admin/
│   │   ├── Receptionist/
│   │   ├── Trainer/
│   │   ├── Member/
│   │   └── Webhooks/
│   ├── Middleware/
│   └── Requests/
├── Jobs/
├── Models/
├── Notifications/
├── Policies/
└── Services/
    ├── MembershipService.php
    ├── PaymentService.php
    ├── AttendanceService.php
    ├── QrCodeService.php
    ├── NotificationService.php
    └── ReportService.php

database/
├── factories/
├── migrations/
└── seeders/

resources/
├── views/
│   ├── layouts/
│   ├── components/
│   ├── auth/
│   ├── admin/
│   ├── receptionist/
│   ├── trainer/
│   ├── member/
│   └── public/
├── css/
└── js/

routes/
├── web.php
├── admin.php
├── receptionist.php
├── trainer.php
├── member.php
└── api.php

tests/
├── Feature/
└── Unit/

public/
├── manifest.json
├── sw.js
└── icons/
```

Adjust this structure to Laravel conventions where needed. Do not create empty or duplicate abstractions just to match this tree.

---

## 5. Database schema requirements

Create normalized migrations, Eloquent models, relationships, factories, seeders, indexes, foreign keys, and constraints.

All tables should have appropriate timestamps. Use soft deletes only where appropriate. Financial and audit history must remain immutable or be corrected through explicit reversal/refund records.

### 5.1 Users and authorization

#### `users`

- `id`
- `name`
- `email` nullable/unique as appropriate
- `phone` nullable/indexed
- `password`
- `status`
- `email_verified_at` where applicable
- timestamps

Use Spatie's standard role/permission tables and configuration:

- `roles`
- `permissions`
- `model_has_roles`
- `model_has_permissions`
- `role_has_permissions`

Do not create duplicate role tables if the package already supplies them.

### 5.2 Members

#### `members`

- `id`
- `user_id` unique/foreign key
- `member_code` unique
- `date_of_birth` nullable
- `gender` nullable
- `joining_date`
- `emergency_contact` nullable
- `address` nullable
- `status`
- timestamps
- soft deletes if appropriate

Additional tables:

#### `member_documents`

- `id`
- `member_id`
- `document_type`
- `file_path`
- `original_filename` nullable
- `uploaded_by`
- timestamps

Store files on a private disk. Serve them only through authorized routes.

#### `member_notes`

- `id`
- `member_id`
- `user_id`
- `note`
- timestamps

#### `member_health_profiles`

- `id`
- `member_id` unique
- `height` nullable
- `weight` nullable
- `medical_notes` nullable
- timestamps

Health-related information is optional and restricted to authorized users. Do not expose it to receptionists or other members unless explicitly permitted.

### 5.3 Memberships

#### `membership_plans`

- `id`
- `name`
- `duration_value`
- `duration_unit` (days, weeks, months, years)
- `price` decimal
- `description` nullable
- `status`
- timestamps

#### `memberships`

- `id`
- `member_id`
- `membership_plan_id` nullable for custom plans
- `start_date`
- `end_date`
- `price` decimal
- `discount` decimal default 0
- `final_amount` decimal
- `status`
- `previous_membership_id` nullable self-reference for renewal lineage
- `created_by`
- timestamps

#### `membership_extensions`

- `id`
- `membership_id`
- `old_end_date`
- `new_end_date`
- `reason`
- `created_by`
- timestamps

#### `membership_freezes`

- `id`
- `membership_id`
- `freeze_start`
- `freeze_end`
- `reason`
- `status`
- `created_by`
- timestamps

Membership status values should be represented consistently, preferably with PHP backed enums or validated constants:

- pending
- active
- expired
- cancelled
- frozen

Preserve each membership period as history. Do not overwrite a previous membership on renewal.

### 5.4 Payments and refunds

#### `payments`

- `id`
- `member_id`
- `membership_id` nullable
- `receipt_number` unique
- `amount` decimal
- `method` (cash, manual_upi, razorpay, other)
- `status` (pending, completed, failed, refunded, partially_refunded)
- `transaction_id` nullable
- `paid_at` nullable
- `collected_by` nullable
- `notes` nullable
- timestamps

#### `payment_transactions`

- `id`
- `payment_id`
- `gateway`
- `gateway_order_id` nullable/indexed
- `gateway_payment_id` nullable/unique where present
- `gateway_signature` nullable
- `response_data` JSON nullable
- `status`
- timestamps

#### `refunds`

- `id`
- `payment_id`
- `amount` decimal
- `reason`
- `status`
- `processed_at` nullable
- `processed_by` nullable
- timestamps

Payment rules:

- Cash: authorized staff records the amount and collector.
- Manual UPI: store a UPI transaction reference and require staff verification before marking completed.
- Razorpay: create order server-side, verify signature server-side, and confirm through a verified webhook or verified server-side payment status.
- Webhook processing must be idempotent.
- Never trust a frontend success callback alone.
- Never expose Razorpay secret keys in frontend code.
- Do not duplicate payments when a webhook is retried.
- Generate a unique receipt only after payment is confirmed according to the method's rules.
- Refunds must not delete the original payment.

### 5.5 QR attendance

#### `member_qr_codes`

- `id`
- `member_id`
- `token_hash` unique
- `expires_at` nullable
- `revoked_at` nullable
- timestamps

#### `attendance`

- `id`
- `member_id`
- `check_in_at`
- `check_out_at` nullable
- `method` (qr, manual)
- `marked_by` nullable
- `device_info` nullable
- timestamps

#### `attendance_settings`

- `id`
- `duplicate_window_minutes`
- `allowed_start_time` nullable
- `allowed_end_time` nullable
- timestamps

QR requirements:

- Generate high-entropy random tokens.
- Store only token hashes in the database.
- Do not encode member IDs, phone numbers, or personal information in the QR.
- Support revocation and expiry.
- Rate-limit token validation.
- Validate member status and membership status server-side.
- Prevent duplicate open check-ins.
- Support checkout for a valid open attendance record.
- Log manual attendance with staff identity.
- Do not permit offline attendance to be treated as verified.

For a small gym, a revocable member QR can be acceptable, but explain the replay risk. Prefer short-lived or rotating QR tokens if practical. The scanner must validate every token with the server.

### 5.6 Trainers and fitness plans

#### `trainers`

- `id`
- `user_id`
- `specialization` nullable
- `experience` nullable
- `status`
- timestamps

#### `trainer_assignments`

- `id`
- `trainer_id`
- `member_id`
- `start_date`
- `end_date` nullable
- timestamps

#### `workout_plans`

- `id`
- `member_id`
- `trainer_id`
- `title`
- `start_date`
- `end_date` nullable
- `status`
- timestamps

#### `workout_days`

- `id`
- `workout_plan_id`
- `day_name`
- timestamps

#### `workout_exercises`

- `id`
- `workout_day_id`
- `exercise_name`
- `sets` nullable
- `reps` nullable
- `duration` nullable
- `instructions` nullable
- timestamps

#### `diet_plans`

- `id`
- `member_id`
- `trainer_id`
- `title`
- `start_date`
- `end_date` nullable
- `status`
- timestamps

#### `diet_plan_meals`

- `id`
- `diet_plan_id`
- `meal_type`
- `food_items`
- `notes` nullable
- timestamps

#### `body_measurements`

- `id`
- `member_id`
- `weight` nullable
- `height` nullable
- `body_fat` nullable
- `measured_at`
- timestamps

### 5.7 Expenses, enquiries, notifications, settings, audit

#### `expense_categories`

- `id`
- `name`
- timestamps

#### `expenses`

- `id`
- `expense_category_id`
- `amount` decimal
- `expense_date`
- `description`
- `created_by`
- timestamps

#### `enquiries`

- `id`
- `name`
- `phone`
- `email` nullable
- `source` nullable
- `status`
- `assigned_to` nullable
- `notes` nullable
- timestamps

#### `notifications`

Use Laravel's database notification schema.

#### `notification_logs`

- `id`
- `user_id` nullable
- `channel`
- `status`
- `provider_reference` nullable
- `sent_at` nullable
- `failure_reason` nullable
- timestamps

#### `settings`

- `id`
- `key` unique
- `value` nullable (JSON or text as appropriate)
- timestamps

#### `audit_logs`

- `id`
- `user_id` nullable
- `action`
- `entity_type`
- `entity_id`
- `old_values` JSON nullable
- `new_values` JSON nullable
- `ip_address` nullable
- timestamps

Do not store secrets in settings as plaintext. Use environment variables or encrypted secret storage.

### 5.8 Important indexes and constraints

Add indexes for common filters and joins, including:

- `members.member_code`
- `members.user_id`
- `memberships.member_id, status`
- `memberships.end_date, status`
- `payments.member_id, paid_at`
- `payments.receipt_number`
- `payment_transactions.gateway_order_id`
- `payment_transactions.gateway_payment_id`
- `attendance.member_id, check_in_at`
- `member_qr_codes.token_hash`
- `enquiries.phone, status`

Add foreign keys and unique constraints where appropriate. Validate overlapping memberships and duplicate attendance inside transactions/locking where needed; do not rely only on frontend checks.

---

## 6. Core business rules

### Membership

- Gym timezone must be configurable.
- Membership start and end dates must be handled consistently.
- Support day/week/month/year durations.
- Renewal creates a new membership period and preserves history.
- Prevent unintended overlapping active memberships.
- Expired members cannot check in.
- Frozen members cannot check in during an active freeze.
- Freeze and extension changes require a reason and audit entry.
- Discount values must be validated server-side.
- Do not automatically activate a paid membership until payment confirmation is valid.
- Support admin-approved complimentary or manually activated memberships with an audit log.

### Payments

- Store monetary amounts as decimals.
- Distinguish pending, completed, failed, refunded, and partially refunded.
- Use database transactions for payment state transitions.
- Verify gateway signatures and webhooks.
- Implement webhook idempotency using gateway event/payment identifiers.
- Never accept amount, member ID, or payment status blindly from the browser.
- Provide a clear manual reconciliation process for UPI.
- Restrict refunds to authorized roles.

### Attendance

- Only eligible members can check in.
- Prevent multiple open check-ins for one member.
- Checkout must close the correct open record.
- Manual attendance requires a reason and staff identity.
- QR tokens must be revocable.
- Validate all attendance on the server.
- Use gym timezone consistently.
- Add scanner error messages for expired membership, frozen membership, revoked QR, invalid QR, and duplicate check-in.

### Reports

- Daily collections.
- Monthly collections.
- Annual collections.
- Payment-method breakdown.
- Refund totals.
- Outstanding/pending amounts.
- Expenses by category.
- Revenue minus expenses, clearly labelled as an operational summary rather than audited profit.
- Active/expired memberships.
- Renewal history.
- Daily/monthly attendance.
- Member growth.

Reports must use real database data and correct date boundaries.

---

## 7. Modules and screens

### 7.1 Authentication and access

- Login/logout.
- Password reset.
- Role and permission management.
- Session security.
- Account status controls.

### 7.2 Admin dashboard

KPI cards:

- Total members.
- Active members.
- Expired members.
- New members this month.
- Today's attendance.
- Monthly collections.
- Pending payments.
- Memberships expiring soon.
- Monthly expenses.

Charts:

- Monthly collections.
- Monthly expenses.
- Member registration trend.
- Attendance trend.
- Membership plan distribution.

Tables:

- Recent members.
- Recent payments.
- Today's attendance.
- Upcoming expirations.
- Outstanding payments.

All dashboard values must come from database queries. Never use hardcoded demo statistics in production.

### 7.3 Member management

- Create, view, edit, and search members.
- Search by name, phone, or member code.
- Filters and pagination.
- Profile photo upload.
- Private document upload.
- Emergency contact.
- Member notes.
- Membership history.
- Payment history.
- Attendance history.
- Authorized export.

Generate unique member codes automatically.

### 7.4 Membership management

- Create and edit plans.
- Monthly, quarterly, half-yearly, yearly, and custom durations.
- Purchase membership.
- Renewal.
- Expiry.
- Freeze/unfreeze.
- Extension.
- Discount.
- Membership history.

### 7.5 Payment management

- Cash collection.
- Manual UPI collection and verification.
- Razorpay order creation and verification.
- Payment search and date filters.
- Receipts.
- Refunds.
- Daily and monthly collection reports.

### 7.6 QR attendance

Receptionist screen:

- Camera-based QR scanner.
- Manual member search fallback.
- Show member name and photo after validation.
- Show membership eligibility.
- Check-in/check-out action.
- Clear success and failure states.
- Today's attendance list.

Member screen:

- Display personal QR.
- Show membership status.
- Show recent attendance.

Camera access requires HTTPS in production (localhost is generally allowed for development).

### 7.7 Trainer management

- Trainer profiles.
- Specializations.
- Assign members.
- Assigned-member list.
- Training schedule.
- Workout plan creation.
- Diet plan creation.
- Fitness progress entry.

### 7.8 Member portal

Mobile-first screens:

1. Dashboard.
2. Profile.
3. Membership.
4. Digital membership card and QR.
5. Attendance history.
6. Payments and receipts.
7. Workout plan.
8. Diet plan.
9. Fitness progress.
10. Notifications.

A member must only access their own records. Enforce this through queries, policies, and tests.

### 7.9 Expenses and reports

- Expense categories.
- Add/edit authorized expenses.
- Date filters.
- Description and attachment.
- PDF/Excel export.
- Financial summaries with refunds and pending amounts clearly separated.

### 7.10 Enquiries and public website

Public pages:

- Home.
- About.
- Membership plans.
- Trainers.
- Facilities.
- Gallery.
- Contact.
- Enquiry form.
- Privacy policy.
- Terms.

SEO:

- Unique page titles and descriptions.
- Canonical URLs where appropriate.
- Sitemap.
- Robots.txt.
- Open Graph metadata.
- Semantic headings.
- Fast responsive pages.

Enquiries must be stored in the database and visible in the admin panel. Validate and rate-limit public forms.

---

## 8. PWA requirements

Build an installable PWA for mobile browsers.

Implement:

- `manifest.json`
- Service worker
- Application icons in required sizes
- Install prompt/instructions
- Standalone display mode
- Responsive mobile-first UI
- Offline fallback page
- Cache versioning and cleanup
- Network-aware feedback

Security rules:

- Never cache authenticated private HTML pages or sensitive API responses in a public cache.
- Do not cache payment or attendance confirmation responses.
- Do not claim offline attendance or payment as verified.
- Keep offline fallback limited to safe static resources.
- Provide installation guidance for Android and supported iOS browsers.

---

## 9. Notifications and scheduled automation

Implement Laravel queues and scheduler for:

- Membership expiry reminders 7 days before.
- Membership expiry reminders 3 days before.
- Membership expiry reminders 1 day before.
- Expiry-day notification.
- Payment confirmation.
- Renewal confirmation.
- Welcome notification.
- Payment failure notification.
- Admin alerts.

Prevent duplicate reminders using a notification log or equivalent idempotency key.

Email should be configurable.

Create a WhatsApp provider integration only when valid credentials, approved templates, and provider configuration exist. Do not pretend messages were delivered if credentials are absent or provider calls fail.

---

## 10. UI/UX requirements

Design a premium commercial gym product:

- Dark charcoal/black base with restrained orange accent.
- Clean typography and visual hierarchy.
- Consistent spacing and reusable components.
- Responsive desktop, tablet, and mobile layouts.
- Sidebar navigation on desktop.
- Appropriate mobile navigation.
- Accessible contrast and keyboard-friendly controls.
- Tables with search, filters, pagination, and empty states.
- Loading states and validation feedback.
- Confirmation dialogs for destructive or financial actions.
- Toast notifications.
- Clear error and success states.

Avoid clutter, excessive animation, and generic unstyled CRUD pages.

Create a consistent design system for:

- Buttons.
- Forms.
- Cards.
- Tables.
- Badges/statuses.
- Modals.
- Alerts.
- Charts.
- Navigation.

---

## 11. Security and privacy

Implement and test:

- CSRF protection.
- Input validation and output escaping.
- Policies and role-based authorization.
- Rate limiting.
- Secure sessions and cookies.
- Password hashing.
- Secure private file storage.
- Upload MIME/type/size validation.
- Payment signature verification.
- Webhook idempotency.
- QR token hashing and revocation.
- Audit logs for important operations.
- Production HTTPS.
- Database backup and restore procedure.
- Least-privilege database credentials.
- No secrets in Git or frontend assets.

Collect only information the gym genuinely needs. Restrict optional health information and document access.

---

## 12. Testing requirements

Write automated feature and unit tests for at least:

### Authentication and authorization

- Login/logout.
- Role access.
- Receptionist cannot access admin settings.
- Trainer sees assigned members only.
- Member cannot view another member's data.

### Members and memberships

- Member creation and validation.
- Unique member code.
- Membership creation.
- Renewal preserves history.
- Expiry logic.
- Freeze restrictions.
- Extension audit history.

### Payments

- Cash payment.
- Manual UPI pending/verification flow.
- Razorpay signature verification.
- Failed payment does not activate membership.
- Duplicate webhook does not duplicate payment.
- Refund records preserve original payment.
- Receipt uniqueness.

### Attendance

- Valid QR check-in.
- Invalid QR.
- Revoked QR.
- Expired QR.
- Expired membership rejection.
- Frozen membership rejection.
- Duplicate check-in prevention.
- Check-out.
- Authorized manual attendance and audit record.

### Other modules

- Trainer assignment authorization.
- Workout/diet plan access.
- Report date filters.
- Export authorization.
- PWA manifest and service worker assets.

Use factories and isolated test data. Run the full test suite before launch.

---

## 13. Implementation milestones

Build in this order.

### Milestone 1 — Foundation

- Environment inspection.
- Laravel setup.
- Database connection.
- Authentication.
- Roles and permissions.
- Base layouts and design system.
- Initial migrations and seeders.

**Acceptance:** Users can log in and each role is restricted correctly.

### Milestone 2 — Members

- Member CRUD.
- Member profile.
- Search/filter/pagination.
- Private document upload.
- Member code generation.
- Member import from validated CSV/Excel if practical.

**Acceptance:** Staff can manage member records securely.

### Milestone 3 — Memberships

- Plans.
- Purchases.
- Renewals.
- Freeze/unfreeze.
- Extensions.
- Expiry handling.

**Acceptance:** Membership history and status are correct under tests.

### Milestone 4 — Payments

- Cash.
- Manual UPI verification.
- Razorpay order and checkout integration.
- Webhook verification and idempotency.
- Receipts and refunds.

**Acceptance:** No unverified payment can activate a paid membership.

### Milestone 5 — QR attendance

- Member QR display.
- Receptionist scanner.
- Token validation.
- Check-in/check-out.
- Manual fallback.
- Attendance reports.

**Acceptance:** Invalid/ineligible QR attempts are rejected and logged.

### Milestone 6 — Fitness modules

- Trainers.
- Assignments.
- Workout plans.
- Diet plans.
- Body measurements.

**Acceptance:** Trainers and members can access only authorized records.

### Milestone 7 — Member portal and PWA

- Mobile-first member dashboard.
- PWA manifest.
- Service worker.
- Installability.
- Safe offline fallback.

**Acceptance:** PWA installs on supported devices without caching private data.

### Milestone 8 — Reports and notifications

- Dashboard charts.
- Collection/expense reports.
- Expiry reminders.
- Email integration.
- Optional WhatsApp integration.

**Acceptance:** Scheduled reminders are idempotent and reports reconcile with source records.

### Milestone 9 — Public website

- Public pages.
- Enquiry forms.
- SEO metadata.
- Sitemap and robots.txt.

**Acceptance:** Public site is responsive, validated, and does not expose private information.

### Milestone 10 — Production readiness

- Full regression tests.
- Authorization review.
- Payment review.
- Backup/restore test.
- Performance review.
- HTTPS and deployment docs.
- Staff training guide.

**Acceptance:** All critical tests pass and all external integrations are configured or explicitly documented as pending.

---

## 14. Seeders and demo environment

Create demo seeders for:

- Roles and permissions.
- One Super Admin.
- One Gym Admin.
- One Receptionist.
- Two Trainers.
- Sample membership plans.
- Optional demo members and attendance/payment records.

Use clearly documented local demo credentials. Never seed known demo passwords in production. Force password changes where appropriate and protect seeders from accidental production execution.

---

## 15. Required documentation and deliverables

Deliver:

- Complete Laravel source code.
- Migrations, models, relationships.
- Controllers, requests, policies, middleware, and services.
- Role/permission seeders.
- Admin and receptionist interfaces.
- Trainer interface.
- Member portal.
- Membership and payment modules.
- QR attendance.
- PWA.
- Notifications and scheduled tasks.
- Reports and exports.
- Public website.
- Automated tests.
- `.env.example`.
- `README.md`.
- `DEVELOPMENT_PROGRESS.md`.
- `DEPLOYMENT.md`.
- `BACKUP_RESTORE.md`.
- Staff/receptionist usage guide.

Documentation must include:

- PHP/Composer/Node prerequisites.
- Installation commands.
- Environment configuration.
- Database setup and migration.
- Seeder instructions.
- Local run commands.
- Queue worker and scheduler setup.
- Razorpay test/live configuration.
- PWA installation instructions.
- Nginx/PHP-FPM deployment.
- HTTPS setup.
- Backup and restore procedure.

---

## 16. Final execution instruction

Begin now.

First inspect the environment and current directory. Then:

1. Report the detected versions and whether the chosen stack is compatible.
2. Create a concise implementation plan and `DEVELOPMENT_PROGRESS.md`.
3. Set up the Laravel application safely.
4. Implement Milestone 1 only.
5. Run migrations and relevant tests where the environment allows.
6. Fix errors.
7. Update `DEVELOPMENT_PROGRESS.md`.
8. Summarize the completed milestone and exact next steps.

Continue milestone by milestone. Do not skip tests, fake integrations, or mark unfinished work as complete.

**The goal is a reliable system that can be piloted by a real gym, not merely a visually attractive demo.**
