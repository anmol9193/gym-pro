# Mobile responsive repair

Preserve the existing BEAST MODE design, Poppins, white light theme and native
cursor. Repair the complete static site: main pages, six programs, fourteen
products and supplement category states. No new dependency or business flow.

Baseline audit: 26 pages at 11 widths. Text was inside the viewport, but 14
page/width combinations had form controls below 16px. Phone product lists used
one oversized column and filters consumed several rows; product detail names
appeared below the large gallery. Tablet home layouts retained narrow columns.

Direction: touch-readable forms, consistent safe gutters, short mobile toolbars,
two product columns from 360px, one column on smaller phones, and title before
product media. Product type filter remains labelled. Use local scroll only for
category chips and membership comparison. Short landscape menus must scroll.

Targets: 390x844, 768x1024 and 844x390 in both themes. Additional all-page checks
at 320, 360, 375, 430, 560, 700, 701, 820 and 1024; desktop 1440x900 regression.
Check text and controls, actual touch menu/filters/gallery, long product names,
local enquiry validation/editing, focus return, anchor offsets, reduced motion,
all local assets and links. Screenshots must load lazy images before inspection.

States: existing loader remains dismissible; empty filters retain reset; invalid
form fields retain correction; demo information remains visible; successful
gallery/enquiry interactions keep feedback. Permission is inapplicable because
this change does not add protected data or external actions.
