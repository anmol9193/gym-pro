const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const origin = process.env.PREVIEW_ORIGIN || 'http://localhost:8000';

(async () => {
  const browser = await chromium.launch({executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true});
  const context = await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const page = await context.newPage(), errors = [], failed = [], writes = [], captures = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if(response.status() >= 400) failed.push(response.url()); });
  page.on('request', request => { if(request.method() !== 'GET') writes.push(request.url()); });
  const settle = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const visit = async route => { const response = await page.goto(origin + route); assert.equal(response.status(),200,route); await page.evaluate(() => document.fonts.ready); await settle(); };
  const capture = async (name, observation) => {
    const artifact = `portal-${name}.png`, v = page.viewportSize();
    await page.screenshot({path:path.join(__dirname,artifact)});
    captures.push({viewport:`${v.width}x${v.height}`,artifact,observation});
  };
  let layouts = 0;
  for(const theme of ['dark','light']) {
    for(const route of ['/login','/dashboard']) {
      await visit(route);
      await page.evaluate(theme => {document.documentElement.dataset.theme = theme;localStorage.setItem('beast-theme',theme);},theme);
      for(const [width,height] of [[320,740],[390,844],[768,1024],[844,390],[1024,900],[1200,900],[1440,900]]) {
        await page.setViewportSize({width,height}); await settle();
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),`${route}/${theme}/${width} overflows`);
        assert.equal(await page.locator('h1').count(),1);
        assert.equal(await page.locator('body').evaluate(e => getComputedStyle(e).fontFamily.split(',')[0].replaceAll('"','')), 'Poppins');
        if(theme === 'light') assert.equal(await page.locator('body').evaluate(e => getComputedStyle(e).backgroundColor),'rgb(255, 255, 255)');
        if([390,768,1440].includes(width)) await capture(`${route.slice(1)}-${width}-${theme}`,`${route} uses the public website's citron, charcoal, Poppins and white theme; viewport fits without horizontal overflow.`);
        layouts++;
      }
    }
  }
  await page.setViewportSize({width:390,height:844}); await visit('/login');
  await page.locator('#password').fill('not-a-real-password');
  await page.locator('[data-password-toggle]').click(); assert.equal(await page.locator('#password').getAttribute('type'),'text');
  await page.locator('[data-password-toggle]').click(); assert.equal(await page.locator('#password').getAttribute('type'),'password');
  await page.locator('#email').fill('invalid-email'); await page.locator('[type=submit]').click(); assert.ok(await page.locator('#email-error').isVisible());
  await capture('login-validation','Malformed optional email gives labelled validation feedback; preview can continue with the field empty.');
  await page.locator('#email').fill('private@example.test'); await page.locator('[type=submit]').click();
  await page.waitForURL(url => url.pathname === '/dashboard'); assert.equal(new URL(page.url()).search,'');
  await page.locator('#activity-period').selectOption('previous'); assert.equal(await page.locator('[data-visit-total]').textContent(),'377');
  await page.locator('#activity-period').selectOption('current'); assert.equal(await page.locator('[data-visit-total]').textContent(),'437');
  await page.locator('[data-class-filter=strength]').click(); assert.equal(await page.locator('[data-class-category]:visible').count(),1);
  await page.locator('#class-search').fill('no-matching-class'); assert.ok(await page.locator('.bp-schedule-empty').isVisible());
  await capture('schedule-empty','An unmatched sample class search offers reset; no member or account data is accessed.');
  await page.locator('[data-reset-classes]').click(); assert.equal(await page.locator('[data-class-category]:visible').count(),3);
  await page.locator('[data-class-filter=recovery]').click(); assert.match(await page.locator('[data-class-category]:visible').textContent(),/Yoga/);
  await page.locator('[data-class-filter=all]').click();
  await page.evaluate(() => scrollTo(0,0));
  const open = page.locator('[data-menu-open]'); await open.click(); await settle();
  assert.equal(await open.getAttribute('aria-expanded'),'true');
  assert.ok(await page.locator('[data-dashboard-main]').evaluate(e=>e.inert));
  await capture('mobile-navigation','The mobile drawer uses the same branding, labelled navigation, inert background and contained keyboard focus.');
  const last = page.locator('.bp-exit-link'); await last.focus(); await page.keyboard.press('Tab');
  assert.ok(await page.evaluate(() => document.querySelector('#portal-sidebar').contains(document.activeElement)));
  await page.keyboard.press('Escape'); await settle(); assert.equal(await open.getAttribute('aria-expanded'),'false'); assert.ok(await open.evaluate(e=>e===document.activeElement));
  assert.ok(await page.locator('#portal-sidebar').evaluate(e=>e.inert));
  await open.click(); await page.locator('#portal-sidebar a[href="#schedule"]').click(); assert.equal(new URL(page.url()).hash,'#schedule'); assert.equal(await open.getAttribute('aria-expanded'),'false');
  await page.locator('[data-theme-toggle]').click(); const stored = await page.evaluate(() => localStorage.getItem('beast-theme')); await page.reload(); assert.equal(await page.locator('html').getAttribute('data-theme'),stored);
  const nojs = await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const staticPage = await nojs.newPage(); await staticPage.goto(origin+'/login'); await staticPage.locator('[type=submit]').click(); await staticPage.waitForURL(url => url.pathname === '/dashboard'); assert.equal(await staticPage.locator('[data-class-category]:visible').count(),3); assert.ok(await staticPage.locator('.bp-exit-link').isVisible()); await nojs.close();
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.deepEqual(writes,[]);
  fs.writeFileSync(path.join(__dirname,'portal-test-results.json'),JSON.stringify({layouts,errors,failed,writes,captures},null,2));
  await browser.close(); console.log(`Passed ${layouts} themed layouts, preview navigation without credentials, validation, visibility toggle, sample chart/filters, mobile keyboard navigation and no-JS access.`);
})().catch(error=>{console.error(error);process.exit(1)});
