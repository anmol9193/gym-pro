# Backup and restore — foundation procedure

This procedure describes the current MySQL foundation. A full restore drill and
production backup automation remain Milestone 10 work; no recovery SLA is claimed.
Never test a restore over the live `gym_pro` database.

## Back up

Use a separate backup account with only the required database read privileges.
Keep its credentials in a protected MySQL option file, not shell arguments. A
typical InnoDB logical dump is:

```bash
mysqldump --defaults-extra-file=/secure/gym-backup.cnf --single-transaction --quick --no-tablespaces --set-gtid-purged=OFF --result-file=/secure/backups/gym-pro.sql gym_pro
```

`--defaults-extra-file` must be the first option. Protect and encrypt the dump;
it includes account details, password hashes, session data and audit records.
Use `--result-file` on Windows too, avoiding shell redirection encoding changes.
Run without concurrent schema changes. Back up private storage separately as
documents/uploads are introduced, and store the matching `APP_KEY`/environment
secrets in an encrypted vault with restricted access. Do not back up local demo
credential files into a publicly accessible location.

Record the source revision, backup time, gym timezone, database version, size and
checksum. Keep encrypted copies off the application host. A reasonable initial
retention policy is daily backups for seven days plus weekly backups for four
weeks; the gym owner must choose the actual retention/recovery requirements.
Monitor failures and periodically restore a backup; a scheduled task alone is
not evidence of a usable backup.

## Restore into an isolated database

1. Provision a separate MySQL database such as `gym_pro_restore_check` and an
   account scoped only to it. Never reuse the live database name in the drill.
2. Use MySQL's client to import the dump, avoiding PowerShell text re-encoding:

   ```text
   mysql --defaults-extra-file=/secure/gym-restore.cnf gym_pro_restore_check
   mysql> SOURCE /secure/backups/gym-pro.sql;
   ```

3. Use a separate application checkout/environment with the source revision,
   matching key and restored DB credentials. Keep outbound email/gateways off;
   use the log mailer. Remove restored sessions before allowing any user access.
4. Run `php artisan migrate:status`, inspect record counts/relationships, verify
   account roles, and check representative catalog/audit records. Apply pending
   migrations only after reviewing the source/target versions and taking a copy.
5. Test a controlled account login and authorization on the isolated app, confirm
   private storage is inaccessible through public URLs, and record the outcome.

A real disaster recovery procedure must additionally validate all membership,
financial, receipt, attendance and file records once those modules exist. Keep
audit history; do not repair financial history by deleting rows. Schema rollback
is not a substitute for a backup.
