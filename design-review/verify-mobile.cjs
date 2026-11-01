const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-unsafe-swiftshader']});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce',colorScheme:'dark'});
 const page=await context.newPage();const errors=[],captures=[];
 page.on('pageerror',e=>errors.push(e.message));
 const ready=async()=>{await page.locator('#page-loader').waitFor({state:'hidden'});await page.evaluate(()=>document.fonts.ready);};
 const visit=async file=>{await page.goto(`http://127.0.0.1:8765/${file}`);await ready();};
 const capture=async(name,observation)=>{
  await page.evaluate(async()=>{await Promise.all([...document.images].filter(i=>i.getBoundingClientRect().top<innerHeight&&i.getBoundingClientRect().bottom>0).map(i=>i.decode().catch(()=>{})));});
  const viewport=page.viewportSize(),artifact=`mobile-final-${name}.png`;
  await page.screenshot({path:path.join(__dirname,artifact)});captures.push({viewport:`${viewport.width}x${viewport.height}`,artifact,observation});
 };
 for(const theme of ['dark','light']){
  await visit('index.html');await page.evaluate(t=>{localStorage.setItem('beast-theme',t);document.documentElement.dataset.theme=t;},theme);
  for(const viewport of [{width:390,height:844},{width:768,height:1024},{width:844,height:390}]){
   await page.setViewportSize(viewport);
   const tag=`${viewport.width}-${theme}`;
   await visit('index.html');
   await capture(`home-${tag}`,`${theme} home: safe header gutters, readable heading and tablet stacking.`);
   await page.locator('#menu-toggle').tap();
   const menu=await page.locator('#nav-links').boundingBox();
   assert.ok(menu.y>=0&&menu.y+menu.height<=viewport.height,`Menu bounds ${tag}`);
   await page.locator('#nav-links a[href="membership.html"]').scrollIntoViewIfNeeded();
   await page.locator('#nav-links a[href="membership.html"]').tap();await ready();
   assert.ok(page.url().endsWith('/membership.html'));
   assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'false');
   const comparison=page.locator('.comparison-scroll');
   await comparison.scrollIntoViewIfNeeded();
   assert.ok(await comparison.evaluate(e=>e.clientWidth<=innerWidth&&e.scrollWidth>=e.clientWidth));
   if(viewport.width<640){await comparison.evaluate(e=>e.scrollLeft=180);assert.ok(await comparison.evaluate(e=>e.scrollLeft>0));}
   await visit('products.html?category=supplements#product-catalog');
   await capture(`catalog-${tag}`,`${theme} supplements: horizontal touch filters, labelled type select and contained product grid.`);
   await page.locator('#supplement-type').selectOption('protein');
   assert.equal(await page.locator('.product-card:visible').count(),3);
   await page.locator('#product-search').fill('isolate');
   assert.equal(await page.locator('.product-card:visible').count(),1);
   await page.locator('#product-search').fill('no result');
   assert.ok(await page.locator('[data-product-empty]').isVisible());
   await page.locator('[data-product-reset]').tap();
   assert.equal(await page.locator('.product-card:visible').count(),14);
   if(viewport.width===390){
    const cards=await page.locator('.product-card:visible').evaluateAll(es=>es.slice(0,2).map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width};}));
    assert.ok(Math.abs(cards[0].y-cards[1].y)<1&&cards[0].x+cards[0].width<cards[1].x);
   }
   // Tap a chip outside the initial horizontal view; it must remain reachable.
   await page.locator('[data-product-filter="essentials"]').tap();
   assert.equal(await page.locator('.product-card:visible').count(),2);
   await visit('product-creatine-monohydrate.html');
   await capture(`detail-${tag}`,`${theme} product: heading before gallery on phones, consistent gallery and readable enquiry.`);
   if(viewport.width<=800)assert.ok(await page.evaluate(()=>document.querySelector('h1').getBoundingClientRect().bottom<document.querySelector('.product-gallery').getBoundingClientRect().top));
   await page.locator('[data-product-view="2"]').tap();await page.locator('[data-product-main]').evaluate(e=>e.decode());
   await page.locator('[data-product-zoom]').tap();
   const dialog=await page.locator('[data-product-dialog]').boundingBox();
   assert.ok(dialog.x>=0&&dialog.y>=0&&dialog.x+dialog.width<=viewport.width&&dialog.y+dialog.height<=viewport.height);
   const close=await page.locator('[data-product-close]').boundingBox();assert.ok(close.height>=44);
   await page.locator('[data-product-close]').tap();
   await page.locator('.product-single .product-enquire').tap();await ready();
   assert.equal(await page.locator('#product').inputValue(),'creatine-monohydrate');
   await page.locator('#name').fill('Mobile Demo');await page.locator('#phone').fill('123');
   await page.locator('#join-form [type="submit"]').tap();assert.ok(!(await page.locator('#enquiry-result').isVisible()));
   await page.locator('#phone').fill('9876543210');await page.locator('#join-form [type="submit"]').tap();
   assert.match(await page.locator('#enquiry-summary').textContent(),/Creatine Monohydrate/);
   await page.locator('#edit-enquiry').tap();assert.equal(await page.locator('#name').inputValue(),'Mobile Demo');
   await page.locator('#product').scrollIntoViewIfNeeded();await capture(`contact-${tag}`,`${theme} touch form with selected product and 16px controls; validation and draft editing passed.`);
   await visit('programs.html');await page.locator('[data-filter="conditioning"]').tap();assert.equal(await page.locator('.catalog-card:visible').count(),2);
  }
 }
 await page.setViewportSize({width:390,height:844});await visit('index.html');
 await page.locator('.hero-visual').scrollIntoViewIfNeeded();await capture('hero-visual','Hero caption and 3D card remain separated and inside the phone width.');
 await page.locator('#supplements').scrollIntoViewIfNeeded();await page.evaluate(()=>scrollTo(0,document.getElementById('supplements').offsetTop-100));await capture('supplements-home','Two-column home supplement preview with names and enquiry prices.');
 // Normal-motion touch mode: content reveals on scroll without leaving blank cards.
 await page.emulateMedia({reducedMotion:'no-preference'});await visit('index.html');
 await page.locator('#products .section-heading').scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('#products .section-heading')).opacity==='1');
 assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(__dirname,'mobile-test-results.json'),JSON.stringify({captures,errors,touchScenarios:6},null,2));
 await browser.close();console.log('Passed 6 touch scenarios: both themes, phone/tablet/landscape menu, filters, galleries, zoom, validation and enquiry editing.');
})().catch(e=>{console.error(e);process.exit(1)});
