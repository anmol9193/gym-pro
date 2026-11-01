const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const fixtures = JSON.parse(fs.readFileSync(path.join(root, 'storage/app/private/foundation-browser-fixtures.json'), 'utf8'));
const origin = process.env.PREVIEW_ORIGIN || 'http://localhost:8000';
const destinations = { 'super-admin': '/admin/dashboard', 'gym-admin': '/admin/dashboard', receptionist: '/receptionist/dashboard', trainer: '/trainer/dashboard', member: '/member/dashboard' };

(async () => {
    const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
    const errors = [], captures = []; let layouts = 0, boundaries = 0;
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message));
    const visit = async (url, status = 200) => { const response = await page.goto(origin + url); assert.equal(response.status(), status, url); await page.evaluate(() => document.fonts.ready); };
    const capture = async (name, observation) => { const artifact = `foundation-${name}.png`; await page.screenshot({ path: path.join(__dirname, artifact) }); const v = page.viewportSize(); captures.push({ viewport: `${v.width}x${v.height}`, artifact, observation }); };
    const settle = () => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    const login = async fixture => {
        await visit('/login');
        await page.locator('#email').fill(fixture.email); await page.locator('#password').fill(fixture.password);
        await page.locator('button[type=submit]').click();
        await page.waitForURL(origin + (fixture.forced ? '/account' : destinations[fixture.role]));
        const sessionCookie = (await context.cookies()).find(c => /session$/.test(c.name));
        assert.ok(sessionCookie?.httpOnly, 'Session cookie must be HttpOnly');
        assert.equal(sessionCookie.sameSite, 'Lax');
    };
    await visit('/login');
    for (const theme of ['dark', 'light']) {
        await page.evaluate(t => { document.documentElement.dataset.bsTheme = t; localStorage.setItem('beast-theme', t); Alpine.store('theme').current = t; }, theme);
        for (const [width, height] of [[320, 740], [390, 844], [768, 1024], [844, 390], [1440, 900]]) {
            await page.setViewportSize({ width, height }); await settle();
            assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Login/${theme}/${width}`);
            layouts++;
            if ([390, 768, 1440].includes(width)) await capture(`login-${width}-${theme}`, `${theme} sign-in keeps labelled Poppins inputs, clear primary action and gym imagery at larger sizes.`);
        }
    }
    await page.setViewportSize({ width: 390, height: 844 }); await settle();
    assert.match((await context.request.post(origin + '/login', { form: { email: 'csrf@example.test', password: 'invalid' } })).status().toString(), /^419$/);
    await page.locator('#email').fill('unknown@example.test'); await page.locator('#password').fill('wrong'); await page.locator('button[type=submit]').click();
    await page.locator('.mg-alert-error').waitFor(); await capture('login-error', 'Invalid credentials show an accessible validation alert without revealing account existence.');
    await page.getByRole('link', { name: 'Forgot password?' }).click();
    await page.locator('#email').fill('unknown@example.test'); await page.locator('button[type=submit]').click();
    await page.locator('.mg-alert-success').waitFor(); await capture('recovery-status', 'Recovery displays the same generic response and clearly explains local email logging.');
    for (const fixture of fixtures.filter(f => !f.forced)) {
        await login(fixture);
        assert.equal(await page.locator('h1').count(), 1);
        for (const [target, url] of Object.entries(destinations)) {
            const allowed = fixture.role === 'super-admin' || (fixture.role === 'gym-admin' ? target === 'gym-admin' || target === 'super-admin' : target === fixture.role);
            await visit(url, allowed ? 200 : 403); boundaries++;
        }
        if (fixture.role === 'super-admin') {
            for (const theme of ['dark', 'light']) {
                await page.evaluate(t => { document.documentElement.dataset.bsTheme = t; localStorage.setItem('beast-theme', t); Alpine.store('theme').current = t; }, theme);
                for (const url of ['/admin/dashboard', '/admin/users', '/admin/users/create', '/admin/roles', '/admin/settings', '/account']) {
                    await visit(url);
                    for (const [width, height] of [[320, 740], [390, 844], [768, 1024], [844, 390], [1440, 900]]) {
                        await page.setViewportSize({ width, height }); await settle();
                        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${url}/${theme}/${width} overflows`);
                        if (theme === 'light') assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgb(255, 255, 255)');
                        layouts++;
                        if (['/admin/dashboard', '/admin/users', '/account'].includes(url) && [390, 768, 1440].includes(width)) await capture(`${url.split('/').at(-1)}-${width}-${theme}`, `${theme} ${url} uses readable forms, genuine database values and local table scrolling.`);
                    }
                }
            }
            await page.setViewportSize({ width: 390, height: 844 }); await visit('/admin/dashboard');
            const toggle = page.locator('button[aria-label="Open navigation"]');
            await toggle.click(); await settle();
            assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
            await capture('mobile-navigation', 'Mobile navigation drawer opens with labelled controls, contained keyboard focus and Escape restoration.');
            const last = page.locator('#management-sidebar button[type=submit]'); await last.focus(); await page.keyboard.press('Tab');
            assert.ok(await page.evaluate(() => document.querySelector('#management-sidebar').contains(document.activeElement)));
            await page.keyboard.press('Escape'); await settle(); assert.equal(await toggle.getAttribute('aria-expanded'), 'false'); assert.ok(await toggle.evaluate(e => e === document.activeElement));
            assert.ok(await page.locator('#management-sidebar').evaluate(e => e.inert), 'Closed drawer must leave the keyboard focus order');
            await visit('/admin/users?search=no-matching-person'); assert.ok(await page.getByRole('heading', { name: 'No accounts found.' }).isVisible());
            await capture('accounts-empty', 'Search with no matching records shows a clear empty state and reset action.');
        }
        await visit(destinations[fixture.role]); await page.locator('.mg-menu-button[aria-label="Open navigation"]').click(); await page.locator('.mg-logout').click(); await page.waitForURL(origin + '/login');
        await page.goto(origin + destinations[fixture.role]); assert.equal(new URL(page.url()).pathname, '/login');
    }
    const forced = fixtures.find(f => f.forced); await login(forced); await page.goto(origin + '/trainer/dashboard'); assert.equal(new URL(page.url()).pathname, '/account');
    await page.locator('#current_password').fill(forced.password); await page.locator('#password').fill('Browser-Changed!Password63'); await page.locator('#password_confirmation').fill('Browser-Changed!Password63');
    await page.locator('button[type=submit]').filter({ hasText: 'Update password' }).click(); await page.waitForURL(origin + '/login');
    await login({ ...forced, forced: false, password: 'Browser-Changed!Password63' });
    assert.equal(new URL(page.url()).pathname, '/trainer/dashboard');
    await context.close();
    const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const staticPage = await nojs.newPage(); await staticPage.goto(origin + '/login');
    assert.ok(await staticPage.locator('button[type=submit]').isVisible());
    await nojs.close(); await browser.close();
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(__dirname, 'foundation-test-results.json'), JSON.stringify({ layouts, boundaries, errors, csrf: '419 without token', forcedPasswordChange: true, captures }, null, 2));
    console.log(`Passed ${layouts} responsive layouts, ${boundaries} role boundaries, CSRF, login/logout, recovery, forced password change and mobile keyboard navigation.`);
})().catch(error => { console.error(error); process.exit(1); });
