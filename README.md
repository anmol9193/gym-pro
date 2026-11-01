# BEAST MODE Gym

A responsive static gym website with Poppins typography, dark/light themes,
an animated loader, a Three.js dumbbell scene and locally hosted assets.

## Pages

- Homepage with training programs, owner introduction, equipment and supplements.
- Programs catalog, Our Approach, Membership and Contact.
- Six individual training program pages.
- Fourteen demo products: six equipment/accessory products and eight supplements.
- Product category/type filters, search, three-view galleries and image zoom.

Supplement concepts include whey protein, whey isolate, plant protein, creatine
monohydrate, pre-workout, mass gainer, multivitamin and omega-3.

## Run locally

No build step is required. Open `index.html`, or serve the project with Python:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Visit <http://127.0.0.1:8765/index.html>.

Upload the root HTML files and `assets/` directory together to a static host.
Keep their relative paths unchanged.

## Project structure

- `assets/`: local styles, scripts, fonts, photographs and product renders.
- `assets/products.json`: product content and related product references.
- `assets/program-details.json`: individual training program content.
- `scripts/build-product-pages.py`: rebuilds the product catalog/detail pages,
  homepage previews and Contact product choices.
- `scripts/build-program-pages.py`: rebuilds training program detail pages.
- `scripts/product-models.js` and `scripts/render-products.cjs`: original
  procedural product models and three-view image rendering.
- `design-review/`: design contracts and browser verification scripts.

Rebuild static pages after editing their source content:

```powershell
python scripts/build-program-pages.py
python scripts/build-product-pages.py
```

## Browser checks

The verification scripts require Node.js, Playwright and a local Chrome install.
With the Python preview server running, optional QA dependencies can be kept in
an ignored directory:

```powershell
npm install --prefix .qa --no-save playwright
$env:PLAYWRIGHT_MODULE = (Resolve-Path '.qa/node_modules/playwright').Path
node design-review/verify-products.cjs
node design-review/audit-mobile.cjs --after
node design-review/verify-mobile.cjs
```

Checks cover responsive layouts, touch controls, themes, menu navigation,
filters/search, galleries, enquiry validation and local links. Screenshots and
generated reports stay local and are excluded from Git.

To regenerate all product renders, with the same QA setup and server:

```powershell
node scripts/render-products.cjs
```

## Demo content and enquiries

Products and supplement packaging are concepts; actual ingredients, sizes,
availability and prices are to be confirmed. The owner introduction is a sample
profile. Gym contact details remain clearly marked placeholders.

Enquiry forms create an editable/copyable draft in the current browser tab.
They do not send messages, process orders or store personal details. Only the
theme preference is saved locally.

## Credits

Designed & Developed by [Anmol Saini](https://anmolsaini.wuaze.com).
Asset sources and bundled font/Three.js license information are documented in
[`assets/SOURCES.md`](assets/SOURCES.md).
