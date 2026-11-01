# Local assets

All images, fonts and the 3D renderer are served from this directory. The page does not request a remote model or require a build step.

## Photography

Original image URLs (downloaded as compressed JPEGs, resized with Unsplash's image service):

- `hero-athlete.jpg`: https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e
- `conditioning.jpg`: https://images.unsplash.com/photo-1517836357463-d25dfeac3438
- `coaching.jpg`: https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b
- `gym-space.jpg`: https://images.unsplash.com/photo-1534258936925-c58bed479fcb
- `cardio.jpg`: https://images.unsplash.com/photo-1538805060514-97d9cc17730c
- `boxing.jpg`: https://images.unsplash.com/photo-1549719386-74dfcbf7dbed
- `yoga.jpg`: https://images.unsplash.com/photo-1506126613408-eca07ce68773
- `nutrition.jpg`: https://images.unsplash.com/photo-1490645935967-10de6ba17061

## Typography

Sample owner profile: `owner-demo.jpg` uses https://images.unsplash.com/photo-1500648767791-00dcc994a43e as an illustrative portrait. The name Arjun Mehra, introduction and quote are dummy content requested by the user; the section is visibly labelled "Sample profile".

Poppins (400, 500, 600, 700 and 800), downloaded from Google Fonts and served locally. Its OFL license text is `fonts/POPPINS-OFL.txt`.

## 3D

Three.js 0.158.0, vendored as a classic script so the page also works when opened directly as a local HTML file. MIT license: `vendor/THREE-LICENSE.txt`. The dumbbell, plates, grip and orbit are original procedural geometry in `app.js`.

## Design references

The supplied Dribbble links are inspiration only. Their artwork is not used on the website. Research limitations and concrete observations are recorded in `../design-review/design-contract.md`.
## Demo product collection

The six demo product designs and their 18 studio images are original procedural
Three.js renders created for this site. Geometry and labels are defined in
`scripts/product-models.js`; `scripts/render-products.cjs` captures three views of
each design using the existing local Three.js library and Poppins font. No product
photos or commercial brand assets are used. These visuals are concepts; the site
does not claim real stock, final specifications or product prices.

The collection also includes eight original supplement packaging concepts
(whey protein, whey isolate, plant protein, creatine monohydrate, pre-workout,
mass gainer, multivitamin and omega-3), rendered with the same local pipeline.
Packaging artwork is illustrative and contains no invented ingredient amounts,
nutrition panel, certification or health claims. Actual labels and pricing are
left for enquiry.
