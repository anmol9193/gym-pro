"""Generate static demo product pages and connect the current site shell.

Run: python scripts/build-product-pages.py
Product content: assets/products.json. Images: scripts/render-products.cjs.
"""
from html import escape
import json
from pathlib import Path
import re
from urllib.parse import urlencode

ROOT = Path(__file__).resolve().parent.parent
items = json.loads((ROOT / 'assets/products.json').read_text(encoding='utf-8'))
by_slug = {item['slug']: item for item in items}
if not items or len(by_slug) != len(items):
    raise ValueError('Expected a nonempty catalog with unique product slugs.')
total = len(items)
supplements = [item for item in items if item['category'] == 'supplements']
for item in items:
    if not re.fullmatch(r'[a-z0-9-]+', item['slug']):
        raise ValueError('Invalid product slug.')
    for view in range(1, 4):
        if not (ROOT / f'assets/products/{item["slug"]}-{view}.jpg').is_file():
            raise ValueError('Render all product images before building pages.')

# Keep navigation changes idempotent and preserve each page's active item.
for page in ROOT.glob('*.html'):
    content = page.read_text(encoding='utf-8')
    if '<nav class="navbar"' not in content:
        continue
    menu = re.search(r'<ul class="nav-links".*?</ul>', content, re.S).group()
    if 'href="products.html"' not in menu:
        updated = re.sub(r'(<li><a href="programs.html"[^>]*>Programs</a></li>)', r'\1\n      <li><a href="products.html">Products</a></li>', menu)
        page.write_text(content.replace(menu, updated), encoding='utf-8')

source = (ROOT / 'programs.html').read_text(encoding='utf-8')
shell = source.split('<main id="main">', 1)[0]
shell = shell.replace('assets/programs.css', 'assets/products.css')
shell = shell.replace('<script src="assets/app.js" defer></script>', '<script src="assets/app.js" defer></script>\n  <script src="assets/products.js" defer></script>')
shell = shell.replace('href="programs.html" aria-current="page"', 'href="programs.html"')
footer = source[source.index('<footer class="footer'):]
arrow = '<svg class="icon" aria-hidden="true"><use href="#icon-up-right"/></svg>'

def e(value):
    return escape(str(value), quote=True)

def route(item):
    return f'product-{item["slug"]}.html'

def enquiry(item):
    return 'contact.html?' + urlencode({'product': item['slug']}) + '#enquiry'

def card(item, index=0):
    return f'''<article class="product-card" data-product-category="{item['category']}" data-product-type="{e(item.get('supplementType', ''))}" data-product-name="{e((item['name'] + ' ' + item.get('typeLabel', '')).lower())}">
      <a class="product-photo" href="{route(item)}" tabindex="-1" aria-hidden="true"><img src="assets/products/{item['slug']}-1.jpg" width="1000" height="1000" alt="" loading="lazy"><span class="product-number" aria-hidden="true">BM / {index + 1:02d}</span><span class="product-photo-arrow">{arrow}</span></a>
      <div class="product-card-copy"><span class="eyebrow">{e(item.get('typeLabel', item['categoryLabel']))}</span><h3><a href="{route(item)}">{e(item['name'])}</a></h3><p>{e(item['short'])}</p><div class="product-card-bottom"><span>Price on enquiry</span><a href="{route(item)}" aria-label="View {e(item['name'])}">View product {arrow}</a></div></div>
    </article>'''

def prefix(title, description, detail=False):
    p = re.sub(r'<title>.*?</title>', f'<title>{e(title)} | BEAST MODE Gym</title>', shell)
    p = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{e(description)}">', p)
    p = p.replace('class="programs-page"', 'class="product-detail-page"' if detail else 'class="products-page"')
    return p.replace('href="products.html">Products', 'href="products.html" aria-current="' + ('true' if detail else 'page') + '">Products')

cards = ''.join(card(item, items.index(item)) for item in supplements + [item for item in items if item['category'] != 'supplements'])
types = [('protein', 'Protein'), ('creatine', 'Creatine'), ('pre-workout', 'Pre-workout'), ('mass-gainer', 'Mass gainer'), ('daily-essentials', 'Daily essentials')]
type_options = ''.join(f'<option value="{value}">{label}</option>' for value, label in types)
catalog = f'''<main id="main">
  <header class="product-catalog-heading section-container" id="top"><nav class="product-breadcrumbs" aria-label="Breadcrumb"><a href="index.html#home">Home</a><span aria-hidden="true">/</span><span aria-current="page">Products</span></nav><div class="product-heading-row"><div><span class="eyebrow"><span class="status-dot"></span> THE BEAST MODE COLLECTION</span><h1>YOUR KIT.<br><span class="accent-text">YOUR FUEL.</span></h1></div><div class="product-heading-note"><span class="demo-label">DEMO COLLECTION / {total:02d} PRODUCTS</span><p>Training gear and supplement concepts.<br> Explore the collection, find your next enquiry.</p><small>Concept visuals. Prices and availability on enquiry.</small></div></div></header>
  <section class="product-catalog section-container" data-product-catalog id="product-catalog" aria-label="Browse products">
    <div class="product-toolbar" data-product-controls hidden><div class="product-filters" role="group" aria-label="Filter products by category"><button type="button" data-product-filter="all" aria-pressed="true">All products <span>{total:02d}</span></button><button type="button" data-product-filter="supplements" aria-pressed="false">Supplements <span>{len(supplements):02d}</span></button><button type="button" data-product-filter="strength" aria-pressed="false">Strength</button><button type="button" data-product-filter="movement" aria-pressed="false">Movement</button><button type="button" data-product-filter="essentials" aria-pressed="false">Essentials</button></div><label class="product-search" for="product-search"><svg class="search-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><span class="sr-only">Search products</span><input id="product-search" type="search" placeholder="Search products" maxlength="80" autocomplete="off"></label></div>
    <div class="supplement-type-toolbar" data-supplement-tools hidden><label for="supplement-type">Supplement type<select id="supplement-type"><option value="all">All supplement types</option>{type_options}</select></label><p>Demo packaging. Actual ingredients, pack sizes and prices on enquiry.</p></div>
    <div class="product-catalog-meta"><p data-product-count role="status" aria-live="polite">{total} products</p><span>DESIGNED TO SHOW UP WITH YOU.</span></div><div class="product-grid">{cards}</div>
    <div class="product-empty" data-product-empty hidden><span class="eyebrow">LET'S TRY AGAIN</span><h2>No products found.</h2><p>Try a different name or browse the full collection.</p><button class="button button-primary" type="button" data-product-reset>Show all products {arrow}</button></div>
    <noscript><p class="notice">All {total} demo products are shown. Open a product to see more views and enquiry details.</p></noscript>
  </section>
  <section class="product-catalog-end section-container"><span class="eyebrow">FIND YOUR SETUP</span><h2>GOT A QUESTION<br><span class="muted-heading">ABOUT THE COLLECTION?</span></h2><a class="button button-outline" href="contact.html#enquiry">Let's talk {arrow}</a></section>
</main>'''
(ROOT / 'products.html').write_text(prefix('Products', 'Explore demo gym equipment and supplements: protein, creatine, pre-workout, mass gainer and daily essentials.') + catalog + footer, encoding='utf-8')

for index, item in enumerate(items):
    specs = ''.join(f'<div><dt>{e(label)}</dt><dd>{e(value)}</dd></div>' for label, value in item['details'])
    thumbs = ''.join(f'''<button class="product-thumbnail" type="button" data-product-view="{i}" data-product-src="assets/products/{item['slug']}-{i}.jpg" data-product-alt="3D concept of {e(item['name'])}, view {i} of 3" aria-label="Show {e(item['name'])}, view {i} of 3" aria-pressed="{'true' if i == 1 else 'false'}" disabled><img src="assets/products/{item['slug']}-{i}.jpg" width="1000" height="1000" alt=""><span>0{i}</span></button>''' for i in range(1, 4))
    related = ''.join(card(by_slug[slug], items.index(by_slug[slug])) for slug in item['related'])
    body = f'''<main id="main">
  <section class="product-single section-container" id="top"><nav class="product-breadcrumbs" aria-label="Breadcrumb"><a href="index.html#home">Home</a><span aria-hidden="true">/</span><a href="products.html">Products</a><span aria-hidden="true">/</span><span aria-current="page">{e(item['name'])}</span></nav>
    <div class="product-single-grid"><div class="product-single-heading"><span class="eyebrow">{item['categoryLabel']} / DEMO COLLECTION</span><h1>{e(item['name'])}</h1><p class="product-tagline">{item['tagline']}</p></div><div class="product-gallery" data-product-gallery><div class="product-gallery-stage"><span class="product-stage-label">BEAST MODE / DEMO OBJECT {index + 1:02d}</span><a class="product-main-photo" href="assets/products/{item['slug']}-1.jpg" data-product-zoom aria-label="Enlarge {e(item['name'])} image"><img class="hero-photo" data-product-main src="assets/products/{item['slug']}-1.jpg" width="1000" height="1000" alt="3D concept of {e(item['name'])}, view 1 of 3" fetchpriority="high"><span class="product-zoom-hint">View larger <span aria-hidden="true">+</span></span></a></div><div class="product-thumbnails" aria-label="Product views">{thumbs}</div><p class="product-gallery-note" data-product-view-status role="status" aria-live="polite">View 1 of 3. Original 3D concept visual.</p><noscript><p class="notice">Other views: <a href="assets/products/{item['slug']}-2.jpg">View 2</a> / <a href="assets/products/{item['slug']}-3.jpg">View 3</a></p></noscript></div>
    <div class="product-single-copy"><p class="product-description">{e(item['description'])}</p><div class="product-enquiry-block"><strong>Price on enquiry</strong><p>Ask about current options and availability.</p><a class="button button-primary product-enquire" href="{enquiry(item)}">Enquire about this product {arrow}</a><small>Prepare a local enquiry draft. Nothing is sent automatically.</small></div><div class="product-demo-note"><span class="status-dot" aria-hidden="true"></span><p>Demo product with concept visuals. {e(item.get('demoNote', 'Final specifications, colours and pricing are to be confirmed.'))}</p></div><a class="text-link" href="#product-details">Take a closer look <svg class="icon" aria-hidden="true"><use href="#icon-arrow"/></svg></a></div></div>
  </section>
  <section class="product-details section-container" id="product-details" aria-labelledby="product-details-heading"><div><span class="eyebrow">THE OBJECT / THE DETAILS</span><h2 id="product-details-heading">A CLOSER<br><span class="muted-heading">LOOK.</span></h2><dl class="product-specs">{specs}</dl></div><aside class="product-ask"><span class="eyebrow">BEFORE YOU CHOOSE</span><h3>Make it your setup.</h3><p>{e(item['ask'])}</p><a class="text-link product-enquire" href="{enquiry(item)}">Ask about {e(item['name'])} {arrow}</a></aside></section>
  <section class="product-related section-container" aria-labelledby="related-products-heading"><div class="section-heading"><div><span class="eyebrow">BUILD YOUR DAILY KIT</span><h2 id="related-products-heading">KEEP<br><span class="muted-heading">EXPLORING.</span></h2></div><a class="text-link" href="products.html">All products {arrow}</a></div><div class="product-grid">{related}</div></section>
  <dialog class="product-zoom-dialog" data-product-dialog aria-label="Enlarged {e(item['name'])} image"><button class="product-zoom-close" type="button" data-product-close aria-label="Close enlarged image">Close <span aria-hidden="true">&times;</span></button><img data-product-zoom-image src="assets/products/{item['slug']}-1.jpg" width="1000" height="1000" alt="Enlarged 3D concept of {e(item['name'])}"><p data-product-zoom-caption>View 1 of 3</p></dialog>
</main>'''
    (ROOT / route(item)).write_text(prefix(item['name'], item['description'], True) + body + footer, encoding='utf-8')

# Static home preview, regenerated without duplicating the section.
home_file = ROOT / 'index.html'
home = home_file.read_text(encoding='utf-8')
preview = ''.join(card(by_slug[slug], items.index(by_slug[slug])) for slug in ['hex-dumbbell', 'training-kettlebell', 'studio-yoga-mat', 'training-duffel'])
supplement_preview = ''.join(card(by_slug[slug], items.index(by_slug[slug])) for slug in ['whey-protein', 'creatine-monohydrate', 'pre-workout', 'daily-multivitamin'])
section = f'''<!-- PRODUCT PREVIEW START -->
  <section class="home-products section-container section-pad" id="products" aria-labelledby="home-products-heading"><div class="section-heading reveal"><div><span class="eyebrow">THE BEAST MODE COLLECTION</span><h2 id="home-products-heading">YOUR TRAINING.<br><span class="muted-heading">YOUR KIT.</span></h2></div><div class="home-products-intro"><p>Gear for the way you show up.<br>Explore our demo training collection.</p><a class="text-link" href="products.html">Explore all {total} products {arrow}</a></div></div><div class="product-grid home-product-grid">{preview}</div><p class="home-products-note">DEMO COLLECTION <span aria-hidden="true">/</span> Concept visuals. Prices and availability on enquiry.</p></section>
  <section class="home-products home-supplements section-container section-pad" id="supplements" aria-labelledby="home-supplements-heading"><div class="section-heading reveal"><div><span class="eyebrow">NEW / SUPPLEMENT COLLECTION</span><h2 id="home-supplements-heading">EXPLORE YOUR<br><span class="muted-heading">DAILY ROUTINE.</span></h2></div><div class="home-products-intro"><p>Protein, creatine and more.<br>Eight supplement concepts to explore.</p><a class="text-link" href="products.html?category=supplements#product-catalog">Explore all {len(supplements)} supplements {arrow}</a></div></div><div class="product-grid home-product-grid">{supplement_preview}</div><p class="home-products-note">DEMO SUPPLEMENTS <span aria-hidden="true">/</span> Packaging concepts. Ingredients, sizes and prices to be confirmed.</p></section>
  <!-- PRODUCT PREVIEW END -->
  '''
if '<!-- PRODUCT PREVIEW START -->' in home:
    home = re.sub(r'<!-- PRODUCT PREVIEW START -->.*?<!-- PRODUCT PREVIEW END -->\s*', lambda _: section, home, flags=re.S)
else:
    home = home.replace('<section class="method-section', section + '<section class="method-section', 1)
if 'href="assets/products.css"' not in home:
    home = home.replace('<link rel="stylesheet" href="assets/loader.css">', '<link rel="stylesheet" href="assets/loader.css">\n  <link rel="stylesheet" href="assets/products.css">')
home_file.write_text(home, encoding='utf-8')

# A real select keeps deep links valid without fetching JSON at runtime.
contact_file = ROOT / 'contact.html'
contact = contact_file.read_text(encoding='utf-8')
options = ''.join(f'<option value="{item["slug"]}">{e(item["name"])}</option>' for item in items)
field = f'''<label for="product">What is your enquiry about?<select id="product" name="product"><option value="">Training, membership or a first visit</option>{options}</select></label><p class="product-contact-context" id="product-contact-context" hidden>Product enquiry selected. Mention your preferred options or questions in the message below. Pricing and availability are to be confirmed.</p>'''
if 'id="product"' in contact:
    contact = re.sub(r'(<select id="product" name="product">).*?(</select>)', lambda match: match[1] + '<option value="">Training, membership or a first visit</option>' + options + match[2], contact, count=1, flags=re.S)
else:
    contact = contact.replace('<div class="contact-select-row">', field + '<div class="contact-select-row">', 1)
contact = contact.replace('Questions about training, memberships or your first visit?', 'Questions about training, memberships, products or your first visit?')
contact = contact.replace('Prepare an enquiry about your goals or first visit.', 'Prepare an enquiry about training, products or your first visit.')
contact_file.write_text(contact, encoding='utf-8')
print(f'Built catalog, {total} product pages, equipment/supplement home previews and Contact selector.')
