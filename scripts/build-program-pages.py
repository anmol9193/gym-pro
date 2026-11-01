"""Build the six static detail pages from local content and the current site shell.

Run from any directory: python scripts/build-program-pages.py
Edit assets/program-details.json for program copy; shared styling lives in
assets/program-detail.css. No runtime JSON fetch or third-party package is used.
"""
from html import escape
import json
from pathlib import Path
import re
from urllib.parse import quote, unquote, urlencode, urlsplit

ROOT = Path(__file__).resolve().parent.parent
PROGRAMS = json.loads((ROOT / 'assets/program-details.json').read_text(encoding='utf-8'))
ALLOWED = {'strength-training', 'hiit-cardio', 'personal-training', 'boxing-mma', 'yoga-mobility', 'diet-planning'}
if {item['slug'] for item in PROGRAMS} != ALLOWED or len(PROGRAMS) != 6:
    raise ValueError('Expected the six known program slugs.')
for item in PROGRAMS:
    if not re.fullmatch(r'[a-z0-9-]+', item['slug']):
        raise ValueError('Invalid program slug.')
    if Path(item['image']).name != item['image'] or not (ROOT / 'assets' / item['image']).is_file():
        raise ValueError('Program image must be an existing local asset.')

CATALOG = ROOT / 'programs.html'
source = CATALOG.read_text(encoding='utf-8')
original_home = re.search(r'<a class="brand" href="([^"]+)"', source).group(1)
old_home_path = urlsplit(original_home).path
home_file = ROOT / 'index.html'
if not home_file.is_file():
    home_file = ROOT / unquote(old_home_path)
if not home_file.is_file():
    raise ValueError('The linked home page must exist before generating program pages.')
home_path = quote(home_file.name)
if old_home_path != home_path:
    # Follow the existing home-file rename without reverting user edits.
    for page in ROOT.glob('*.html'):
        content = page.read_text(encoding='utf-8')
        updated = content.replace(f'href="{old_home_path}', f'href="{home_path}')
        if updated != content:
            page.write_text(updated, encoding='utf-8')
    source = CATALOG.read_text(encoding='utf-8')
shell = source.split('<main id="main">', 1)[0]
footer = source[source.index('<footer class="footer'):]
by_slug = {item['slug']: item for item in PROGRAMS}
arrow = '<svg class="icon" aria-hidden="true"><use href="#icon-up-right"/></svg>'
right_arrow = '<svg class="icon" aria-hidden="true"><use href="#icon-arrow"/></svg>'
home_match = re.search(r'<a class="brand" href="([^"]+)"', shell)
home_href = home_match.group(1)

def e(value):
    return escape(str(value), quote=True)

def file_for(item):
    return item['slug'] + '.html'

def enquire(item):
    return 'contact.html?' + urlencode({'program': item['name']}) + '#enquiry'

for index, item in enumerate(PROGRAMS):
    prefix = shell.replace('assets/programs.css', 'assets/program-detail.css')
    prefix = prefix.replace('class="programs-page"', 'class="program-detail-page"')
    prefix = prefix.replace('href="programs.html" aria-current="page"', 'href="programs.html" aria-current="true"')
    prefix = re.sub(r'<title>.*?</title>', f'<title>{e(item["name"])} | BEAST MODE Gym</title>', prefix)
    prefix = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{e(item["description"])}">', prefix)
    facts = ''.join(f'<div><dt>{e(label)}</dt><dd>{e(value)}</dd></div>' for label, value in item['facts'])
    fit = ''.join(f'<li>{e(value)}</li>' for value in item['fit'])
    focus = ''.join(f'<article class="detail-focus-card reveal"><span>0{i + 1}</span><h3>{e(part["title"])}</h3><p>{e(part["text"])}</p></article>' for i, part in enumerate(item['focus']))
    flow = ''.join(f'<li class="reveal"><span class="detail-step-number" aria-hidden="true">0{i + 1}</span><h3>{e(part["title"])}</h3><p>{e(part["text"])}</p></li>' for i, part in enumerate(item['flow']))
    faq = ''.join(f'<details><summary>{e(question)}<span aria-hidden="true">+</span></summary><p>{e(answer)}</p></details>' for question, answer in item['faq'])
    related = ''
    for slug in item['related']:
        other = by_slug[slug]
        related += f'''<a class="detail-related-card reveal" href="{file_for(other)}" data-tilt><div class="detail-related-photo"><img src="assets/{e(other['image'])}" width="1000" height="667" alt="{e(other['alt'])}" loading="lazy"></div><div class="detail-related-copy"><span>{e(other['categoryLabel'])}</span><h3>{e(other['name'])}</h3><p>{e(other['lead'])}</p><span class="detail-related-action">View program {arrow}</span></div></a>'''
    previous = PROGRAMS[(index - 1) % len(PROGRAMS)]
    following = PROGRAMS[(index + 1) % len(PROGRAMS)]
    body = f'''<main id="main">
  <header class="detail-hero section-container" id="top">
    <div class="detail-hero-copy">
      <nav class="detail-breadcrumbs" aria-label="Breadcrumb"><a href="{home_href}">Home</a><span aria-hidden="true">/</span><a href="programs.html">Programs</a><span aria-hidden="true">/</span><span aria-current="page">{e(item['name'])}</span></nav>
      <span class="eyebrow"><span class="status-dot"></span> {e(item['categoryLabel'])}</span>
      <h1>{e(item['headline'][0])}<br><span class="accent-text">{e(item['headline'][1])}</span></h1>
      <p>{e(item['description'])}</p>
      <div class="detail-hero-actions"><a class="button button-primary detail-enquire" href="{enquire(item)}" aria-label="Enquire about {e(item['name'])}">Enquire now {arrow}</a><a class="text-link" href="programs.html">All programs {right_arrow}</a></div>
      <span class="detail-hero-note">YOUR STARTING POINT. YOUR NEXT CHAPTER.</span>
    </div>
    <div class="detail-visual" data-tilt><img class="hero-photo" src="assets/{e(item['image'])}" width="1000" height="667" alt="{e(item['alt'])}" fetchpriority="high"><span class="detail-photo-label">BEAST MODE / PROGRAM 0{index + 1}</span><div class="detail-photo-caption"><span>{e(item['tag'])}</span><strong>{e(item['lead'])}</strong></div><span class="detail-photo-bolt" aria-hidden="true"><svg class="icon"><use href="#icon-bolt"/></svg></span></div>
    <dl class="detail-facts">{facts}</dl>
  </header>
  <section class="detail-overview section-container section-pad" aria-labelledby="overview-heading"><div class="detail-overview-copy reveal"><span class="eyebrow">THE PROGRAM / YOUR NEXT DIRECTION</span><h2 id="overview-heading">{e(item['overviewTitle'][0])}<br><span class="muted-heading">{e(item['overviewTitle'][1])}</span></h2><p>{e(item['overview'])}</p><a class="text-link" href="our-approach.html">Discover our approach {arrow}</a></div><aside class="detail-fit reveal" aria-labelledby="fit-heading"><span class="eyebrow">IS THIS YOUR NEXT MOVE?</span><h3 id="fit-heading">Find your fit.</h3><p>{e(item['audience'])}</p><ul>{fit}</ul><a class="text-link" href="membership.html#plans">Explore memberships {right_arrow}</a></aside></section>
  <section class="detail-focus section-container section-pad" aria-labelledby="focus-heading"><div class="section-heading reveal"><div><span class="eyebrow">MAKE EACH SESSION MEAN SOMETHING</span><h2 id="focus-heading">WHAT YOU'LL<br><span class="accent-text">FOCUS ON.</span></h2></div><p>A clearer direction.<br>A purpose behind the practice.</p></div><div class="detail-focus-grid">{focus}</div></section>
  <section class="detail-process section-pad" aria-labelledby="session-heading"><div class="section-container"><div class="section-heading reveal"><div><span class="eyebrow">A LOOK AT THE PROCESS</span><h2 id="session-heading">INTENT.<br><span class="muted-heading">PRACTICE. REFLECTION.</span></h2></div><p>Start a conversation.<br>Build from your own experience.</p></div><ol class="detail-session-steps">{flow}</ol></div></section>
  <section class="faq-section detail-faq section-container section-pad"><div class="faq-heading reveal"><span class="eyebrow">BEFORE YOU GET STARTED</span><h2>A LITTLE<br><span class="muted-heading">MORE CLARITY.</span></h2><p>Your questions about {e(item['name'])}.</p></div><div class="faq-list reveal">{faq}</div></section>
  <section class="detail-related section-container" aria-labelledby="related-heading"><div class="section-heading reveal"><div><span class="eyebrow">MORE WAYS TO FIND YOUR STRONG</span><h2 id="related-heading">KEEP<br><span class="muted-heading">EXPLORING.</span></h2></div><a class="text-link" href="programs.html">See all programs {right_arrow}</a></div><div class="detail-related-grid">{related}</div></section>
  <section class="detail-invite section-container section-pad" aria-labelledby="invite-heading"><div class="detail-invite-shell reveal"><div><span class="eyebrow">{e(item['name']).upper()} / YOUR NEXT MOVE</span><h2 id="invite-heading">YOUR NEXT STEP.<br>STARTS HERE.</h2><p>Tell us about your goals and the questions you have in mind.</p></div><div class="detail-invite-actions"><a class="button button-dark detail-enquire" href="{enquire(item)}">Enquire about this program {arrow}</a><a class="text-link" href="membership.html#plans">Compare memberships {right_arrow}</a></div></div></section>
  <nav class="detail-sequence section-container" aria-label="Program navigation"><a class="detail-previous" href="{file_for(previous)}">{right_arrow}<span><small>PREVIOUS PROGRAM</small><strong>{e(previous['name'])}</strong></span></a><a class="detail-next" href="{file_for(following)}"><span><small>NEXT PROGRAM</small><strong>{e(following['name'])}</strong></span>{right_arrow}</a></nav>
</main>
'''
    (ROOT / file_for(item)).write_text(prefix + body + footer, encoding='utf-8')

# Make the existing catalog a clear entry point; preserve article IDs and enquiries.
def update_article(match):
    slug, body = match.group(1), match.group(2)
    item = by_slug[slug]
    if 'program-detail-photo' not in body:
        body = re.sub(r'<div class="program-image">(.*?)</div>', lambda image: f'<a class="program-image program-detail-photo" href="{file_for(item)}" aria-label="View {e(item["name"])}">{image.group(1)}</a>', body, count=1, flags=re.S)
    body = re.sub(r'(<h3 id="title-[^"]+">)(?!<a)(.*?)(</h3>)', lambda title: title.group(1) + f'<a href="{file_for(item)}">' + title.group(2) + '</a>' + title.group(3), body, count=1, flags=re.S)
    if 'program-detail-link' not in body:
        body = re.sub(r'<a class="button button-outline program-enquire"([^>]*)>.*?</a>', lambda enquiry: f'<div class="catalog-card-actions"><a class="button button-outline program-detail-link" href="{file_for(item)}">View program {arrow}</a><a class="text-link program-enquire"{enquiry.group(1)}>Ask about this program {arrow}</a></div>', body, count=1, flags=re.S)
    return match.group(0).replace(match.group(2), body, 1)

pattern = r'<article class="program-card catalog-card[^>]*id="([^"]+)"[^>]*>(.*?)</article>'
source, count = re.subn(pattern, update_article, source, flags=re.S)
if count != 6:
    raise ValueError('Expected six catalog cards to connect.')
CATALOG.write_text(source, encoding='utf-8')
home = home_file.read_text(encoding='utf-8')
for item in PROGRAMS:
    home = home.replace(f'href="programs.html#{item["slug"]}"', f'href="{file_for(item)}"')
home_file.write_text(home, encoding='utf-8')
print('Built six program detail pages and connected the home/catalog cards.')
