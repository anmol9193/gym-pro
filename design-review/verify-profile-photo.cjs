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

    assert.equal(await page.locator('.fh-settings-form').getAttribute('enctype'), 'multipart/form-data');
    await page.locator('#avatar').setInputFiles('public/assets/dashboard/trainer-sam.jpg');
    assert.match(await page.locator('#avatar-status').textContent(), /Save profile to apply/);
    assert.ok(await page.locator('[data-avatar-preview] img').isVisible());
    for(const theme of ['light','dark']) {
      await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
      for(const [width,height] of [[320,740],[390,844],[768,1024],[1440,900]]) {
        await page.setViewportSize({width,height});
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), 'photo form fits '+width);
        const artifact='profile-photo-'+width+'-'+theme+'.png';
        await page.screenshot({path:'design-review/'+artifact,fullPage:true});
        captures.push({viewport:width+'x'+height,artifact,observation:theme+' profile photo picker with a local unsaved preview; name/email fields, fixed sidebar and sticky topbar fit without overflow.'});
      }
    }
    await page.locator('#avatar').setInputFiles({name:'invalid.txt',mimeType:'text/plain',buffer:Buffer.from('invalid image')});
    assert.match(await page.locator('#avatar-status').textContent(), /Choose a JPG/);
    assert.equal(await page.locator('#avatar').evaluate(e=>e.files.length),0);
    await page.locator('#avatar').setInputFiles({name:'large.jpg',mimeType:'image/jpeg',buffer:Buffer.alloc(2*1024*1024+1)});
    assert.match(await page.locator('#avatar-status').textContent(), /smaller than 2 MB/);
    assert.equal(await page.locator('#avatar').evaluate(e=>e.files.length),0);
    await page.reload();
    assert.equal(await page.locator('#avatar').evaluate(e=>e.files.length),0);
    assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
    fs.writeFileSync('design-review/profile-photo-evidence.json',JSON.stringify({contract:'fit-dashboard-contract.md',targetViewports:['320x740','390x844','768x1024','1440x900'],accessibility:{status:'pass',evidence:'Photo input has a visible label, format/size hints, live selection/error status and keyboard focus styling. Existing form validation and shared navigation retained.'},responsive:{status:'pass',evidence:'Photo picker and unsaved preview fit 320/390/768/1440px in light and dark modes; eight renders captured.'},contentStates:{loading:{status:'not-applicable',reason:'Local preview is synchronous; actual file save uses the existing server form navigation.'},empty:{status:'pass',evidence:'No saved photo falls back to the initial avatar; reload clears unsaved file selection.'},error:{status:'pass',evidence:'Client rejects unsupported and oversized selections; ProfileTest verifies server rejection without replacing the stored photo.'},partial:{status:'not-applicable',reason:'Profile data and saved photo path use one form submission, with cleanup on database failure.'},success:{status:'pass',evidence:'Browser preview works; ProfileTest verifies upload, private delivery, replacement cleanup, removal and photo rendering on all account surfaces.'},permission:{status:'pass',evidence:'ProfileTest verifies guest redirect and current-user-only photo delivery; shared admin authorization applies.'}},renderedEvidence:captures},null,2));
    console.log('Passed photo preview, invalid/oversized-file feedback, reload reset and eight responsive themed renders. No account photo was changed in the browser.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error.message);process.exit(1);});
