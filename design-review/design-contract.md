# BEAST MODE redesign

Purpose: help visitors explore gym programs, compare the existing membership prices, and prepare a free-trial enquiry. This is a static website with no submission backend.

Direction: athletic editorial design; near-black, electric citron, warm off-white, and restrained coral. Oversized condensed type, photographic training imagery, generous whitespace, a floating navigation bar, and one genuine interactive WebGL dumbbell.

Reference observations:
- Athlo: inspected its full shot locally. Adapt the athlete-led hero, translucent navigation, contrasting consultation action, and layered floating information. Do not copy its branding or artwork.
- Superconscious: read the supplied shot description and live-site content. Adapt immersive progression, soft lighting, and a clear personal-growth journey. The shot preview was blocked and its live animation did not fully render in the research browser.
- Fitness Website Design: the supplied page is accessible as text, but its image is blocked with HTTP 202 in the browser and direct requests. No specific visual claim or copied detail is attributed to this unavailable image.

Primary action: Start free trial -> labelled enquiry form. Selecting a membership preselects its plan. Form feedback must state that a draft is prepared locally, since no backend exists; never promise a callback or transmit personal details.

Hierarchy: navigation / hero / existing gym numbers / programs / coaching method / interactive training roadmap / membership / FAQ / enquiry / footer.

Target screenshots: 390x844 and 1440x1000, dark and light. Also test layout at 320, 600, 768, 960, 1024 and 1920 CSS pixels.

Motion: native smooth anchor scrolling; reveal transitions; perspective card tilt; pointer and scroll driven WebGL rotation; continuous rendering pauses offscreen and in hidden tabs. Reduced motion disables animation, parallax, and smooth scrolling. Browsers without WebGL retain a readable decorative fallback.

Accessibility: semantic headings, navigation, labelled form controls, visible focus, Escape/outside-click menu dismissal, keyboard-accessible filtering and roadmap controls, a persistent theme button with an explicit next-action label, and at least 44px main control targets.

State contract: local images have layout dimensions and fallback surfaces; program filtering updates a live result count; validation reports incomplete/invalid form fields; success prepares a local enquiry preview; no loading or permission state is needed for server data because none is requested.

Loading-screen update: first-load theme-aware BEAST MODE logo, rotating ring and indeterminate progress line. Dismiss on hero-image/font readiness after at most a 650ms minimum presentation; a separate 4-second timeout releases the page if app loading fails. User input dismisses immediately. Reduced motion skips the minimum presentation and disables all loader animation. Without JavaScript, the loader stays hidden.
