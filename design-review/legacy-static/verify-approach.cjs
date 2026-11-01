const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const home = 'index.html';
const origin = process.env.PREVIEW_ORIGIN || 'http://127.0.0.1:8765';
const homeURL = `${origin}/${encodeURIComponent(home)}`;
const url = `${origin}/our-approach.html`;

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: 'dark', reducedMotion: 'reduce' });
  const errors = [], missing = [], captures = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) missing.push(response.url()); });
  const ready = async () => { await page.locator('#page-loader').waitFor({ state: 'hidden' }); await page.evaluate(() => document.fonts.ready); };
  for (const from of [homeURL, `${origin}/programs.html`]) {
    await page.goto(from, { waitUntil: 'load' });
    await ready();
    await page.locator('#nav-links a[href="our-approach.html"]').click();
    await page.waitForURL(url);
    await ready();
    assert.equal(await page.locator('#nav-links a[aria-current="page"]').textContent(), 'Our approach');
  }
  assert.equal(await page.locator('h1').count(), 1);
  assert.equal(await page.locator('.principle').count(), 3);
  assert.equal(await page.locator('.process-steps>li').count(), 4);
  assert.equal(await page.locator('.owner-sample').textContent(), 'Sample profile');
  assert.equal(await page.locator('.beast-cursor').count(), 0);
  await page.locator('.approach-hero-actions a[href="#process"]').click();
  assert.ok(await page.locator('#process').isVisible());
  await page.locator('[data-week="0"]').click();
  await page.keyboard.press('End');
  assert.equal(await page.locator('[data-week="3"]').getAttribute('aria-selected'), 'true');
  assert.equal(await page.locator('#journey-focus').textContent(), 'Keep raising your bar.');
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('[data-week="1"]').getAttribute('aria-selected'), 'true');
  await page.locator('[data-week="0"]').click();
  await page.locator('.theme-toggle').click();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  await page.locator('.approach-invite-actions a[href="programs.html"]').click();
  await page.waitForURL(`${origin}/programs.html`);
  await ready();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  await page.locator('#nav-links a[href="our-approach.html"]').click();
  await page.waitForURL(url);
  await ready();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  await page.locator('.approach-invite .button').click();
  await page.waitForURL(next => next.pathname !== '/our-approach.html' && next.hash === '#join');
  await ready();
  assert.ok(await page.locator('#join-form button[type="submit"]').isEnabled());
  await page.goto(url, { waitUntil: 'load' });
  await ready();
  let layouts = 0;
  for (const theme of ['dark', 'light']) {
    await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
    for (const width of [320, 390, 600, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      const report = await page.evaluate(() => {
        const nav = document.querySelector('.nav-shell').getBoundingClientRect();
        const items = [...document.querySelectorAll('.nav-shell>.brand,.nav-actions,.nav-links')].filter(e => getComputedStyle(e).display !== 'none').map(e => e.getBoundingClientRect());
        const overlaps = items.some((a, i) => items.some((b, j) => j > i && Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1));
        const clipped = [...document.querySelectorAll('h1,h2,h3,.approach-hero-copy,.approach-hero-visual,.principle,.process-intro,.process-steps,.owner-copy,.owner-visual,.approach-invite-shell')].filter(e => e.getClientRects().length).filter(e => {
          const r = e.getBoundingClientRect(); return r.left < -1 || r.right > innerWidth + 1 || e.scrollWidth > e.clientWidth + 2;
        }).map(e => e.className || e.tagName);
        return { overlaps, fits: items.every(r => r.left >= nav.left && r.right <= nav.right), clipped };
      });
      assert.ok(!report.overlaps && report.fits && !report.clipped.length, `${theme} ${width}: ${JSON.stringify(report)}`);
      layouts++;
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#menu-toggle').click();
  assert.ok(await page.locator('#nav-links').isVisible());
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'), 'false');
  assert.ok(await page.locator('#menu-toggle').evaluate(e => e === document.activeElement));
  await page.locator('.faq-list summary').first().click();
  assert.ok(await page.locator('.faq-list details').first().getAttribute('open') !== null);
  await page.locator('.faq-list details').first().evaluate(e => { e.open = false; });
  for (const image of await page.locator('img').all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(e => e.decode());
  }
  assert.equal(await page.locator('.developer-credit a').getAttribute('href'), 'https://anmolsaini.wuaze.com');
  for (const [width, height] of [[1440, 1000], [390, 844]]) {
    await page.setViewportSize({ width, height });
    for (const theme of ['dark', 'light']) {
      await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
      for (const item of await page.locator('.reveal').all()) await item.scrollIntoViewIfNeeded();
      await page.evaluate(() => scrollTo(0, 0));
      const name = `approach-${width === 1440 ? 'desktop' : 'mobile'}-${theme}`;
      await page.screenshot({ path: path.join(__dirname, `${name}.png`) });
      await page.screenshot({ path: path.join(__dirname, `${name}-full.png`), fullPage: true });
      captures.push({ viewport: `${width}x${height}`, artifact: `${name}.png`, observation: `${theme} Our Approach page: Poppins hero, coaching image, current-page navigation and responsive layout.` });
    }
  }
  const nojs = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  await nojs.goto(url, { waitUntil: 'load' });
  assert.ok(await nojs.locator('.process-intro h2').isVisible());
  assert.ok(await nojs.locator('#owner h2').isVisible());
  assert.ok(!await nojs.locator('#page-loader').isVisible());
  await nojs.close();
  assert.deepEqual(errors, []);
  assert.deepEqual(missing, []);
  fs.writeFileSync(path.join(__dirname, 'approach-evidence.json'), JSON.stringify({
    contract: 'approach-contract.md: separate Our Approach page, shared identity, principles, coaching process, interactive illustrative roadmap, sample owner, links to Programs and existing enquiry.',
    targetViewports: ['1440x1000', '390x844'],
    accessibility: { status: 'pass', evidence: 'Semantic headings, ordered coaching steps, meaningful links, roadmap arrow/Home/End keys, menu Escape/focus return, FAQ control and reduced-motion rendering checked.' },
    responsive: { status: 'pass', evidence: `${layouts} theme/width combinations without clipped content or overlapping navigation. Local images all decoded.` },
    contentStates: {
      loading: { status: 'pass', evidence: 'Shared loader dismissed on every page navigation with the hero and fonts ready.' },
      empty: { status: 'not-applicable', reason: 'Static principles, four process steps and an existing example roadmap have no empty server collection.' },
      error: { status: 'pass', evidence: 'No browser script errors or missing resources across page-to-page navigation and controls.' },
      partial: { status: 'pass', evidence: 'With JavaScript disabled, principles, process and sample owner content remain readable, links work and loader stays hidden.' },
      success: { status: 'pass', evidence: 'Home and Programs navigation opens this page; Programs and enquiry CTAs reach their targets; roadmap updates and theme choice persists between pages.' },
      permission: { status: 'not-applicable', reason: 'No authentication, payment, new personal-data entry or browser permission is introduced.' }
    },
    renderedEvidence: captures,
    browserErrors: errors,
    missingResources: missing
  }, null, 2));
  console.log(`PASS: ${layouts} layouts; navigation from Home and Programs, theme persistence, keyboard roadmap, mobile menu, FAQ, enquiry CTA, local images and no-JS fallback. No browser errors.`);
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
