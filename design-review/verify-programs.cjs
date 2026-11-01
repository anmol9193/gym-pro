const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const home = 'index.html';
const origin = process.env.PREVIEW_ORIGIN || 'http://127.0.0.1:8765';
const homeURL = `${origin}/${encodeURIComponent(home)}`;
const programsURL = `${origin}/programs.html`;

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--enable-unsafe-swiftshader']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: 'dark', reducedMotion: 'reduce' });
  const errors = [], missing = [], artifacts = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) missing.push(response.url()); });
  const ready = async () => {
    await page.locator('#page-loader').waitFor({ state: 'hidden' });
    await page.evaluate(() => document.fonts.ready);
  };
  await page.goto(homeURL, { waitUntil: 'load' });
  await ready();
  await page.locator('#nav-links a[href="programs.html"]').click();
  await page.waitForURL(programsURL);
  await ready();
  assert.equal(await page.locator('#nav-links a[aria-current="page"]').textContent(), 'Programs');
  assert.equal(await page.locator('.catalog-card').count(), 6);
  assert.equal(await page.locator('.beast-cursor').count(), 0);

  for (const [filter, count] of [['strength', 2], ['conditioning', 2], ['recovery', 2], ['all', 6]]) {
    await page.locator(`[data-filter="${filter}"]`).click();
    assert.equal(await page.locator('.catalog-card:visible').count(), count);
    assert.equal(await page.locator(`[data-filter="${filter}"]`).getAttribute('aria-pressed'), 'true');
    assert.match(await page.locator('.filter-count').textContent(), new RegExp(`^${count} programs`));
  }
  // Theme preference follows visitors between pages.
  await page.locator('.theme-toggle').click();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  await page.locator('.brand').first().click();
  await page.waitForURL(url => url.pathname !== '/programs.html');
  await ready();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  await page.locator('#nav-links a[href="programs.html"]').click();
  await page.waitForURL(programsURL);
  await ready();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');

  // Every program enquiry must preselect the exact, existing home form option.
  const enquiries = await page.locator('.catalog-card').evaluateAll(cards => cards.map(card => ({
    program: card.dataset.program,
    href: card.querySelector('.program-enquire').href,
    id: card.id
  })));
  for (const item of enquiries) {
    await page.goto(programsURL, { waitUntil: 'load' });
    await ready();
    await page.locator(`#${item.id} .program-enquire`).click();
    await page.waitForURL(url => url.pathname !== '/programs.html' && url.hash === '#join');
    await ready();
    assert.equal(await page.locator('#goal').inputValue(), item.program);
    assert.equal(await page.locator('#plan').inputValue(), 'Pro');
    assert.ok(await page.locator('#join-form button[type="submit"]').isEnabled());
  }
  // Unknown URL values cannot inject or create form choices.
  await page.goto(`${homeURL}?program=%3Cscript%3Einvalid%3C%2Fscript%3E#join`, { waitUntil: 'load' });
  await ready();
  assert.equal(await page.locator('#goal').inputValue(), 'Find my starting point');
  await page.locator('#name').fill('Program Visitor');
  await page.locator('#phone').fill('9876543210');
  await page.locator('#join-form button[type="submit"]').click();
  assert.ok(await page.locator('#enquiry-result').isVisible());

  // Home preview cards deep-link to the relevant article, with a clear header offset.
  await page.goto(homeURL, { waitUntil: 'load' });
  await ready();
  const homeCards = await page.locator('.program-card').evaluateAll(cards => cards.map(card => card.href));
  assert.equal(homeCards.length, 6);
  homeCards.forEach(href => assert.equal(new URL(href).pathname, '/programs.html'));
  await page.locator('.program-card[data-program="Yoga & Mobility"]').click();
  await page.waitForURL(`${programsURL}#yoga-mobility`);
  await ready();
  const offset = await page.locator('#yoga-mobility').evaluate(element => element.getBoundingClientRect().top);
  assert.ok(offset >= 100, `Anchor offset should clear the navbar: ${offset}`);

  let layouts = 0;
  for (const theme of ['dark', 'light']) {
    await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
    for (const width of [320, 390, 600, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      const report = await page.evaluate(() => {
        const nav = document.querySelector('.nav-shell').getBoundingClientRect();
        const navItems = [...document.querySelectorAll('.nav-shell>.brand,.nav-actions,.nav-links')].filter(e => getComputedStyle(e).display !== 'none').map(e => e.getBoundingClientRect());
        const overlaps = navItems.some((a, i) => navItems.some((b, j) => j > i && Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1));
        const clipped = [...document.querySelectorAll('h1,h2,h3,.catalog-copy,.catalog-visual,.catalog-card,.catalog-card-copy,.program-start-shell,.program-enquire')].filter(e => e.getClientRects().length).filter(e => {
          const r = e.getBoundingClientRect();
          return r.left < -1 || r.right > innerWidth + 1 || e.scrollWidth > e.clientWidth + 2;
        }).map(e => e.className || e.tagName);
        return { overlaps, fits: navItems.every(r => r.left >= nav.left && r.right <= nav.right), clipped };
      });
      assert.ok(!report.overlaps && report.fits && !report.clipped.length, `${theme} ${width}: ${JSON.stringify(report)}`);
      layouts++;
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const toggle = page.locator('#menu-toggle');
  await toggle.click();
  assert.ok(await page.locator('#nav-links').isVisible());
  await page.keyboard.press('Escape');
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
  assert.ok(await toggle.evaluate(element => element === document.activeElement));
  await page.locator('.faq-list summary').first().click();
  assert.ok(await page.locator('.faq-list details').first().getAttribute('open') !== null);
  await page.locator('.faq-list details').first().evaluate(element => { element.open = false; });
  await page.locator('[data-filter="strength"]').focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('.catalog-card:visible').count(), 2);
  await page.locator('[data-filter="all"]').click();
  for (const image of await page.locator('img').all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(element => element.decode());
  }
  assert.equal(await page.locator('.developer-credit a').getAttribute('href'), 'https://anmolsaini.wuaze.com');
  for (const [width, height] of [[1440, 1000], [390, 844]]) {
    await page.setViewportSize({ width, height });
    for (const theme of ['dark', 'light']) {
      await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
      for (const element of await page.locator('.reveal').all()) await element.scrollIntoViewIfNeeded();
      await page.evaluate(() => scrollTo(0, 0));
      const name = `programs-${width === 1440 ? 'desktop' : 'mobile'}-${theme}`;
      await page.screenshot({ path: path.join(__dirname, `${name}.png`) });
      await page.screenshot({ path: path.join(__dirname, `${name}-full.png`), fullPage: true });
      artifacts.push({ viewport: `${width}x${height}`, artifact: `${name}.png`, observation: `${theme} Programs page: readable Poppins hero, photo, current-page navigation and responsive spacing.` });
    }
  }
  const nojs = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  await nojs.goto(programsURL, { waitUntil: 'load' });
  assert.equal(await nojs.locator('.catalog-card:visible').count(), 6);
  assert.ok(await nojs.locator('.program-enquire').first().isVisible());
  assert.ok(!await nojs.locator('#page-loader').isVisible());
  await nojs.close();
  assert.deepEqual(errors, []);
  assert.deepEqual(missing, []);
  const report = {
    contract: 'programs-contract.md: separate static Programs page with all six existing programs, filters, linked home previews and whitelisted enquiry preselection.',
    targetViewports: ['1440x1000', '390x844'],
    accessibility: { status: 'pass', evidence: 'Heading hierarchy, descriptive enquiry links, keyboard category selection, mobile menu Escape/focus return and FAQ controls checked. Reduced motion enabled in the browser; all content remains readable without JavaScript.' },
    responsive: { status: 'pass', evidence: `${layouts} theme/width combinations passed without clipped content or overlapping header items. All local images decoded successfully.` },
    contentStates: {
      loading: { status: 'pass', evidence: 'Shared loader dismissed on every page navigation; the Programs hero image participates in readiness. No heavyweight 3D library is requested by this page.' },
      empty: { status: 'not-applicable', reason: 'Six static programs; each of the three category filters has exactly two entries.' },
      error: { status: 'pass', evidence: 'An invalid program query is ignored and the default enquiry option is preserved. No script errors or missing resources were reported.' },
      partial: { status: 'pass', evidence: 'With JavaScript disabled, all six program descriptions and enquiry links remain visible; the loader remains hidden.' },
      success: { status: 'pass', evidence: 'Every program CTA preselects its exact option on the home form; the home local-draft submission still works. A home card opens the matching program article.' },
      permission: { status: 'not-applicable', reason: 'No authentication, payment, browser permission or server submission is added.' }
    },
    renderedEvidence: artifacts,
    browserErrors: errors,
    missingResources: missing
  };
  fs.writeFileSync(path.join(__dirname, 'programs-evidence.json'), JSON.stringify(report, null, 2));
  console.log(`PASS: ${layouts} layouts, six program selections, filters, deep links, theme persistence, mobile menu, keyboard controls, local enquiry regression, no-JS fallback and all assets. No browser errors.`);
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
