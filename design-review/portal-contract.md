# Login and dashboard design contract

The latest user request replaces the Milestone 1 management scope. Revert that
implementation and deliver two visual preview pages inside the preserved Laravel
website. The previous specification is kept in docs/archive for reference only.

Use the website's own electric citron (#d2fa49), charcoal (#101211), white light
theme, Poppins fonts, skewed lightning mark, rounded borders and local gym photos.
Reuse public/assets/styles.css tokens. No Bootstrap, Fortify, Spatie or new UI
dependencies. Keep the public site and all program/product pages working.

Login revision: a centered contained card, calm sentence-case welcome, form on
the left and a boxing photograph on the right. Use restrained field icons,
generous spacing and a clear citron Preview dashboard action. The image drops
away on narrow screens, leaving a compact form card. Keep labelled email/password
fields, visibility toggle and a gym contact link.
This is a design preview: inputs are optional, credentials are never submitted,
stored or authenticated, and the dashboard is public. No fake sign-in success.

Dashboard: compact desktop sidebar, mobile drawer, sample overview cards, weekly
activity chart, featured program and searchable/filterable class schedule.
All example figures are labelled as sample data. Links use existing public pages;
period selection and schedule filters work locally. No financial/payment claims.

States: native/inline email validation; password visibility; empty schedule search
with reset; chart period changes; stable preview navigation; demo-data disclosure.
Authentication/permission states are not applicable to a public visual preview.
No network writes or personal-data storage. Only the shared theme is persisted.

Verify 390x844, 768x1024 and 1440x900 in dark/light modes, plus 320px and landscape.
Inspect renders, local asset delivery, keyboard focus, mobile drawer Escape/focus
restoration, no-JS access, form submission without credentials, filters and chart.
Update DEVELOPMENT_PROGRESS.md to record the rollback and current limited scope.
