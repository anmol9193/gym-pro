# Fit Health dashboard redesign

Reference: https://dribbble.com/shots/24685427-Fit-Health-Dashboard by Borkat Ullah.
Keep the reference's compact sidebar, two-chart layout, four metric cards,
trainer row and diet menu. The latest request matches the dashboard's theme to
the main website: inherit all palette and font tokens directly from styles.css,
use its citron actions, charcoal dark surfaces, white light theme, Poppins,
seven-pixel button corners and shared lightning-mark brand partial. Use the same
saved theme and system preference on both surfaces; no dashboard-only default.
Chart lines, fills, grid, status dots and icons follow these shared tokens.
Existing authenticated access, logout history fix and public site are preserved.
Remove the sidebar navigation search, the header sample-data badge and its
calendar shortcut. The header shows the signed-in user's initial avatar, name
and email. Its dropdown contains only Profile, Change Password and Logout, with
icon tiles, hover feedback and a divider above logout; no identity details are
repeated inside it. The dropdown fits mobile screens and dismisses on outside
click or Escape with focus restored. Profile edits the current user's name and
unique email. Password changes require the current password, confirmation and
eight characters; save a hash and rotate the session. Both account pages retain
authentication, administrator authorization, CSRF and no-store responses.
Dashboard and both account pages now use layouts/dashboard.blade.php and shared
sidebar, topbar, icon and footer partials. The sidebar stays fixed and the topbar
stays visible when scrolling. Links from account sidebars return to the actual
dashboard sections. Account content uses a responsive avatar/navigation column
beside the form; narrow screens stack these sections. The active account tab,
inline validation, success feedback and keyboard mobile drawer remain usable.
Personal information includes a labelled photo picker and unsaved local preview.
JPG, PNG and WebP are limited to 2 MB and 4096px per dimension. Saving stores a
randomly named file on the private local disk and updates the current user's
avatar path; only that signed-in administrator may fetch the image. Header,
sidebar and account summary share the saved photo, with the initial as fallback.
Replacing/removing a photo cleans up the old file after a successful database
save. Client errors and server validation leave the existing photo intact.
Keep the bottom account block fixed and navigation independently scrollable.
Sample content keeps contextual captions; request links open the contact form.

User job: scan fitness overview, switch workout/chart periods, browse trainers
and meals, find a class. Primary actions: workout selector, trainer enquiry,
program links. Hierarchy: summary, two charts, trainers, diet, class schedule.
Targets: 390x844, 768x1024, 1440x900; also check 320px and dark theme.
Mobile sidebar preserves keyboard trapping, Escape, focus restoration and inert
background. Inputs have labels, controls have visible focus, reduced motion is
respected. No new UI dependencies or external runtime asset requests.

States: synchronous rendering (no loading); empty class searches with
clear/reset recovery; valid selections announce updated sample charts; existing
auth handles guest redirects and member denial; all sample content is delivered
as one server-rendered response (no partial requests or new remote errors).
