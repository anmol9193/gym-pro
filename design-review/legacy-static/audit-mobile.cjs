const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');
const phase=process.argv.includes('--after')?'after':'before';
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce',isMobile:true,hasTouch:true,colorScheme:'dark'});
 const reports=[];
 for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.html'))){
  await page.goto(`http://127.0.0.1:8765/${file}`);await page.locator('#page-loader').waitFor({state:'hidden'});await page.evaluate(()=>document.fonts.ready);
  for(const width of [320,360,390,430,560,600,700,701,768,820,1024]){
   await page.setViewportSize({width,height:844});
   const report=await page.evaluate(()=>{
    const clipped=[];const small=[];
    const ignored='.marquee,.svg-defs,.skip-link,.comparison-scroll,.product-filters,[aria-hidden="true"],dialog:not([open]),.sr-only';
    const walker=document.createTreeWalker(document.querySelector('main'),NodeFilter.SHOW_TEXT);
    while(walker.nextNode()){
     const n=walker.currentNode,e=n.parentElement;
     if(!n.textContent.trim()||e.closest(ignored)||e.closest('script,style,option,noscript')||!e.getClientRects().length)continue;
     const range=document.createRange();range.selectNodeContents(n);
     const rects=[...range.getClientRects()];
     if(rects.some(r=>r.width>0&&(r.left< -1||r.right>innerWidth+1)))clipped.push({selector:e.className||e.tagName,text:n.textContent.trim().slice(0,65)});
    }
    for(const e of document.querySelectorAll('main input,main select,main textarea')){
     if(e.getClientRects().length&&parseFloat(getComputedStyle(e).fontSize)<16)small.push({id:e.id,font:getComputedStyle(e).fontSize});
    }
    const nav=document.querySelector('.nav-shell').getBoundingClientRect();
    const navItems=[...document.querySelectorAll('.nav-shell>.brand,.nav-actions')].map(e=>e.getBoundingClientRect());
    const headerFits=navItems.every(r=>r.left>=nav.left&&r.right<=nav.right)&&navItems[0].right<=navItems[1].left;
    return {pageFits:document.documentElement.scrollWidth<=innerWidth+1,headerFits,clipped,small};
   });
   if(!report.pageFits||!report.headerFits||report.clipped.length||report.small.length)reports.push({file,width,...report});
   if(['index.html','products.html','contact.html'].includes(file)&&[390,701].includes(width)){
    await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(__dirname,`mobile-${phase}-${file.slice(0,-5)}-${width}.png`)});
   }
  }
 }
 fs.writeFileSync(path.join(__dirname,`mobile-audit-${phase}.json`),JSON.stringify(reports,null,2));
 console.log(JSON.stringify({issues:reports.length,reports},null,2));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
