# Staff guide — available foundation screens

Open `http://localhost:8000/login` on this development computer. The public site's
account icon/menu link also opens sign-in. A production URL is not deployed yet.

## First sign-in

Ask the gym administrator for your account and initial password through a private
channel. Local demo credentials are kept in the developer's private storage file,
not on the website. At first sign-in, set a new password with at least 12 characters,
uppercase/lowercase letters, a number and a symbol. Sign in again afterward.

Use **Profile & security** to update your own name/phone or password. Your email,
role and status cannot be changed through the profile form. Password changes sign
out existing sessions. Use **Sign out** when finishing on a shared computer;
leave “Keep me signed in” unchecked there.

The theme control switches dark/white modes and remembers the preference on the
device. On phones, open the menu button to see your permitted navigation links.
Escape closes the drawer when using a keyboard.

## Administrator workflow

- **Overview** displays actual system-account, role and public-product counts.
  Login accounts are not gym member profiles, and these are not revenue figures.
- **Accounts** supports search, role/status filters and pagination. Create a staff
  account with the correct role and privately share its initial password.
- **Manage access** changes another account's role/status. Suspending or disabling
  an account blocks login and revokes existing database sessions. Confirm before
  applying access changes. You cannot change your own access here.
- Gym Admin cannot create, promote or edit Super Admin accounts. Super Admin can
  edit other roles' permissions; these changes affect everyone with that role and
  are recorded in access activity. Super Admin's full access is protected.
- **Configuration** is a read-only summary. The developer manages configuration
  through private environment settings; database passwords are never displayed.

Receptionists, trainers and members currently see their own secure workspace and
profile/security links. Member registration, memberships, payment collection,
training assignments, plans and attendance tools are not available yet. Do not
use a foundation account as proof of membership or payment.

## If sign-in fails

Check the email/password. After repeated failures, wait for the displayed retry
period. Ask the administrator to check an inactive/suspended account. Forgot
password provides a generic response for privacy. In the current local setup,
reset links are logged privately and email is not delivered; the developer can
help test recovery. A real mail service must be configured before staff rely on it.

An access-denied screen means the current role does not permit that screen. Use
the return link to your own workspace. If a form session expires, reopen the form
and sign in again before resubmitting.
