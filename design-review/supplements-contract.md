# Supplement collection extension

Extend the existing demo catalog with eight products: whey protein, whey isolate,
plant protein, creatine monohydrate, pre-workout, mass gainer, multivitamin and
omega-3. Keep the six equipment products and all existing routes.

Use the current frontend-design-direction and make-interfaces-feel-better skills:
existing Poppins and theme tokens, original studio renders, compact controls and
44px targets. Distinct packaging colours help scan product types; no real brand,
ingredient quantity, dosage, efficacy, certification, stock or price is invented.

User flow: home supplement preview -> Supplements filter -> type filter/search ->
individual gallery/detail -> product-selected local enquiry. Direct links must
initialize the correct filter. Contact options must regenerate from the catalog.

Targets: 390x844 and 1440x900, both themes; overflow at 320, 768 and 1200/1201.
Check all eight galleries and enquiries, existing equipment, query defaults,
combined filters, empty reset, no-JavaScript content and direct file navigation.
Loading uses the existing loader and stable image sizes. Empty gives reset.
Error uses existing form validation and safe unknown-query fallback. Partial is
explicit concept information and unconfirmed labels/price. Success is the visible
filtered result, gallery selection and editable draft. Permission is inapplicable
because no protected data, payment or external submission is introduced.
