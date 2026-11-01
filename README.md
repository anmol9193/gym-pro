# BEAST MODE Gym - Laravel

Laravel 13 application for the existing responsive gym website. Includes the
homepage, Our Approach, Membership, Contact, six training programs and fourteen
demo products (equipment and eight supplement concepts).

## Requirements

- PHP 8.3 or newer, with the standard Laravel extensions and PDO SQLite.
- Composer 2.
- Node.js and npm for the optional Vite asset pipeline.

## Start the configured local project

```powershell
composer dev
```

Open <http://127.0.0.1:8000>. You can also run:

```powershell
php artisan serve --host=127.0.0.1 --port=8000
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
- `routes/web.php`: named application routes.
- `database/migrations`: standard Laravel database foundations.

Edit the Blade views directly. Catalog content is stored in JSON; no static page
generation step is needed. The two obsolete Python page builders have been
replaced by Laravel views and controllers.

## URLs

- `/`
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

PHP feature tests cover all pages, dynamic catalog details, SQLite migrations,
legacy redirects, missing routes and shared navigation/assets. Browser checks
require Playwright and Chrome, with the Laravel server running:

```powershell
npm install --prefix .qa --no-save playwright
$env:PLAYWRIGHT_MODULE = (Resolve-Path '.qa/node_modules/playwright').Path
node design-review/verify-laravel.cjs
```

Set `CHROME_PATH` if Chrome is installed elsewhere, and `PREVIEW_ORIGIN` if using
a different preview URL. Screenshots and generated browser reports stay local.
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
