const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');
const products=JSON.parse(fs.readFileSync(path.join(root,'resources/data/products.json'),'utf8'));
const programs=JSON.parse(fs.readFileSync(path.join(root,'resources/data/programs.json'),'utf8'));
const origin=process.env.PREVIEW_ORIGIN||'http://localhost:8000';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-unsafe-swiftshader']});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce',colorScheme:'dark'});
 const page=await context.newPage(),errors=[],missing=[],writes=[],captures=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400)missing.push(r.url())});
 page.on('request',r=>{if(r.method()!=='GET')writes.push(r.url())});
 const visit=async url=>{const response=await page.goto(origin+url);assert.equal(response.status(),200,url);await page.locator('#page-loader').waitFor({state:'hidden'});await page.evaluate(()=>document.fonts.ready)};
 const capture=async(name,observation)=>{const v=page.viewportSize(),artifact=`laravel-${name}.png`;await page.screenshot({path:path.join(__dirname,artifact)});captures.push({viewport:`${v.width}x${v.height}`,artifact,observation})};
 const routes=['/','/programs','/products','/our-approach','/membership','/contact',...programs.map(p=>'/programs/'+p.slug),...products.map(p=>'/products/'+p.slug)];
 for(const route of routes){
  await visit(route);assert.equal(await page.locator('h1').count(),1);
  const resources=await page.locator('img[src],script[src],link[rel="stylesheet"]').evaluateAll(es=>es.map(e=>e.src||e.href));
  for(const resource of resources){const url=new URL(resource);if(url.origin===origin)assert.ok(fs.existsSync(path.join(root,'public',decodeURIComponent(url.pathname.slice(1)))),`${route}: ${url.pathname}`)}
  assert.equal(await page.locator('#nav-links>li:not(.mobile-join):not(.mobile-account)>a').count(),5);
  assert.equal(await page.locator('#nav-links a[aria-current="page"]').count(),route==='/contact'?0:1);
 }
 let layouts=0;
 for(const theme of ['dark','light']){
  await page.evaluate(t=>{document.documentElement.dataset.theme=t;localStorage.setItem('beast-theme',t)},theme);
  for(const route of ['/','/programs','/our-approach','/membership','/contact','/products','/products/creatine-monohydrate','/programs/strength-training']){
   await visit(route);
   for(const width of [320,390,768,844,1440]){
    const height=width===844?390:width===390?844:900;
    await page.setViewportSize({width,height});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    const fits=await page.evaluate(()=>({fits:document.documentElement.scrollWidth<=innerWidth+1,bg:getComputedStyle(document.body).backgroundColor}));
    assert.ok(fits.fits,`${route}/${theme}/${width}`);if(theme==='light')assert.equal(fits.bg,'rgb(255, 255, 255)');layouts++;
    if(['/','/products/creatine-monohydrate'].includes(route)&&[390,1440].includes(width)){
     await page.evaluate(()=>scrollTo(0,0));await capture(`${route==='/'?'home':'product'}-${width}-${theme}`,`${theme} Laravel ${route}: local assets, original design and responsive layout.`);
    }
   }
  }
 }
 await page.setViewportSize({width:390,height:844});await visit('/');
 const quote=await page.evaluate(()=>document.querySelector('.consistency-card').getBoundingClientRect().top>=document.querySelector('.athlete-panel').getBoundingClientRect().bottom+10);assert.ok(quote);
 await page.locator('#menu-toggle').tap();await page.locator('#nav-links a[href$="/products"]').tap();await page.waitForURL(origin+'/products');
 await page.locator('[data-product-filter="supplements"]').tap();assert.equal(await page.locator('.product-card:visible').count(),8);
 await page.locator('#supplement-type').selectOption('protein');assert.equal(await page.locator('.product-card:visible').count(),3);
 await page.locator('#product-search').fill('isolate');assert.equal(await page.locator('.product-card:visible').count(),1);
 await page.locator('#product-search').fill('unlisted');assert.ok(await page.locator('[data-product-empty]').isVisible());
 await page.locator('[data-product-reset]').tap();assert.equal(await page.locator('.product-card:visible').count(),14);
 for(const product of products){
  await visit('/products/'+product.slug);assert.equal(await page.locator('h1').textContent(),product.name);
  await page.locator('[data-product-view="3"]').tap();await page.locator('[data-product-main]').evaluate(e=>e.decode());
  await page.locator('[data-product-zoom]').tap();assert.ok(await page.locator('[data-product-dialog]').isVisible());await page.keyboard.press('Escape');
  await page.locator('.product-single .product-enquire').tap();await page.waitForURL(/\/contact\?product=/);await page.locator('#page-loader').waitFor({state:'hidden'});
  assert.equal(await page.locator('#product').inputValue(),product.slug);
 }
 await page.locator('#name').fill('Laravel Demo');await page.locator('#phone').fill('9876543210');await page.locator('#join-form [type="submit"]').tap();assert.match(await page.locator('#enquiry-summary').textContent(),/Omega-3/);await page.locator('#edit-enquiry').tap();
 await visit('/contact.html?program=Strength+Training&plan=Elite#enquiry');assert.equal(new URL(page.url()).pathname,'/contact');assert.equal(await page.locator('#plan').inputValue(),'Elite');assert.equal(await page.locator('#goal').inputValue(),'Strength Training');
 await visit('/products.html?category=supplements&type=protein#product-catalog');assert.equal(await page.locator('.product-card:visible').count(),3);
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const staticPage=await nojs.newPage();await staticPage.goto(origin+'/products');assert.equal(await staticPage.locator('.product-card:visible').count(),14);await nojs.close();
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);assert.deepEqual(writes,[]);
 fs.writeFileSync(path.join(__dirname,'laravel-test-results.json'),JSON.stringify({routes:routes.length,layouts,errors,missing,writes,captures},null,2));
 await browser.close();console.log(`Passed ${routes.length} Laravel routes, ${layouts} responsive layouts, 14 product galleries/enquiries, filters, legacy redirects, mobile menu and no-JS checks.`);
})().catch(e=>{console.error(e);process.exit(1)});
