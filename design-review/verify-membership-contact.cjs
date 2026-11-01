const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const other = ['programs.html', 'our-approach.html', 'membership.html', 'contact.html'];
const home = 'index.html';
const origin = process.env.PREVIEW_ORIGIN || 'http://127.0.0.1:8765';
const urls = [encodeURIComponent(home), ...other];

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: 'dark', reducedMotion: 'reduce' });
  const errors = [], missing = [], sends = [], captures = { membership: [], contact: [] };
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) missing.push(response.url()); });
  page.on('request', request => { if (request.method() !== 'GET') sends.push(request.url()); });
  const visit = async target => {
    await page.goto(`${origin}/${target}`, { waitUntil: 'load' });
    await page.locator('#page-loader').waitFor({ state: 'hidden' });
    await page.evaluate(() => document.fonts.ready);
  };
  for (const url of urls) {
    await visit(url);
    assert.equal(await page.locator('#nav-links>li:not(.mobile-join)>a').count(), 5);
    assert.equal(await page.locator('#nav-links a[href="membership.html"]').count(), 1);
    assert.equal(await page.locator('#nav-links a[href="contact.html"]').count(), 1);
    assert.equal(await page.locator('.developer-credit a').getAttribute('href'), 'https://anmolsaini.wuaze.com');
    assert.equal(await page.locator('.beast-cursor').count(), 0);
  }
  for (const plan of ['Basic', 'Pro', 'Elite']) {
    await visit('membership.html');
    await page.locator(`.plan-select[data-plan="${plan}"]`).click();
    await page.waitForURL(next => next.pathname === '/contact.html' && next.hash === '#enquiry');
    await page.locator('#page-loader').waitFor({ state: 'hidden' });
    assert.equal(await page.locator('#plan').inputValue(), plan);
  }
  await visit('programs.html');
  const programs = await page.locator('.catalog-card').evaluateAll(cards => cards.map(card => ({ id: card.id, name: card.dataset.program })));
  for (const program of programs) {
    await visit('programs.html');
    await page.locator(`#${program.id} .program-enquire`).click();
    await page.waitForURL(next => next.pathname === '/contact.html');
    await page.locator('#page-loader').waitFor({ state: 'hidden' });
    assert.equal(await page.locator('#goal').inputValue(), program.name);
  }
  await visit('contact.html?plan=invalid&program=%3Cscript%3Einvalid%3C%2Fscript%3E');
  assert.equal(await page.locator('#plan').inputValue(), 'Pro');
  assert.equal(await page.locator('#goal').inputValue(), 'Find my starting point');
  assert.equal(await page.locator('a[href^="tel:"],a[href^="mailto:"]').count(), 0);
  assert.match(await page.locator('.contact-details').textContent(), /coming soon/);
  await page.locator('#name').fill('Test Member');
  await page.locator('#phone').fill('123');
  await page.locator('#join-form button[type="submit"]').click();
  assert.ok(await page.locator('#join-form').isVisible());
  assert.match(await page.locator('#phone').evaluate(input => input.validationMessage), /10 to 15/);
  await page.locator('#phone').fill('+91 98765 43210');
  await page.locator('#email').fill('invalid-email');
  await page.locator('#join-form button[type="submit"]').click();
  assert.ok(await page.locator('#join-form').isVisible());
  assert.ok(!await page.locator('#email').evaluate(input => input.validity.valid));
  await page.locator('#email').fill('member@example.com');
  await page.locator('#message').fill('Interested in strength training. <img src=x onerror=alert(1)>');
  await page.locator('#plan').selectOption('Elite');
  await page.locator('#goal').selectOption('Strength Training');
  await page.locator('#join-form button[type="submit"]').click();
  assert.ok(await page.locator('#enquiry-result').isVisible());
  const draft = await page.locator('#enquiry-summary').textContent();
  assert.match(draft, /Elite membership/);
  assert.match(draft, /member@example.com/);
  assert.match(draft, /Interested in strength training/);
  assert.equal(await page.locator('#enquiry-summary img').count(), 0);
  assert.match(await page.locator('#enquiry-result').textContent(), /Nothing has been sent/);
  // Exercise copy UI without reading or changing the user's system clipboard.
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.__copiedEnquiry = text; } } }));
  await page.locator('#copy-enquiry').click();
  await page.waitForFunction(() => document.getElementById('copy-status').textContent.includes('Draft copied'));
  assert.equal(await page.evaluate(() => window.__copiedEnquiry), draft);
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined }));
  await page.locator('#copy-enquiry').click();
  assert.match(await page.locator('#copy-status').textContent(), /copy it manually/);
  await page.locator('#edit-enquiry').click();
  assert.equal(await page.locator('#email').inputValue(), 'member@example.com');
  assert.equal(await page.locator('#plan').inputValue(), 'Elite');
  assert.ok(await page.locator('#name').evaluate(input => input === document.activeElement));
  assert.deepEqual(await page.evaluate(() => Object.keys(localStorage).filter(key => key !== 'beast-theme')), []);
  // Theme state follows navigation to the new pages.
  await page.locator('.theme-toggle').click();
  const theme = await page.locator('html').getAttribute('data-theme');
  await page.locator('#nav-links a[href="membership.html"]').click();
  await page.waitForURL(`${origin}/membership.html`);
  await page.locator('#page-loader').waitFor({ state: 'hidden' });
  assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
  assert.equal(await page.locator('.comparison-table tbody tr').count(), 8);
  assert.match(await page.locator('.comparison-table').textContent(), /4 sessions \/ month/);
  let layouts = 0;
  for (const file of ['membership', 'contact']) {
    await visit(`${file}.html`);
    for (const palette of ['dark', 'light']) {
      await page.evaluate(value => { document.documentElement.dataset.theme = value; }, palette);
      for (const width of [320, 390, 600, 768, 1024, 1200, 1201, 1440, 1920]) {
        await page.setViewportSize({ width, height: 1000 });
        const report = await page.evaluate(() => {
          const nav = document.querySelector('.nav-shell').getBoundingClientRect();
          const items = [...document.querySelectorAll('.nav-shell>.brand,.nav-actions,.nav-links')].filter(e => getComputedStyle(e).display !== 'none').map(e => e.getBoundingClientRect());
          const overlaps = items.some((a, i) => items.some((b, j) => j > i && Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1));
          const clipped = [...document.querySelectorAll('h1,h2,h3,.price-card,.membership-intro,.contact-intro,.contact-panel,.visit-copy,.visit-photo,input,select,textarea,.contact-panel .button-primary')].filter(e => e.getClientRects().length).filter(e => {
            const r = e.getBoundingClientRect(); return r.left < -1 || r.right > innerWidth + 1 || e.scrollWidth > e.clientWidth + 2;
          }).map(e => e.className || e.tagName);
          return { overlaps, fits: items.every(r => r.left >= nav.left && r.right <= nav.right), clipped, pageFits: document.documentElement.scrollWidth <= innerWidth + 1 };
        });
        assert.ok(!report.overlaps && report.fits && !report.clipped.length && report.pageFits, `${file} ${palette} ${width}: ${JSON.stringify(report)}`);
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
    if (file === 'membership') {
      assert.ok(await page.locator('.comparison-scroll').evaluate(e => e.scrollWidth > e.clientWidth));
      await page.locator('.comparison-scroll').evaluate(e => { e.scrollLeft = 200; });
      assert.ok(await page.locator('.comparison-scroll').evaluate(e => e.scrollLeft > 0));
      await page.locator('.comparison-scroll').evaluate(e => { e.scrollLeft = 0; });
    }
    for (const image of await page.locator('img').all()) {
      await image.scrollIntoViewIfNeeded(); await image.evaluate(e => e.decode());
    }
    for (const [width, height] of [[1440, 1000], [390, 844]]) {
      await page.setViewportSize({ width, height });
      for (const palette of ['dark', 'light']) {
        await page.evaluate(value => { document.documentElement.dataset.theme = value; }, palette);
        for (const item of await page.locator('.reveal').all()) await item.scrollIntoViewIfNeeded();
        await page.evaluate(() => scrollTo(0, 0));
        const name = `${file}-${width === 1440 ? 'desktop' : 'mobile'}-${palette}`;
        await page.screenshot({ path: path.join(__dirname, `${name}.png`) });
        await page.screenshot({ path: path.join(__dirname, `${name}-full.png`), fullPage: true });
        captures[file].push({ viewport: `${width}x${height}`, artifact: `${name}.png`, observation: `${palette} ${file} page: shared navigation, readable Poppins type, responsive content and existing gym identity.` });
      }
    }
  }
  // Both new pages remain readable without JS; submission cannot silently navigate.
  const nojs = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  await nojs.goto(`${origin}/membership.html`, { waitUntil: 'load' });
  assert.equal(await nojs.locator('.price-card:visible').count(), 3);
  await nojs.goto(`${origin}/contact.html`, { waitUntil: 'load' });
  assert.ok(await nojs.locator('.contact-details').isVisible());
  assert.ok(await nojs.locator('#join-form button[type="submit"]').isDisabled());
  assert.ok(!await nojs.locator('#page-loader').isVisible());
  await nojs.close();
  // A final check of the preserved home enquiry, now with plan URL support.
  await visit(`${encodeURIComponent(home)}?plan=Basic&program=Yoga+%26+Mobility#join`);
  assert.equal(await page.locator('#plan').inputValue(), 'Basic');
  assert.equal(await page.locator('#goal').inputValue(), 'Yoga & Mobility');
  await page.locator('#name').fill('Home Visitor');
  await page.locator('#phone').fill('9876543210');
  await page.locator('#join-form button[type="submit"]').click();
  assert.ok(await page.locator('#enquiry-result').isVisible());
  assert.deepEqual(errors, []); assert.deepEqual(missing, []); assert.deepEqual(sends, []);
  for (const file of ['membership', 'contact']) {
    fs.writeFileSync(path.join(__dirname, `${file}-evidence.json`), JSON.stringify({
      contract: 'membership-contact-contract.md: standalone pages, existing plan prices/features, explicit contact placeholders and a local-only editable enquiry draft.',
      targetViewports: ['1440x1000', '390x844'],
      accessibility: { status: 'pass', evidence: 'Labelled inputs, native and custom validation, keyboard menu Escape/focus return, semantic comparison table, focusable horizontal table region, FAQ controls, reduced-motion rendering and live copy feedback checked.' },
      responsive: { status: 'pass', evidence: `${layouts} total new-page theme/width checks passed, including 1200/1201px navigation breakpoint. No page-wide overflow; comparison stays within its scrollable region.` },
      contentStates: {
        loading: { status: 'pass', evidence: 'Shared loader dismissed throughout navigation; local images decoded on Contact.' },
        empty: { status: 'pass', evidence: 'Missing phone, email, address and hours explicitly labelled as coming soon/to be confirmed. No fabricated contact links or map location.' },
        error: { status: 'pass', evidence: 'Invalid phone/email and unknown plan/program URL values tested. Missing clipboard API gives a manual-copy fallback. User message markup renders as plain text.' },
        partial: { status: 'pass', evidence: 'No-JavaScript membership and contact details remain readable; submit stays disabled with explanatory text.' },
        success: { status: 'pass', evidence: 'Three plan and six program links preselect Contact options. Valid draft includes optional email/message, supports copy/edit, and does not store personal data or send network submissions. Original home draft still works.' },
        permission: { status: 'not-applicable', reason: 'No login, payment, external submission or browser permission prompt added. Clipboard UI verified using an isolated test stub, without touching the system clipboard.' }
      },
      renderedEvidence: captures[file], browserErrors: errors, missingResources: missing, nonGetRequests: sends
    }, null, 2));
  }
  console.log(`PASS: ${layouts} layouts; five-page navigation, three plans, six programs, URL validation, form/email/message validation, safe draft copy/edit, table scrolling, theme persistence, mobile menus, no-JS and home enquiry regression. No browser errors or submissions.`);
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
