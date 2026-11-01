# Products design contract

Purpose: help gym visitors browse six demo training products, inspect a product and prepare a local enquiry. Primary action: view product, then enquire. No checkout, inventory or submitted enquiry is implied.

Direction: the existing industrial BEAST MODE identity, Poppins, graphite and lime, with white light-mode backgrounds. Original procedural 3D product renders on a neutral studio stage carry the content. Existing program cards inform spacing and typography; product images stay unobscured so the objects can be inspected. The first listing viewport shows actual products and filter controls.

Surfaces: homepage four-product preview, six-product listing, six static detail pages, product selection in Contact. Existing header, native cursor, loader, credit and Contact CTA remain. Products joins the main menu.

Hierarchy: breadcrumbs, short catalog heading, category/search toolbar, products. Detail: gallery and name/description/enquiry side by side, descriptive demo specifications, related products. Mobile stacks in the same reading order; filters wrap, images keep a square aspect ratio.

Target viewports: 390x844 and 1440x900 in both themes; additional overflow checks at 320, 768, 1200 and 1920px. All controls have labels, keyboard focus and >=44px targets. No extra runtime dependency. Reduced motion disables image transitions. Local static markup supports file URLs and no JavaScript.

States:
- Loading: existing dismissible loader and stable image dimensions.
- Empty: search/filter returns zero products; clear feedback and reset action.
- Error: invalid phone/name blocks local draft with browser validation and correction; missing optional product query safely defaults to training enquiry.
- Partial: visibly demo collection with price, dimensions and availability on enquiry; no fabricated stock or testimonials.
- Success: filtered count, selected gallery thumbnail, zoom dialog, editable/copyable local enquiry draft.
- Permission: not applicable; no login, payment or protected access is used.

Rendered review must cover listing/detail/home in both themes; category and search combination, reset, all product enquiry URLs, membership/program regression, gallery keyboard/Escape/focus, mobile menu, no JavaScript, local assets and link targets.
