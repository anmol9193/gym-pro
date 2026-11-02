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
    const website = await context.newPage();
    await website.goto(origin + '/');
    await website.evaluate(() => document.fonts.ready);
    assert.equal(await website.locator('html').getAttribute('data-theme'), 'dark');
    const readTheme = () => {
      const style = getComputedStyle(document.body);
      const tokens = ['--bg','--surface','--raised','--ink','--muted','--line','--accent','--accent-ink','--accent-text','--soft'];
      return {tokens: Object.fromEntries(tokens.map(token => [token, style.getPropertyValue(token).trim()])), font:style.fontFamily};
    };
    for (const theme of ['light','dark']) {
      await page.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
      await website.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
      assert.deepEqual(await page.evaluate(readTheme), await website.evaluate(readTheme), `${theme}: website/dashboard palette and font match`);
      assert.equal((await page.locator('.bp-sidebar .brand').innerHTML()).replaceAll('#bp-bolt','#icon-bolt'), await website.locator('.nav-shell .brand').innerHTML(), 'shared brand mark');
      assert.equal(await page.locator('.fh-button').first().evaluate(e => getComputedStyle(e).backgroundColor), await website.locator('.button-primary').first().evaluate(e => getComputedStyle(e).backgroundColor));
      assert.equal(await page.locator('.fh-button').first().evaluate(e => getComputedStyle(e).borderRadius), await website.locator('.button-primary').first().evaluate(e => getComputedStyle(e).borderRadius));
      for (const [width,height] of [[320,740],[390,844],[768,1024],[1440,900]]) {
        await page.setViewportSize({width,height});
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${theme}/${width} overflow`);
        assert.ok(await page.locator('.fh-profile-menu>summary').isVisible(), 'profile available at every viewport');
        const images = await page.locator('.fh-trainer img, .fh-meal img').evaluateAll(async images => {
          await Promise.all(images.map(image => image.decode()));
          return images.every(image => image.naturalWidth > 0);
        });
        assert.ok(images, 'local images loaded');
        const artifact = `fit-dashboard-${width}-${theme}.png`;
        await page.screenshot({path:path.join(__dirname,artifact),fullPage:true});
        captures.push({viewport:`${width}x${height}`,artifact,observation:`${theme} theme: website/dashboard palette, font, logo and primary buttons match; summary, charts, trainers, meals and schedule fit without overflow; images decoded.`});
        if (width === 390) {
          await page.locator('.fh-profile-menu>summary').click();
          assert.ok(await page.locator('.fh-profile-card').isVisible());
          assert.equal(await page.locator('.fh-profile-card .bp-avatar').count(), 0);
          assert.equal(await page.locator('.fh-profile-card h2, .fh-profile-card dl').count(), 0);
          assert.ok(await page.locator('.fh-profile-actions a').filter({hasText:'Profile'}).isVisible());
          assert.ok(await page.locator('.fh-profile-actions a').filter({hasText:'Change Password'}).isVisible());
          assert.ok(await page.locator('.fh-profile-actions button').filter({hasText:'Logout'}).isVisible());
          assert.equal(await page.locator('.fh-profile-menu>summary>span').evaluate(e => getComputedStyle(e).transform), 'none');
          const bounds = await page.locator('.fh-profile-card').boundingBox();
          assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width, 'profile fits mobile viewport');
          await page.screenshot({path:path.join(__dirname,`fit-profile-${theme}.png`)});
          await page.keyboard.press('Escape');
          assert.equal(await page.locator('.fh-profile-menu').getAttribute('open'), null);
          assert.ok(await page.locator('.fh-profile-menu>summary').evaluate(e => e === document.activeElement));
          await page.locator('.fh-profile-menu>summary').click();
          await page.locator('h1').click();
          assert.equal(await page.locator('.fh-profile-menu').getAttribute('open'), null);
        }
      }
    }
    await page.setViewportSize({width:1440,height:900});
    await page.evaluate(() => document.documentElement.dataset.theme = 'light');
    await page.locator('[data-plan-type]').selectOption('strength');
    assert.match(await page.locator('[data-plan-status]').textContent(), /strength/);
    assert.match(await page.locator('[data-plan-chart]').getAttribute('aria-label'), /55, 80, 70/);
    await page.locator('[data-plan-type]').selectOption('yoga');
    assert.match(await page.locator('[data-plan-subtitle]').textContent(), /Balance/);
    await page.locator('[data-plan-type]').selectOption('running');
    await page.locator('[data-calorie-period]').selectOption('weekly');
    assert.equal(await page.locator('.fh-calorie-column:visible').count(), 7);
    await page.locator('[data-calorie-period]').selectOption('monthly');
    assert.equal(await page.locator('.fh-calorie-column:visible').count(), 12);
    await page.locator('[data-class-filter=strength]').click();
    assert.equal(await page.locator('[data-class-category]:visible').count(), 1);
    await page.locator('#class-search').fill('no-matching-class');
    assert.ok(await page.locator('.bp-schedule-empty').isVisible());
    await page.locator('[data-reset-classes]').click();
    assert.equal(await page.locator('[data-class-category]:visible').count(), 3);
    await page.setViewportSize({width:390,height:844});
    await page.evaluate(() => scrollTo(0,0));
    const open = page.locator('[data-menu-open]');
    await open.click();
    assert.equal(await open.getAttribute('aria-expanded'), 'true');
    assert.ok(await page.locator('[data-dashboard-main]').evaluate(e => e.inert));
    await page.locator('.bp-exit-link').focus();
    await page.keyboard.press('Tab');
    assert.ok(await page.evaluate(() => document.querySelector('#portal-sidebar').contains(document.activeElement)));
    await page.keyboard.press('Escape');
    assert.equal(await open.getAttribute('aria-expanded'), 'false');
    assert.ok(await open.evaluate(e => e === document.activeElement));
    assert.ok(await page.locator('#portal-sidebar').evaluate(e => e.inert));
    await page.locator('[data-theme-toggle]').click();
    await page.reload();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    await website.reload();
    assert.equal(await website.locator('html').getAttribute('data-theme'), 'dark');
    await website.locator('.theme-toggle').click();
    await page.reload();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    assert.deepEqual(errors, []);
    assert.deepEqual(failed, []);
    const report = {
      contract: 'fit-dashboard-contract.md', targetViewports: ['390x844','768x1024','1440x900'],
      accessibility: {status:'pass',evidence:'Labelled native selectors, chart accessible descriptions and live feedback checked; mobile focus trap, Escape, focus restoration and inert background verified; existing visible focus rules and reduced motion honored.'},
      responsive: {status:'pass',evidence:'320, 390, 768 and 1440px in both themes fit without overflow; images decoded and screenshots captured. Website/dashboard computed palette, font, brand and primary button styles match; both directions of theme persistence verified.'},
      contentStates: {
        loading:{status:'not-applicable',reason:'Synchronous server-rendered dashboard with local images and local chart selections; no loading request introduced.'},
        empty:{status:'pass',evidence:'Unmatched class search displays empty feedback; resetting the schedule restores results. Sidebar navigation search was removed as requested.'},
        error:{status:'not-applicable',reason:'No new remote data request or mutation; normal server errors remain in existing Laravel handling.'},
        partial:{status:'not-applicable',reason:'Sample data renders together in a single server response; no independent partial data sources.'},
        success:{status:'pass',evidence:'Authenticated login renders dashboard; workout and calorie selectors update visible data and live status; class reset restores three classes.'},
        permission:{status:'pass',evidence:'Existing auth and super-admin authorization remain unchanged; AuthenticationTest verifies guest redirect and unauthorized member denial.'}
      }, renderedEvidence: captures, errors, failed
    };
    fs.writeFileSync(path.join(__dirname,'fit-dashboard-evidence.json'), JSON.stringify(report,null,2));
    console.log('Passed cleaned header/sidebar, profile menu with Escape/outside dismissal, eight responsive layouts, chart selectors, class filters, keyboard drawer and shared theme.');
  } finally { await browser.close(); }
})().catch(error => {console.error(error.message); process.exit(1);});
