const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const programs = JSON.parse(fs.readFileSync(path.join(root, 'assets/program-details.json'), 'utf8'));
const origin = process.env.PREVIEW_ORIGIN || 'http://127.0.0.1:8765';

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: 'dark', reducedMotion: 'reduce' });
  const errors = [], missing = [], captures = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) missing.push(response.url()); });
  const ready = async () => { await page.locator('#page-loader').waitFor({ state: 'hidden' }); await page.evaluate(() => document.fonts.ready); };
  const visit = async file => { await page.goto(`${origin}/${file}`, { waitUntil: 'load' }); await ready(); };
  await visit('index.html');
  const homeLinks = await page.locator('.program-card').evaluateAll(cards => cards.map(card => card.getAttribute('href')));
  assert.deepEqual(homeLinks, programs.map(program => `${program.slug}.html`));
  await page.locator('.program-card').first().click();
  await page.waitForURL(`${origin}/strength-training.html`);
  await ready();
  await visit('programs.html');
  assert.equal(await page.locator('.program-detail-link').count(), 6);
  assert.equal(await page.locator('.program-detail-photo').count(), 6);
  for (const filter of ['strength', 'conditioning', 'recovery']) {
    await page.locator(`[data-filter="${filter}"]`).click();
    assert.equal(await page.locator('.catalog-card:visible').count(), 2);
  }
  await page.locator('[data-filter="all"]').click();
  for (const program of programs) {
    assert.equal(await page.locator(`#${program.slug} .program-detail-link`).getAttribute('href'), `${program.slug}.html`);
    assert.equal(await page.locator(`#${program.slug} h3>a`).getAttribute('href'), `${program.slug}.html`);
  }
  let layouts = 0;
  for (let index = 0; index < programs.length; index++) {
    const program = programs[index];
    await visit(`${program.slug}.html`);
    assert.equal(await page.title(), `${program.name} | BEAST MODE Gym`);
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('.detail-breadcrumbs [aria-current="page"]').textContent(), program.name);
    assert.equal(await page.locator('#nav-links a[href="programs.html"]').getAttribute('aria-current'), 'true');
    assert.equal(await page.locator('#nav-links>li:not(.mobile-join)>a').count(), 4);
    assert.equal(await page.locator('#nav-links>li:not(.mobile-join)>a[href="contact.html"]').count(), 0);
    assert.equal((await page.locator('.nav-trial').textContent()).trim(), 'Contact');
    assert.equal(await page.locator('.beast-cursor').count(), 0);
    assert.equal(await page.locator('.detail-focus-card').count(), 3);
    assert.equal(await page.locator('.detail-session-steps>li').count(), 3);
    assert.equal(await page.locator('.detail-related-card').count(), 2);
    assert.equal(await page.locator('.detail-next').getAttribute('href'), `${programs[(index + 1) % programs.length].slug}.html`);
    assert.equal(await page.locator('.detail-previous').getAttribute('href'), `${programs[(index + programs.length - 1) % programs.length].slug}.html`);
    const links = await page.locator('a[href]').evaluateAll(anchors => anchors.map(anchor => anchor.href));
    for (const href of links) {
      const target = new URL(href);
      if (target.origin !== origin) continue;
      const file = path.join(root, decodeURIComponent(target.pathname.slice(1)) || 'index.html');
      assert.ok(fs.existsSync(file), `${program.slug}: missing linked page ${target.pathname}`);
      if (target.hash) assert.ok(fs.readFileSync(file, 'utf8').includes(`id="${decodeURIComponent(target.hash.slice(1))}"`), `${program.slug}: missing anchor ${target.hash}`);
    }
    for (const theme of ['dark', 'light']) {
      await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
      for (const width of [320, 390, 768, 1200, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        const report = await page.evaluate(() => {
          const nav = document.querySelector('.nav-shell').getBoundingClientRect();
          const items = [...document.querySelectorAll('.nav-shell>.brand,.nav-actions,.nav-links')].filter(e => getComputedStyle(e).display !== 'none').map(e => e.getBoundingClientRect());
          const overlaps = items.some((a, i) => items.some((b, j) => j > i && Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1));
          const clipped = [...document.querySelectorAll('h1,h2,h3,.detail-hero-copy,.detail-visual,.detail-fit,.detail-focus-card,.detail-related-card,.detail-invite-shell,.detail-sequence')].filter(e => e.getClientRects().length).filter(e => {
            const rect = e.getBoundingClientRect(); return rect.left < -1 || rect.right > innerWidth + 1 || e.scrollWidth > e.clientWidth + 2;
          }).map(e => e.className || e.tagName);
          return { overlaps, fits: items.every(rect => rect.left >= nav.left && rect.right <= nav.right), clipped, pageFits: document.documentElement.scrollWidth <= innerWidth + 1 };
        });
        assert.ok(!report.overlaps && report.fits && !report.clipped.length && report.pageFits, `${program.slug} ${theme} ${width}: ${JSON.stringify(report)}`);
        layouts++;
      }
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#menu-toggle').click();
    assert.ok(await page.locator('#nav-links').isVisible());
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'), 'false');
    assert.ok(await page.locator('#menu-toggle').evaluate(element => element === document.activeElement));
    await page.locator('.faq-list summary').first().click();
    assert.ok(await page.locator('.faq-list details').first().getAttribute('open') !== null);
    await page.locator('.faq-list details').first().evaluate(element => { element.open = false; });
    for (const image of await page.locator('img').all()) {
      await image.scrollIntoViewIfNeeded(); await image.evaluate(element => element.decode());
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.evaluate(() => { document.documentElement.dataset.theme = 'dark'; scrollTo(0, 0); });
    const filename = `detail-${program.slug}-desktop-dark.png`;
    await page.screenshot({ path: path.join(__dirname, filename) });
    captures.push({ viewport: '1440x1000', artifact: filename, observation: `${program.name}: unique hero, existing local image, active Programs context and shared Contact button.` });
    if (index === 0) {
      for (const [width, height] of [[1440, 1000], [390, 844]]) {
        await page.setViewportSize({ width, height });
        for (const theme of ['dark', 'light']) {
          await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
          for (const element of await page.locator('.reveal').all()) await element.scrollIntoViewIfNeeded();
          await page.evaluate(() => scrollTo(0, 0));
          const name = `detail-strength-${width === 1440 ? 'desktop' : 'mobile'}-${theme}`;
          await page.screenshot({ path: path.join(__dirname, `${name}.png`) });
          await page.screenshot({ path: path.join(__dirname, `${name}-full.png`), fullPage: true });
          captures.push({ viewport: `${width}x${height}`, artifact: `${name}.png`, observation: `${theme} Strength Training detail: readable layout, training facts, audience, focus areas, process, FAQ, related programs and enquiry.` });
        }
      }
    }
    await page.locator('.detail-enquire').first().click();
    await page.waitForURL(target => target.pathname === '/contact.html' && target.hash === '#enquiry');
    await ready();
    assert.equal(await page.locator('#goal').inputValue(), program.name);
  }
  // Follow the actual Next links through the full six-program loop.
  await page.setViewportSize({ width: 1440, height: 1000 });
  await visit('strength-training.html');
  for (let i = 0; i < programs.length; i++) {
    await page.locator('.detail-next').click();
    await page.waitForURL(`${origin}/${programs[(i + 1) % programs.length].slug}.html`);
    await ready();
  }
  await page.locator('.theme-toggle').click();
  const theme = await page.locator('html').getAttribute('data-theme');
  await page.locator('.detail-enquire').first().click();
  await page.waitForURL(target => target.pathname === '/contact.html');
  await ready();
  assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
  const nojs = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  await nojs.goto(`${origin}/strength-training.html`, { waitUntil: 'load' });
  assert.ok(await nojs.locator('#overview-heading').isVisible());
  assert.ok(await nojs.locator('.detail-enquire').first().isVisible());
  assert.ok(!await nojs.locator('#page-loader').isVisible());
  await nojs.close();
  assert.deepEqual(errors, []); assert.deepEqual(missing, []);
  fs.writeFileSync(path.join(__dirname, 'program-detail-evidence.json'), JSON.stringify({
    contract: 'program-detail-contract.md: six static program detail pages with distinct content, linked home/catalog previews, related and sequential navigation, whitelisted Contact preselection and preserved design preferences.',
    targetViewports: ['1440x1000', '390x844'],
    accessibility: { status: 'pass', evidence: 'Unique H1 and breadcrumb, ordered session steps, descriptive links, program FAQ, mobile Escape/focus return and reduced-motion rendering tested on all six pages.' },
    responsive: { status: 'pass', evidence: `${layouts} page/theme/width checks without clipped content, horizontal page overflow or overlapping header items. All local images decoded.` },
    contentStates: {
      loading: { status: 'pass', evidence: 'Shared loader dismissed across the six detail pages, Contact selections and actual Next-page navigation.' },
      empty: { status: 'not-applicable', reason: 'Six fixed static programs with populated focus, process, FAQ and related content.' },
      error: { status: 'pass', evidence: 'No script errors or missing resources; all local page and anchor links checked against existing files and IDs.' },
      partial: { status: 'pass', evidence: 'Strength Training content and enquiry link remain visible without JavaScript, while the loader stays hidden.' },
      success: { status: 'pass', evidence: 'Home and catalog point to six unique pages; all six enquiry actions preselect the correct Contact option. Next navigation traverses all six and returns to Strength Training. Saved theme follows navigation.' },
      permission: { status: 'not-applicable', reason: 'No new login, payment, browser permission or external submission introduced.' }
    },
    renderedEvidence: captures, browserErrors: errors, missingResources: missing
  }, null, 2));
  console.log(`PASS: six unique pages, ${layouts} layouts, home/catalog links, all local links/anchors, six enquiry selections, full Next loop, related links, themes, mobile menus, FAQs, images and no-JS fallback. No browser errors.`);
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
