# GYM PRO

Single-gym Laravel application for BEAST MODE Gym. The primary specification is
[GYM_PRO_Codex_Implementation_Prompt.md](GYM_PRO_Codex_Implementation_Prompt.md).
Current delivery is **Milestone 1: foundation**; see
[DEVELOPMENT_PROGRESS.md](DEVELOPMENT_PROGRESS.md) for verified scope and limits.

## Requirements and stack

- PHP 8.3+ with PDO MySQL, mbstring, OpenSSL, fileinfo, DOM/XML and standard Laravel extensions.
- Composer 2, MySQL 8, Node.js 22.12+ and npm (verified locally with Node 24).
- Laravel 13, Fortify, Spatie Laravel Permission, Blade, Bootstrap 5 and Alpine.js.
- PDO SQLite for the isolated automated test suite.

## Local installation

```powershell
git clone https://github.com/anmol9193/gym-pro.git
cd gym-pro
Copy-Item .env.example .env
```

Create the MySQL database and a dedicated database-scoped account using your
database administration tool. Do not use the MySQL root account in the app.
Example SQL, replacing the password placeholder with your own unique secret:

```sql
CREATE DATABASE gym_pro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'gym_pro_app'@'localhost' IDENTIFIED BY 'REPLACE_WITH_A_UNIQUE_SECRET';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, DROP, REFERENCES
ON gym_pro.* TO 'gym_pro_app'@'localhost';
```

Set `DB_HOST=localhost`, `DB_PORT=3306`, `DB_DATABASE=gym_pro`,
`DB_USERNAME=gym_pro_app` and your private `DB_PASSWORD` in `.env`. Keep
`APP_URL=http://localhost:8000`. Then:

```powershell
composer setup
php artisan db:seed --class=DemoAccountsSeeder
composer dev
```

`composer setup` installs locked dependencies, creates an application key only
if absent, runs migrations/standard seeders and builds Vite assets. It refuses
non-local environments. It does not provision MySQL or replace an existing key.
Never run `migrate:fresh` against the gym's working database.

Open <http://localhost:8000/login>. Local demo accounts have individually generated
passwords in **`storage/app/private/local-demo-credentials.json`**, an ignored file.
The six accounts are Super Admin, Gym Admin, Receptionist, two Trainers and Member.
Every demo account must change its password at first sign-in. Reseeding preserves
existing accounts and passwords; the credential file records initial passwords
only. The demo seeder refuses production even when `--force` is supplied.

For an initial administrator without demo accounts:

```powershell
php artisan gym:create-admin owner@example.com --name="Gym Owner"
```

The command creates a **Super Admin** and prompts privately for a strong password.
No password belongs in command arguments or Git.

## Foundation behavior

| Role | Default workspace and access |
|---|---|
| Super Admin | All foundation workspaces, accounts, permission management, configuration |
| Gym Admin | Admin overview, account management, role viewing and configuration |
| Receptionist | Reception workspace and own account |
| Trainer | Trainer workspace and own account |
| Member | Member workspace and own account |

Gym Admin cannot assign/edit Super Admin access. Accounts cannot change their own
role/status. Inactive/suspended accounts are blocked; access/password changes
revoke database sessions. New staff accounts require a password change.
Permission changes are audited and enforced on the server. Super Admin's full
permission set is protected. Reseeding preserves configured role permissions.

Dashboards show real account, role and public catalog counts. There are no
fabricated membership, attendance or revenue figures. Reception/trainer/member
screens are secure entry pages; operational modules remain pending.

Login is limited after five failures per email/IP. Password recovery has an
additional five requests per minute/IP limit. Passwords require 12 characters,
mixed case, a number and a symbol. Reset tokens expire in 60 minutes and are
single-use. Self-service public registration is disabled.

Local `MAIL_MAILER=log` writes reset notifications to `storage/logs/laravel.log`;
it **does not deliver email**. Keep logs private. Configure and verify a real
email transport before piloting recovery with staff.

## Existing public website

The public website remains at `/`, `/programs`, `/products`, `/our-approach`,
`/membership` and `/contact`, with six program details and fourteen product
details. Old `.html` URLs redirect and preserve enquiry/filter queries.
Contact stays the primary header action; account sign-in is also accessible.

Catalog records now live in MySQL. `CatalogSeeder` imports `resources/data/*.json`
only for missing slugs, preserving existing database edits. JSON remains the seed
source and the input for `scripts/render-products.cjs`; it is not a live catalog
editor. Public assets/Poppins/3D product renders remain in `public/assets`.

Owner/contact details and products are demo content. Enquiry forms prepare local
editable drafts; they do not send messages or save enquiries. Supplement labels,
availability and prices require confirmation. Public enquiry integration is
Milestone 9. The management layout uses restrained orange, with dark and white
light themes; the public site's existing design is preserved.

## Development and verification

```powershell
composer dev
# After editing management CSS/JS:
npm run build
# Or use npm run dev in a second terminal for Vite HMR.
composer validate --strict
php vendor/bin/pint --test
php artisan test
composer audit
npm audit
```

Tests use SQLite `:memory:` and isolated factories, never the local MySQL data.
Browser checks exercise the running MySQL app. Install optional QA dependencies:

```powershell
npm install --prefix .qa --no-save playwright
$env:PLAYWRIGHT_MODULE = (Resolve-Path '.qa/node_modules/playwright').Path
php design-review/foundation-fixtures.php create
node design-review/verify-foundation.cjs
php design-review/foundation-fixtures.php cleanup
node design-review/verify-laravel.cjs
```

Fixtures are local-only, private and identified by exact account IDs/emails for
cleanup. Run cleanup even after a failed check. Set `CHROME_PATH` for a different
Chrome location, or `PREVIEW_ORIGIN` for another server. Reports/screenshots stay
local. Historical static tests are in `design-review/legacy-static`.

## Organization and operations

- `app/Enums`, `Policies`, `Http/Requests`, `Http/Middleware`: validation/access boundaries.
- `app/Services`: transactional account and permission rules; `app/Actions/Fortify`: recovery.
- `routes/admin.php`, `receptionist.php`, `trainer.php`, `member.php`: protected workspaces.
- `resources/views/layouts/management.blade.php`: shared management shell.
- `resources/css/management.css`, `resources/js/management.js`: Bootstrap/Alpine assets.
- `database/migrations`, `seeders`: reproducible schema and safe initial data.

Store timestamps in UTC; display them using `GYM_TIMEZONE` (default Asia/Kolkata).
Local queues are synchronous and no business schedules exist yet. Background
notifications/scheduling arrive in Milestone 8; payments/QR/PWA are pending.
Read [DEPLOYMENT.md](DEPLOYMENT.md), [BACKUP_RESTORE.md](BACKUP_RESTORE.md) and
[STAFF_GUIDE.md](STAFF_GUIDE.md) for current operational boundaries.

Designed & Developed by [Anmol Saini](https://anmolsaini.wuaze.com).
Asset licenses: [public/assets/SOURCES.md](public/assets/SOURCES.md).
