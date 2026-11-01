# Current development progress

## Latest scope — user-requested reversal

The user explicitly requested reversing the management foundation and delivering
only a login page and dashboard design matching the existing website. This
supersedes the earlier implementation specification and milestone plan.

Reverted the changes introduced by commit `0948782` without rewriting Git
history. The earlier Laravel website base (`3caa2d3`) and all public pages/assets
are preserved. The original specification is archived, unchanged, at
`docs/archive/GYM_PRO_Codex_Implementation_Prompt.md`.

## Removed from the active application

- Fortify authentication, password reset/change and mandatory first-login flow.
- Spatie roles/permissions, account management, status controls and audit services.
- Admin/receptionist/trainer/member operational routes and management layouts.
- Management migrations/seeders, database-backed catalog models and Bootstrap/
  Alpine dependencies. Composer/npm dependencies were restored to the base lockfiles.
- Previous deployment/staff documents that described that removed foundation.

The local MySQL database/private credential files were not destroyed; they are
unused by these previews and remain outside Git. No migration rollback or data
deletion was run. The app uses file sessions and the public catalog reads JSON
again. Previous work remains recoverable from Git history if requested later.
Existing untracked `frontend/` files remain untouched.

## Current pages

- `/login`: BEAST MODE branding, gym photograph, Poppins, citron accents, dark and
  white light modes, optional email/password fields and password visibility toggle.
- `/dashboard`: matching sidebar/topbar, labelled sample overview cards, local
  weekly chart, featured strength program and searchable/filterable sample classes.
- Preview navigation never submits or stores credentials. There is no working
  authentication, protected dashboard, role management or member database module.
- Existing website, program/product details, enquiries and responsive hero fix are
  preserved. The public header exposes account preview access alongside Contact.
- Theme preference is shared through `beast-theme`; mobile navigation supports
  keyboard focus, Escape and inert background/closed navigation. No new packages.

## Changed files

The reversal removes the previous foundation's files. New design files:
`resources/views/layouts/portal.blade.php`, `resources/views/portal/*`,
`resources/views/partials/portal-{brand,icons}.blade.php`,
`public/assets/portal.{css,js}`, `design-review/portal-contract.md`,
`design-review/verify-portal.cjs` and `tests/Feature/PortalPreviewTest.php`.
Additional changes: public navigation/responsive CSS, two preview routes,
localhost run command, README and this progress record.

## Verification

- `composer install --no-interaction --prefer-dist`: passed; removed 23 foundation
  packages and rebuilt package discovery.
- `npm ci`: passed; Bootstrap/Alpine/Popper removed, zero reported vulnerabilities.
- `php vendor/bin/pint --dirty`: clean.
- `php artisan test --compact`: **15 tests, 242 assertions passed**. Includes preview
  pages with a DB-query guard and confirmation that former management routes and
  login POST are unavailable.
- `php artisan view:cache` / `view:clear`: passed.
- `composer validate --strict`, `composer audit`, JS syntax check: passed.
- `npm run build`: passed with the restored base dependency set.
- `node design-review/verify-portal.cjs`: **28 themed layout checks passed** at
  320/390/768/844/1024/1200/1440 widths. Preview navigation without transmitting
  credentials, email validation, password visibility, chart periods, class
  search/filter/reset, mobile drawer keyboard/Escape/inert behavior, theme
  persistence and no-JS access passed. Zero JS errors, failed assets or writes.
- `node design-review/verify-laravel.cjs`: **26 public routes, 80 responsive layouts**,
  all fourteen product gallery/enquiry flows, filters, legacy redirects, mobile
  menu and no-JS catalog passed.
- Final dark/light login and dashboard renders inspected at phone, tablet and
  desktop sizes. The local visual evidence record passed its completeness check.

The requested rollback and two-page visual preview are **complete**. Current
URLs: `http://localhost:8000/login` and `http://localhost:8000/dashboard`.

Previous Milestone 1 completion is **reverted**. Future management milestones are
not active under this design-only scope.
