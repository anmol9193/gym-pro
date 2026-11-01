# Milestone 1 interface contract

Primary specification: GYM_PRO_Codex_Implementation_Prompt.md. This supersedes
the provisional single-admin dashboard direction.

Use Bootstrap 5 and Alpine.js for a separate management surface. Keep the
existing public website and its Poppins assets. Management uses charcoal,
restrained orange and an accessible white light theme. No invented metrics.

Surfaces: Fortify login/reset/confirmation, shared role-aware sidebar/topbar,
admin foundation overview, role-specific receptionist/trainer/member entry
pages, account security, account access management, roles/permissions and a
protected configuration summary. These are foundation pages, not completed
membership/payment/training modules.

States: invalid login retains email and gives generic feedback; throttling gives
retry guidance; disabled accounts cannot sign in or continue a session; seeded
accounts must change passwords; unknown/forbidden role access is blocked on the
server; empty account searches offer reset; successful account/permission changes
confirm results. Local mail logging is explicitly distinguished from delivery.

Targets: 390x844, 768x1024, 1440x900 in both themes, plus 320px and short landscape.
Inputs remain >=16px, targets >=44px, tables scroll within their region, sidebar
supports keyboard close/focus return and mobile navigation. Keep stable layouts
while validation feedback appears. Public header gains accessible login access
without replacing its Contact action.

Render and exercise the real database-backed application. Feature tests must
cover every role, guest redirects, forbidden cross-role actions, privilege
escalation, account status, password reset/change, session invalidation and
safe/idempotent seeders. New operational modules remain pending in progress docs.
