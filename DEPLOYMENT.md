# Deployment notes — Milestone 1

The current delivery is a local foundation, not a production-approved gym system.
Memberships, payments, QR attendance, PWA and external notifications are pending.
Complete Milestone 10's deployment/security/backup checks before a live launch.

## Target server

Use Nginx + PHP-FPM 8.3+, Composer 2, MySQL 8 and Node 22.12+ for asset builds.
Point the web root to `/srv/gym-pro/public`; never serve the repository root.
The PHP-FPM user needs write access to `storage` and `bootstrap/cache`, not the
whole repository. Store uploaded member documents privately when Milestone 2 is
implemented; do not link the private storage directory into `public`.

Example Nginx application block (replace host/path/PHP socket for the server):

```nginx
server {
    listen 80;
    server_name gym.example.com;
    root /srv/gym-pro/public;
    index index.php;
    charset utf-8;
    location / { try_files $uri $uri/ /index.php?$query_string; }
    location ~ ^/index\.php(/|$) {
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }
    location ~ \.(php)$ { return 404; }
    location ~ /\.(?!well-known).* { deny all; }
}
```

Provision a valid TLS certificate, configure an HTTPS server block, then redirect
HTTP to HTTPS. Test renewal and HTTPS before enabling secure cookies. Configure
only the actual reverse proxy addresses as trusted proxies if a proxy is used.

## Release procedure

Back up first. Create a private `.env` with `APP_ENV=production`,
`APP_DEBUG=false`, the HTTPS `APP_URL`, a stable unique `APP_KEY`,
`SESSION_SECURE_COOKIE=true`, `SESSION_HTTP_ONLY=true`, `SESSION_SAME_SITE=lax`,
`SESSION_DRIVER=database`, correct `GYM_TIMEZONE` and database-scoped credentials.
Give the runtime DB account CRUD privileges; use a separate migration account
with schema privileges for releases. Do not use root or global privileges.

```bash
composer install --no-dev --prefer-dist --optimize-autoloader
npm ci
npm run build
php artisan migrate --force
php artisan db:seed --class=RolePermissionSeeder --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Generate the application key **once**, before storing encrypted data; preserve it
on subsequent releases and in secure backups. `composer setup` is local-only.
Never run `DemoAccountsSeeder` in production. The public catalog is demo content;
import it using `CatalogSeeder` only when explicitly appropriate. Create the
initial owner through `php artisan gym:create-admin owner@example.com` using its
private prompts. No public account-registration endpoint exists.

## Email, workers and future integrations

Configure a real Laravel SMTP transport and a verified sender. Test reset emails
with a controlled mailbox; a log entry is not proof of delivery. The local default
`MAIL_MAILER=log` is for development only.

`QUEUE_CONNECTION=sync` requires no worker for the foundation. When queued jobs
are introduced, use a managed worker process such as:

```bash
php artisan queue:work database --sleep=3 --tries=3 --timeout=90
```

Run it only after configuring the database queue and implemented jobs. Restart
workers on releases (`php artisan queue:restart`). Add a server cron entry
`* * * * * cd /srv/gym-pro && php artisan schedule:run >> /dev/null 2>&1` when
business schedules are introduced; `schedule:list` is currently empty.

Razorpay test/live credentials, webhook verification, WhatsApp and PWA setup are
not implemented in this milestone. Do not configure a payment callback or claim
payment/attendance verification. No service worker currently caches private data.

Before launch, verify login/logout/reset, each role boundary, account suspension,
asset delivery, error handling, secure/HttpOnly cookies, backups and restored data
on the actual deployment. Production deployment has not been performed here.
