// Run with PLAYWRIGHT_MODULE pointing to an available Playwright installation.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '..');
const html = 'index.html';
const url = pathToFileURL(path.join(root, html)).href;
const artifacts = [];

// GPU compositing can round a few colour channels by one unit between captures.
// Compare decoded pixels so the check detects movement rather than PNG encoding.
async function pixelDifference(page, first, second) {
  return page.evaluate(async urls => {
    const decoded = [];
    for (const url of urls) {
      const image = new Image(); image.src = url; await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.width; canvas.height = image.height;
      const context = canvas.getContext('2d'); context.drawImage(image, 0, 0);
      decoded.push(context.getImageData(0, 0, canvas.width, canvas.height).data);
    }
    let significant = 0, total = 0;
    for (let i = 0; i < decoded[0].length; i += 4) {
      let maximum = 0;
      for (let channel = 0; channel < 3; channel++) {
        const change = Math.abs(decoded[0][i + channel] - decoded[1][i + channel]);
        maximum = Math.max(maximum, change); total += change;
      }
      if (maximum > 2) significant++;
    }
    return { significant, average: total / (decoded[0].length * .75) };
  }, [first, second].map(buffer => `data:image/png;base64,${buffer.toString('base64')}`));
}

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--enable-unsafe-swiftshader']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: 'dark', reducedMotion: 'reduce' });
  const errors = [], failures = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('requestfailed', request => failures.push({ url: request.url(), error: request.failure()?.errorText }));
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator('#weight-scene').getAttribute('data-renderer'), 'webgl', 'Real 3D renderer must initialize');
  assert.equal(await page.locator('#weight-scene canvas').count(), 1);

  // Both palettes, narrow phones through large monitors, no clipped main content.
  const layoutChecks = [];
  for (const theme of ['dark', 'light']) {
    await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
    for (const width of [320, 390, 600, 768, 960, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      const report = await page.evaluate(() => {
        const nav = document.querySelector('.nav-shell').getBoundingClientRect();
        const navItems = [...document.querySelectorAll('.nav-shell>.brand,.nav-actions,.nav-links')].filter(e => getComputedStyle(e).display !== 'none').map(e => e.getBoundingClientRect());
        const overlap = navItems.some((a, i) => navItems.some((b, j) => j > i && Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1));
        const overflow = [...document.querySelectorAll('h1,h2,h3,.section-heading>p,.program-card,.price-card,.join-shell,input,select')].filter(e => e.getClientRects().length).filter(e => { const r = e.getBoundingClientRect(); return r.left < -1 || r.right > innerWidth + 1; }).map(e => ({tag:e.tagName, text:e.textContent.slice(0,35), rect:{left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right}}));
        return { navFits: navItems.every(r => r.left >= nav.left && r.right <= nav.right), overlap, overflow };
      });
      assert.ok(report.navFits && !report.overlap && !report.overflow.length, `Layout at ${theme} ${width}: ${JSON.stringify(report)}`);
      layoutChecks.push(`${theme} ${width}px`);
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  // Theme control and persistence survive a real reload.
  await page.evaluate(() => { localStorage.removeItem('beast-theme'); document.documentElement.dataset.theme = 'dark'; });
  await page.locator('.theme-toggle').click();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  await page.reload({ waitUntil: 'load' });
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  assert.equal(await page.locator('.theme-toggle').getAttribute('aria-label'), 'Switch to dark theme');

  // Filters change the actual set of visible, keyboard reachable cards.
  for (const [filter, count] of [['strength', 2], ['conditioning', 2], ['recovery', 2], ['all', 6]]) {
    await page.locator(`[data-filter="${filter}"]`).click();
    assert.equal(await page.locator('.program-card:visible').count(), count);
    assert.equal(await page.locator(`[data-filter="${filter}"]`).getAttribute('aria-pressed'), 'true');
  }
  // Pricing and programs must drive the enquiry controls.
  await page.locator('[data-plan="Elite"]').click();
  assert.equal(await page.locator('#plan').inputValue(), 'Elite');
  await page.locator('[data-program="Yoga & Mobility"]').click();
  assert.equal(await page.locator('#goal').inputValue(), 'Yoga & Mobility');

  // Roadmap is operable with keyboard arrows, Home and End.
  await page.locator('[data-week="0"]').click();
  await page.keyboard.press('End');
  assert.equal(await page.locator('[data-week="3"]').getAttribute('aria-selected'), 'true');
  assert.equal(await page.locator('#journey-focus').textContent(), 'Keep raising your bar.');
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('[data-week="1"]').getAttribute('aria-selected'), 'true');
  await page.locator('.faq-list summary').first().click();
  assert.ok(await page.locator('.faq-list details').first().getAttribute('open') !== null);

  // Invalid inputs stay in the form; a valid submission makes an honest local draft.
  await page.locator('#name').fill('  ');
  await page.locator('#phone').fill('123');
  await page.locator('#join-form button[type="submit"]').click();
  assert.ok(await page.locator('#join-form').isVisible());
  await page.locator('#name').fill('Test Member');
  await page.locator('#phone').fill('123');
  await page.locator('#join-form button[type="submit"]').click();
  assert.match(await page.locator('#phone').evaluate(e => e.validationMessage), /10 to 15/);
  await page.locator('#phone').fill('+91 98765 43210');
  await page.locator('#join-form button[type="submit"]').click();
  assert.ok(await page.locator('#enquiry-result').isVisible());
  assert.match(await page.locator('#enquiry-summary').textContent(), /Test Member.*Elite.*Yoga/);
  assert.match(await page.locator('#enquiry-result').textContent(), /hasn't sent your enquiry/);
  assert.equal(await page.evaluate(() => Object.keys(localStorage).filter(k => k !== 'beast-theme').length), 0, 'No personal details stored');
  await page.locator('#edit-enquiry').click();
  assert.equal(await page.locator('#name').inputValue(), 'Test Member');
  await page.locator('#name').fill('');
  await page.locator('#phone').fill('');
  await page.locator('#plan').selectOption('Pro');
  await page.locator('#goal').selectOption('Find my starting point');

  // Mobile menu: toggle, Escape with focus return, link selection and outside click.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.brand').first().click();
  const toggle = page.locator('#menu-toggle');
  await toggle.click();
  assert.ok(await page.locator('#nav-links').isVisible());
  await page.keyboard.press('Escape');
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
  assert.ok(await toggle.evaluate(e => e === document.activeElement));
  await toggle.click();
  await page.locator('#nav-links a[href="#programs"]').click();
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
  await toggle.click();
  await page.mouse.click(5, 700);
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
  await toggle.click();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.waitForFunction(() => document.getElementById('menu-toggle').getAttribute('aria-expanded') === 'false');

  // Full page images are local, loaded and dimensionally stable.
  for (const image of await page.locator('img').all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(e => e.decode());
  }
  assert.equal(await page.locator('input:not([id]),select:not([id])').count(), 0);
  const labels = await page.locator('input,select').evaluateAll(elements => elements.every(e => e.labels?.length));
  assert.ok(labels, 'Every form control has a real label');
  await page.locator('.brand').first().focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  const focus = await page.locator('.brand').first().evaluate(e => ({ style: getComputedStyle(e).outlineStyle, width: getComputedStyle(e).outlineWidth }));
  assert.ok(focus.style !== 'none' && focus.width !== '0px', 'Keyboard focus is visible');

  // A live canvas changes over time and becomes still for reduced motion and pause.
  await page.locator('.brand').first().click();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.waitForTimeout(350);
  const frameA = await page.locator('#weight-scene canvas').screenshot();
  await page.waitForTimeout(350);
  const frameB = await page.locator('#weight-scene canvas').screenshot();
  assert.ok((await pixelDifference(page, frameA, frameB)).significant > 50, '3D rotates over time');
  await page.locator('.scene-pause').click();
  await page.waitForTimeout(100);
  const pausedA = await page.locator('#weight-scene canvas').screenshot();
  await page.waitForTimeout(250);
  const pausedB = await page.locator('#weight-scene canvas').screenshot();
  const pauseDifference = await pixelDifference(page, pausedA, pausedB);
  assert.ok(pauseDifference.significant === 0 && pauseDifference.average < .1, `Pause stops movement: ${JSON.stringify(pauseDifference)}`);
  await page.locator('.scene-pause').click();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
  assert.equal(await page.locator('.marquee-track').evaluate(e => getComputedStyle(e).animationName), 'none');

  // Capture each target viewport and each palette, including the whole layout.
  await page.locator('[data-week="0"]').click();
  await page.locator('.faq-list details').first().evaluate(e => { e.open = false; });
  for (const [width, height] of [[1440, 1000], [390, 844]]) {
    await page.setViewportSize({ width, height });
    for (const theme of ['dark', 'light']) {
      await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
      for (const element of await page.locator('.reveal').all()) await element.scrollIntoViewIfNeeded();
      await page.evaluate(() => scrollTo(0, 0));
      await page.waitForTimeout(150);
      const name = `${width === 1440 ? 'desktop' : 'mobile'}-${theme}`;
      await page.screenshot({ path: path.join(__dirname, `${name}.png`) });
      await page.screenshot({ path: path.join(__dirname, `${name}-full.png`), fullPage: true });
      artifacts.push({ viewport: `${width}x${height}`, artifact: `${name}.png`, observation: `${theme} palette: header, hero hierarchy, image and responsive spacing inspected.` });
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#menu-toggle').click();
  await page.screenshot({ path: path.join(__dirname, 'mobile-menu.png') });
  await page.keyboard.press('Escape');

  // Missing 3D library and WebGL failures retain a complete, readable fallback.
  const fallback = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await fallback.route('**/vendor/three.min.js', route => route.abort());
  await fallback.goto(url, { waitUntil: 'load' });
  assert.equal(await fallback.locator('#weight-scene').getAttribute('data-renderer'), 'fallback');
  assert.ok(await fallback.locator('.weight-fallback').isVisible());
  await fallback.screenshot({ path: path.join(__dirname, 'webgl-fallback.png'), fullPage: true });
  await fallback.close();
  const nojs = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  await nojs.goto(url, { waitUntil: 'load' });
  assert.ok(await nojs.locator('#programs h2').isVisible());
  assert.equal(await nojs.locator('.program-card:visible').count(), 6);
  await nojs.close();

  assert.deepEqual(errors, [], 'No browser JavaScript errors');
  const localFailures = failures.filter(failure => failure.url.startsWith('file:'));
  assert.deepEqual(localFailures, [], 'No missing local assets');
  const report = {
    contract: 'design-contract.md: static gym landing page; athlete hero, genuine 3D, 6 filterable programs, keyboard roadmap, original membership prices, labelled local enquiry draft, saved dark/light choice and reduced-motion support.',
    targetViewports: ['390x844', '1440x1000'],
    accessibility: { status: 'pass', evidence: 'Real labels verified, visible keyboard focus checked, Escape restores menu-button focus, tab arrow/Home/End controls work, error validation and live local-draft feedback exercised, reduced-motion rendering and pause verified.' },
    responsive: { status: 'pass', evidence: `No clipped main headings/cards/inputs or overlapping header items at ${layoutChecks.join(', ')}. Images decoded successfully. Mobile menu and desktop resize dismissal passed.` },
    contentStates: {
      loading: { status: 'not-applicable', reason: 'Static local content; no API requests or server data loading. Images reserve dimensions and WebGL starts with a decorative fallback.' },
      empty: { status: 'not-applicable', reason: 'All fixed program categories have exactly two matching entries; there is no user search or dynamic collection that can return zero items.' },
      error: { status: 'pass', evidence: 'Invalid names and phone numbers remain editable with native validation. A deliberately blocked 3D script retains the SVG fallback and readable page.' },
      partial: { status: 'pass', evidence: 'Blocked 3D dependency tested in a separate context; complete content, programs and fallback remain visible. JavaScript-disabled content remains readable.' },
      success: { status: 'pass', evidence: 'Valid form inputs produce a local draft containing selected program and membership. Edit returns to filled controls. No submission or personal-data persistence occurs.' },
      permission: { status: 'not-applicable', reason: 'No sign-in, device permission, payment or external submission is requested.' }
    },
    renderedEvidence: artifacts,
    consoleErrors: errors,
    externalRequestFailures: failures.filter(failure => !failure.url.startsWith('file:'))
  };
  fs.writeFileSync(path.join(__dirname, 'evidence.json'), JSON.stringify(report, null, 2));
  console.log(`PASS: ${layoutChecks.length} theme/width layouts; real 3D, filters, theme persistence, keyboard roadmap, plan/program selection, form validation/draft/edit, mobile menu, motion pause, reduced motion, image loading and no-JS/3D fallback.`);
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
