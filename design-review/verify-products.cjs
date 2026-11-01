const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const products = JSON.parse(fs.readFileSync(path.join(root, 'assets/products.json'), 'utf8'));
const origin = process.env.PREVIEW_ORIGIN || 'http://127.0.0.1:8765';

(async () => {
  const browser = await chromium.launch({executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true, args:['--enable-unsafe-swiftshader']});
  const context = await browser.newContext({viewport:{width:1440,height:900},colorScheme:'dark',reducedMotion:'reduce'});
  const page = await context.newPage();
  const errors=[], missing=[], writes=[], captures=[];
  page.on('pageerror', e=>errors.push(e.message));
  page.on('response', r=>{if(r.status()>=400)missing.push(r.url());});
  page.on('request', r=>{if(r.method()!=='GET')writes.push(`${r.method()} ${r.url()}`);});
  const ready=async()=>{await page.locator('#page-loader').waitFor({state:'hidden'});await page.evaluate(()=>document.fonts.ready);};
  const visit=async file=>{await page.goto(`${origin}/${file}`,{waitUntil:'load'});await ready();};
  const capture=async(name,viewport,observation)=>{
    const artifact=`products-${name}.png`;
    await page.screenshot({path:path.join(__dirname,artifact)});
    captures.push({viewport,artifact,observation});
  };
  await visit('products.html');
  assert.equal(await page.locator('.product-card:visible').count(),products.length);
  for(const category of ['strength','movement','essentials']){
    await page.locator(`[data-product-filter="${category}"]`).click();
    assert.equal(await page.locator('.product-card:visible').count(),2);
  }
  await page.locator('#product-search').fill('SHAKER');
  assert.equal(await page.locator('.product-card:visible').count(),1);
  assert.match(await page.locator('[data-product-count]').textContent(),/1 product found/);
  await page.locator('[data-product-filter="strength"]').click();
  assert.equal(await page.locator('.product-card:visible').count(),0);
  assert.ok(await page.locator('[data-product-empty]').isVisible());
  await page.locator('[data-product-reset]').click();
  assert.equal(await page.locator('.product-card:visible').count(),products.length);
  assert.equal(await page.locator('#product-search').inputValue(),'');
  assert.ok(await page.locator('#product-search').evaluate(e=>e===document.activeElement));
  await page.locator('#product-search').fill('  KettleBell  ');
  assert.equal(await page.locator('.product-card:visible').count(),1);
  await page.locator('#product-search').fill('');

  await visit('products.html?category=supplements#product-catalog');
  assert.equal(await page.locator('.product-card:visible').count(),8);
  assert.ok(await page.locator('[data-supplement-tools]').isVisible());
  for(const [type,total] of [['protein',3],['creatine',1],['pre-workout',1],['mass-gainer',1],['daily-essentials',2]]){
    await page.locator('#supplement-type').selectOption(type);
    assert.equal(await page.locator('.product-card:visible').count(),total);
  }
  await page.locator('#supplement-type').selectOption('protein');
  await page.locator('#product-search').fill('isolate');
  assert.equal(await page.locator('.product-card:visible').count(),1);
  await page.locator('#product-search').fill('omega');
  assert.ok(await page.locator('[data-product-empty]').isVisible());
  await page.locator('[data-product-reset]').click();
  assert.equal(await page.locator('.product-card:visible').count(),products.length);
  assert.equal(await page.locator('#supplement-type').inputValue(),'all');
  assert.ok(!(await page.locator('[data-supplement-tools]').isVisible()));
  await visit('products.html?category=supplements&type=protein');
  assert.equal(await page.locator('.product-card:visible').count(),3);
  await visit('products.html?category=unknown&type=unknown');
  assert.equal(await page.locator('.product-card:visible').count(),products.length);
  await visit('products.html?category=supplements&type=unknown');
  assert.equal(await page.locator('.product-card:visible').count(),8);
  for(const theme of ['dark','light']){
    await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);
    for(const width of [390,1440]){
      await page.setViewportSize({width,height:width===390?844:900});
      await page.evaluate(()=>scrollTo(0,0));
      await capture(`supplement-filter-${width===390?'mobile':'desktop'}-${theme}`,`${width}x${width===390?844:900}`,`${theme} supplement category with eight concepts and a labelled type selector.`);
    }
  }
  let layouts=0;
  for(const file of ['products.html',...products.map(p=>`product-${p.slug}.html`),'contact.html']){
    await visit(file);
    assert.equal(await page.locator('h1').count(),1);
    assert.equal(await page.locator('#nav-links>li:not(.mobile-join)>a').count(),5);
    assert.equal(await page.locator('#nav-links>li:not(.mobile-join)>a').filter({hasText:/^Contact$/}).count(),0);
    assert.equal((await page.locator('.nav-trial').textContent()).trim(),'Contact');
    assert.equal(await page.locator('.beast-cursor').count(),0);
    for(const theme of ['dark','light']){
      await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);
      for(const width of [320,390,768,1200,1201,1440,1920]){
        await page.setViewportSize({width,height:width===390?844:900});
        const report=await page.evaluate(()=>{
          const nodes=[...document.querySelectorAll('h1,h2,h3,.product-toolbar,.product-gallery,.product-single-copy,.product-card,.product-specs,.product-search,.contact-panel')].filter(e=>e.getClientRects().length);
          const clipped=nodes.filter(e=>{const r=e.getBoundingClientRect();return r.left< -1||r.right>innerWidth+1||e.scrollWidth>e.clientWidth+2;}).map(e=>e.className||e.tagName);
          const items=[...document.querySelectorAll('.nav-shell>.brand,.nav-actions,.nav-links')].filter(e=>getComputedStyle(e).display!=='none').map(e=>e.getBoundingClientRect());
          const overlap=items.some((a,i)=>items.some((b,j)=>j>i&&Math.min(a.right,b.right)-Math.max(a.left,b.left)>1));
          return {clipped,overlap,pageFits:document.documentElement.scrollWidth<=innerWidth+1,font:getComputedStyle(document.body).fontFamily,bg:getComputedStyle(document.body).backgroundColor};
        });
        assert.ok(!report.clipped.length&&!report.overlap&&report.pageFits,`${file}/${theme}/${width} ${JSON.stringify(report)}`);
        assert.match(report.font,/Poppins/);
        if(theme==='light')assert.equal(report.bg,'rgb(255, 255, 255)');
        layouts++;
        if(['products.html','product-hex-dumbbell.html','product-whey-protein.html'].includes(file)&&[390,1440].includes(width)){
          await page.evaluate(()=>scrollTo(0,0));
          await capture(`${file==='products.html'?'catalog':file==='product-whey-protein.html'?'supplement-detail':'detail'}-${width===390?'mobile':'desktop'}-${theme}`,`${width}x${width===390?844:900}`,`${theme} ${file}: actual products, readable type and unobscured 3D objects.`);
        }
      }
    }
  }
  await page.setViewportSize({width:1440,height:900});
  for(const product of products){
    await visit(`product-${product.slug}.html`);
    assert.equal(await page.locator('h1').textContent(),product.name);
    for(let view=1;view<=3;view++){
      const thumb=page.locator(`[data-product-view="${view}"]`);
      await thumb.click();
      await page.locator('[data-product-main]').evaluate(e=>e.decode());
      assert.equal(await thumb.getAttribute('aria-pressed'),'true');
      assert.match(await page.locator('[data-product-main]').getAttribute('src'),new RegExp(`-${view}.jpg$`));
    }
    await page.locator('[data-product-zoom]').focus();
    await page.keyboard.press('Enter');
    assert.ok(await page.locator('[data-product-dialog]').isVisible());
    assert.ok(await page.locator('[data-product-close]').evaluate(e=>e===document.activeElement));
    assert.match(await page.locator('[data-product-zoom-image]').getAttribute('src'),/-3.jpg$/);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    assert.ok(await page.locator('[data-product-dialog]').evaluate(e=>e.contains(document.activeElement)));
    await page.keyboard.press('Escape');
    assert.ok(!(await page.locator('[data-product-dialog]').isVisible()));
    assert.ok(await page.locator('[data-product-zoom]').evaluate(e=>e===document.activeElement));
    await page.locator('.product-single .product-enquire').click();
    await ready();
    assert.equal(await page.locator('#product').inputValue(),product.slug);
    assert.ok(!(await page.locator('.contact-select-row').isVisible()));
    assert.ok(await page.locator('#product-contact-context').isVisible());
    await page.locator('#name').fill('Demo Visitor');
    await page.locator('#phone').fill('+91 98765 43210');
    await page.locator('#message').fill('<b>Options?</b>');
    await page.locator('#join-form [type="submit"]').click();
    const summary=await page.locator('#enquiry-summary').textContent();
    assert.ok(summary.includes(product.name)&&summary.includes('<b>Options?</b>')&&!summary.includes('Pro membership'));
    assert.equal(await page.locator('#enquiry-summary b').count(),0);
    await page.locator('#edit-enquiry').click();
    assert.equal(await page.locator('#product').inputValue(),product.slug);
    assert.equal(await page.locator('#name').inputValue(),'Demo Visitor');
    await page.locator('#product').selectOption('');
    assert.ok(await page.locator('.contact-select-row').isVisible());
    assert.ok(!(await page.locator('#product-contact-context').isVisible()));
  }
  await visit('contact.html?product=unknown&plan=Elite&program=Strength+Training#enquiry');
  assert.equal(await page.locator('#product').inputValue(),'');
  assert.equal(await page.locator('#plan').inputValue(),'Elite');
  assert.equal(await page.locator('#goal').inputValue(),'Strength Training');
  await page.locator('#name').fill('Demo Visitor');
  await page.locator('#phone').fill('123');
  await page.locator('#join-form [type="submit"]').click();
  assert.ok(!(await page.locator('#enquiry-result').isVisible()));
  assert.ok(await page.locator('#phone').evaluate(e=>!e.checkValidity()));
  await page.locator('#phone').fill('9876543210');
  await page.locator('#join-form [type="submit"]').click();
  assert.match(await page.locator('#enquiry-summary').textContent(),/Elite membership.*Strength Training/);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:undefined,configurable:true}));
  await page.locator('#copy-enquiry').click();
  assert.match(await page.locator('#copy-status').textContent(),/manually/);

  await visit('index.html');
  assert.equal(await page.locator('#products .product-card').count(),4);
  assert.equal(await page.locator('#supplements .product-card').count(),4);
  assert.equal(await page.locator('#product').count(),0);
  for(const theme of ['dark','light']){
    await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);
    for(const width of [390,1440]){
      await page.setViewportSize({width,height:width===390?844:900});
      await page.locator('#products').scrollIntoViewIfNeeded();
      await page.evaluate(()=>{const e=document.getElementById('products');scrollTo(0,e.offsetTop-110);});
      await capture(`home-${width===390?'mobile':'desktop'}-${theme}`,`${width}x${width===390?844:900}`,`${theme} homepage featured products: four objects, individual links and full collection link.`);
      await page.evaluate(()=>scrollTo(0,document.getElementById('supplements').offsetTop-110));
      await capture(`home-supplements-${width===390?'mobile':'desktop'}-${theme}`,`${width}x${width===390?844:900}`,`${theme} home supplement preview: four concepts and all eight supplements link.`);
    }
  }
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>scrollTo(0,0));
  await page.locator('#menu-toggle').click();
  assert.ok(await page.locator('#nav-links a[href="products.html"]').isVisible());
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'false');
  await page.locator('.theme-toggle').click();
  const saved=await page.evaluate(()=>document.documentElement.dataset.theme);
  await visit('products.html');
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),saved);
  const storage=await page.evaluate(()=>Object.keys(localStorage));
  assert.deepEqual(storage,['beast-theme']);

  const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const staticPage=await nojs.newPage();
  await staticPage.goto(`${origin}/products.html`);
  assert.equal(await staticPage.locator('.product-card:visible').count(),products.length);
  assert.ok(!(await staticPage.locator('[data-product-controls]').isVisible()));
  await staticPage.goto(`${origin}/product-hex-dumbbell.html`);
  assert.ok(await staticPage.locator('h1').isVisible());
  assert.equal(await staticPage.locator('noscript a').count(),2);
  await nojs.close();
  const filePage=await context.newPage();
  await filePage.goto(`file:///${root.replaceAll('\\','/')}/products.html`);
  await filePage.locator('#page-loader').waitFor({state:'hidden'});
  await filePage.locator('[data-product-filter="movement"]').click();
  assert.equal(await filePage.locator('.product-card:visible').count(),2);
  await filePage.locator('.product-card:visible h3 a').first().click();
  await filePage.locator('#page-loader').waitFor({state:'hidden'});
  assert.ok(await filePage.locator('[data-product-main]').evaluate(e=>e.complete&&e.naturalWidth===1000));
  await filePage.close();
  // All live local references and fragments must resolve, including generated detail pages.
  let references=0;
  for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.html'))){
    const html=fs.readFileSync(path.join(root,file),'utf8');
    for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
      const value=match[1];
      if(/^(?:https?:|data:|mailto:|tel:)/.test(value))continue;
      const url=new URL(value,`${origin}/${file}`);
      const target=path.join(root,decodeURIComponent(url.pathname.slice(1))||'index.html');
      assert.ok(fs.existsSync(target),`${file}: missing ${value}`);
      if(url.hash){const content=fs.readFileSync(target,'utf8');assert.ok(content.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`),`${file}: missing fragment ${value}`);}
      references++;
    }
  }
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);assert.deepEqual(writes,[]);
  fs.writeFileSync(path.join(__dirname,'products-test-results.json'),JSON.stringify({layouts,references,errors,missing,writes,captures},null,2));
  await browser.close();
  console.log(`Passed ${layouts} responsive layouts, ${references} local references, filters/search/reset, ${products.length} galleries/enquiries, validation, training regression, theme/menu and no-JS checks.`);
})().catch(error=>{console.error(error);process.exit(1);});
