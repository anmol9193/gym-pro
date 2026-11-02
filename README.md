# BEAST MODE Gym - Laravel

Laravel 13 application for the existing responsive gym website. Includes the
homepage, Our Approach, Membership, Contact, six training programs and fourteen
demo products (equipment and eight supplement concepts).

The administrator dashboard matches the public site's Poppins, citron/charcoal
and white light themes. Sign in at `/login` with a seeded super-admin account.
The dashboard includes illustrative fitness charts, trainers, meals and classes;
these figures are sample content. Account settings support name/email changes,
profile photo uploads and password changes. Authenticated pages prevent cached
dashboard access after logout, including browser Back/Forward navigation.

## Requirements

- PHP 8.3 or newer, with the standard Laravel extensions, GD and PDO SQLite.
- Composer 2.
- Node.js and npm for the optional Vite asset pipeline.

## Start the configured local project

```powershell
composer dev
```

Open <http://localhost:8000>. You can also run:

```powershell
php artisan serve --host=localhost --port=8000
```

The current design uses local files in `public/assets`, so it does not require
Vite's development server to display the website.

## Set up a fresh clone

```powershell
git clone https://github.com/anmol9193/gym-pro.git
cd gym-pro
composer setup
composer dev
```

`composer setup` installs dependencies, copies `.env.example` if needed,
generates the local application key, creates the SQLite file, runs migrations
and builds the optional Vite assets. Run it for a fresh installation; it generates
an application key. The local `.env`, SQLite data, dependencies and generated
build output are excluded from Git.

Set `SUPER_ADMIN_EMAIL` and a password of your choice in the local `.env`, then
create the administrator account:

```powershell
php artisan config:clear
php artisan db:seed --class=SuperAdminSeeder
```

`SUPER_ADMIN_PASSWORD` must be set before seeding. Re-running this seeder resets
the configured administrator's name and password to those configured values.
For an existing installation, run `php artisan migrate` to add roles and the
profile photo column. Uploaded photos stay on the private local disk and are
served through an authenticated route; no public storage symlink is needed.

## Project structure

- `app/Http/Controllers`: page, product, program and legacy redirect controllers.
- `app/Support/SiteCatalog.php`: loads the editable demo catalog.
- `resources/views/layouts/site.blade.php`: shared page layout and loader.
- `resources/views/partials`: navigation, footer and reusable product cards.
- `resources/views/pages`: home, approach, membership and contact content.
- `resources/views/products`: data-backed catalog and product detail template.
- `resources/views/programs`: program catalog and shared detail template.
- `resources/data/products.json`: equipment and supplement content.
- `resources/data/programs.json`: training program content.
- `public/assets`: Poppins, styles, scripts, photographs and 3D product renders.
- `resources/views/portal`: login, dashboard, profile and password forms.
- `resources/views/layouts/dashboard.blade.php`: shared sidebar/topbar layout.
- `public/assets/portal.css`, `fit-dashboard.css` and `account.css`: portal styles.
- `public/assets/portal.js` and `fit-dashboard.js`: theme, menus, charts and previews.
- `routes/web.php`: named application routes.
- `database/migrations`: standard Laravel database foundations.

Edit the Blade views directly. Catalog content is stored in JSON; no static page
generation step is needed. The two obsolete Python page builders have been
replaced by Laravel views and controllers.

## URLs

- `/`
- `/login` (sign in) and `/dashboard` (super-admin access)
- `/profile` and `/change-password` (authenticated account settings)
- `/programs` and `/programs/{slug}`
- `/products` and `/products/{slug}`
- `/our-approach`, `/membership`, `/contact`
- `/products?category=supplements&type=protein` filters supplement concepts.

Previous `.html` URLs redirect permanently to their Laravel routes and preserve
query parameters for product, program, membership and supplement selections.

## Database

Local development uses `database/database.sqlite`. Sessions and cache use local
files; the queue is synchronous. No database server or queue worker is required
to browse the website.

```powershell
php artisan migrate
php artisan migrate:status
```

To use MySQL later, create a database, update `DB_CONNECTION`, `DB_HOST`,
`DB_PORT`, `DB_DATABASE`, `DB_USERNAME` and `DB_PASSWORD` in your local `.env`,
then run `php artisan config:clear` followed by `php artisan migrate`.

## Verification

```powershell
composer validate --strict
php vendor/bin/pint --test
php artisan test
composer audit
npm run build
```

PHP feature tests cover public pages, catalog details, SQLite migrations,
authentication, roles, profile/photo updates, passwords and route access. Browser checks
require Playwright and Chrome, with the Laravel server running:

```powershell
npm install --prefix .qa --no-save playwright
$env:PLAYWRIGHT_MODULE = (Resolve-Path '.qa/node_modules/playwright').Path
node design-review/verify-laravel.cjs
node design-review/verify-fit-dashboard.cjs
node design-review/verify-account.cjs
node design-review/verify-profile-photo.cjs
node design-review/verify-logout-history.cjs
```

Set `CHROME_PATH` if Chrome is installed elsewhere, and `PREVIEW_ORIGIN` if using
a different preview URL. Screenshots and generated browser reports stay local.
The administrator browser checks read the local `SUPER_ADMIN_EMAIL` and
`SUPER_ADMIN_PASSWORD`, or `QA_ADMIN_EMAIL` and `QA_ADMIN_PASSWORD` overrides.
Keep these values aligned with the test account if its details have changed.
`design-review/legacy-static` contains historical checks for the old HTML version.

## Product renders

Original procedural models live in `scripts/product-models.js`. To regenerate
local product images with the browser QA dependencies and server running:

```powershell
node scripts/render-products.cjs
```

This reads `resources/data/products.json` and writes to `public/assets/products`.

## Hosting

Point the web server or WAMP virtual host document root to this project's
`public` directory. Use a PHP/Laravel host for this application. Set production
`.env` values, including `APP_DEBUG=false`, and run migrations as appropriate.

## Demo content and enquiries

Product and supplement visuals are concepts; actual labels, sizes, availability
and prices are to be confirmed. The owner introduction is a sample profile and
gym contact details remain placeholders. Enquiry forms still prepare editable,
copyable local drafts. They do not send messages, process orders or store
personal details. Only the theme preference is saved in browser storage.

## Credits

Designed & Developed by [Anmol Saini](https://anmolsaini.wuaze.com).
Photography, fonts, original renders and third-party license details are recorded
in [`public/assets/SOURCES.md`](public/assets/SOURCES.md).
Dashboard image credits are in
[`public/assets/dashboard/SOURCES.md`](public/assets/dashboard/SOURCES.md).
