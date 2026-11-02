const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const origin = process.env.PREVIEW_ORIGIN || 'http://localhost:8000';
const env = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
const envValue = name => {
  const value = env.match(new RegExp(`^${name}=(.*)$`, 'm'))?.[1]?.trim() || '';
  return value.replace(/^(["'])(.*)\1$/, '$2');
};
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const context = await browser.newContext({viewport: {width:1440,height:900}, reducedMotion:'reduce', colorScheme:'dark'});
    const page = await context.newPage(), errors = [], failed = [], captures = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if(response.status() >= 400) failed.push({url:response.url(),status:response.status()}); });
    await page.goto(origin + '/login');
    await page.locator('#email').fill(process.env.QA_ADMIN_EMAIL || envValue('SUPER_ADMIN_EMAIL') || 'superadmin@gmail.com');
    await page.locator('#password').fill(process.env.QA_ADMIN_PASSWORD || envValue('SUPER_ADMIN_PASSWORD'));
    await page.locator('button[type=submit]').click();
    await page.waitForURL('**/dashboard');
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    assert.equal(await page.locator('h1').textContent(), 'Dashboard');
    assert.equal(await page.locator('[data-nav-search]').count(), 0);
    assert.equal(await page.locator('.bp-topbar .fh-sample-badge').count(), 0);
    assert.equal(await page.locator('.fh-calendar-shortcut').count(), 0);

    await page.locator('.fh-profile-menu>summary').click();
    assert.ok(await page.locator('.fh-profile-actions a[href$="/profile"]').isVisible());
    assert.ok(await page.locator('.fh-profile-actions a[href$="/change-password"]').isVisible());
    assert.ok(await page.locator('.fh-profile-actions button').isVisible());
    await page.locator('.fh-profile-actions a[href$="/profile"]').click();
    await page.waitForURL('**/profile');
    assert.ok(await page.locator('#name').inputValue());
    assert.match(await page.locator('#email').inputValue(), /@/);
    for (const theme of ['dark','light']) {
      for (const route of ['/profile','/change-password']) {
        await page.goto(origin + route);
        await page.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
        for (const [width,height] of [[320,740],[390,844],[768,1024],[1440,900]]) {
          await page.setViewportSize({width,height});
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route + ' overflow');
          assert.equal(await page.locator('.bp-topbar h1').textContent(), 'Account settings');
          assert.equal(await page.locator('h1').count(), 1);
          assert.equal(await page.locator('#portal-sidebar').evaluate(e => getComputedStyle(e).position), 'fixed');
          assert.equal(await page.locator('.bp-topbar').evaluate(e => getComputedStyle(e).position), 'sticky');
          assert.match(await page.locator('.bp-sidebar-nav a').filter({hasText:'Workout Statistic'}).getAttribute('href'), /\/dashboard#activity$/);
          assert.ok(await page.locator('.fh-settings-tabs a[aria-current]').isVisible());
          await page.evaluate(() => scrollTo(0,500));
          assert.equal(Math.round(await page.locator('.bp-topbar').evaluate(e => e.getBoundingClientRect().top)), 0);
          await page.evaluate(() => scrollTo(0,0));
          if(width <= 900) {
            await page.locator('[data-menu-open]').click();
            assert.ok(await page.locator('[data-dashboard-main]').evaluate(e => e.inert));
            const account = await page.locator('.bp-sidebar-bottom').boundingBox();
            assert.ok(account.y + account.height <= height, 'sidebar account fixed at bottom');
            await page.locator('.bp-exit-link').focus();
            await page.keyboard.press('Tab');
            assert.ok(await page.evaluate(() => document.querySelector('#portal-sidebar').contains(document.activeElement)));
            await page.keyboard.press('Escape');
            assert.equal(await page.locator('[data-menu-open]').getAttribute('aria-expanded'), 'false');
          }
          await page.locator('.fh-profile-menu>summary').click();
          assert.ok(await page.locator('.fh-profile-actions a[href$="/profile"]').isVisible());
          await page.keyboard.press('Escape');
          await page.screenshot({path:'design-review/account-' + route.slice(1) + '-' + width + '-' + theme + '.png',fullPage:true});
        }
      }
    }
    await page.locator('#current_password').fill('incorrect-test-password');
    await page.locator('#password').fill('new-test-password-123');
    await page.locator('#password_confirmation').fill('new-test-password-123');
    await page.locator('.fh-settings-form button[type=submit]').click();
    await page.waitForURL('**/change-password');
    assert.ok(await page.locator('#current-password-error').isVisible());
    assert.equal(await page.locator('#current_password').inputValue(), '');
    assert.equal(await page.locator('#password').inputValue(), '');
    await page.locator('.fh-account-breadcrumb a[href$="/dashboard"]').click();
    await page.waitForURL('**/dashboard');
    await page.locator('.fh-profile-menu>summary').click();
    await page.locator('.fh-profile-actions button').click();
    await page.waitForURL('**/login');
    await page.goBack();
    await page.waitForURL('**/login');
    assert.deepEqual(errors,[]);
    assert.deepEqual(failed,[]);
    console.log('Passed 16 settings layouts with shared fixed sidebar/sticky topbar, section links, mobile keyboard drawer, dropdown, validation, logout and Back protection.');
  } finally { await browser.close(); }
})().catch(error => {console.error(error.message);process.exit(1);});
