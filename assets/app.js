(() => {
  'use strict';

  const root = document.documentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  // Show the brand briefly on a fast load; release as soon as the hero is ready.
  const pageLoader = window.beastPageLoader;
  if (pageLoader && !pageLoader.finished) {
    const heroImage = document.querySelector('.hero-photo');
    const heroReady = heroImage?.decode ? heroImage.decode() : Promise.resolve();
    Promise.allSettled([document.fonts.ready, heroReady]).then(() => {
      const remaining = reducedMotion.matches ? 0 : Math.max(0, 650 - (performance.now() - pageLoader.startedAt));
      setTimeout(pageLoader.finish, remaining);
    });
  }
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const navbar = document.querySelector('.navbar');
  const menu = document.getElementById('nav-links');
  const menuToggle = document.getElementById('menu-toggle');
  const themeToggle = document.querySelector('.theme-toggle');
  let motionPaused = false;

  // Save only the theme preference, never enquiry details.
  function syncThemeButton() {
    const dark = root.dataset.theme === 'dark';
    const label = `Switch to ${dark ? 'light' : 'dark'} theme`;
    themeToggle.setAttribute('aria-label', label);
    themeToggle.title = label;
    document.querySelector('meta[name="theme-color"]').content = dark ? '#101211' : '#ffffff';
  }
  themeToggle.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('beast-theme', root.dataset.theme); } catch (_) {}
    syncThemeButton();
  });
  syncThemeButton();
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', event => {
    let saved;
    try { saved = localStorage.getItem('beast-theme'); } catch (_) {}
    if (!saved) {
      root.dataset.theme = event.matches ? 'light' : 'dark';
      syncThemeButton();
    }
  });

  function setMenu(open, restoreFocus = false) {
    menu.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (restoreFocus) menuToggle.focus();
  }
  menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', event => { if (!navbar.contains(event.target)) setMenu(false); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') setMenu(false, true);
  });
  matchMedia('(min-width: 1201px)').addEventListener('change', () => setMenu(false));
  navbar.addEventListener('focusout', event => { if (!navbar.contains(event.relatedTarget)) setMenu(false); });

  // Keep native scrolling and history; update just the small progress and depth cues.
  const progress = document.querySelector('.scroll-progress');
  const heroVisual = document.querySelector('.hero-visual');
  const navItems = [...menu.querySelectorAll('a[href^="#"]:not(.button)')];
  const sections = navItems.map(link => document.querySelector(link.getAttribute('href')));
  let scrollQueued = false;
  function updateScroll() {
    const max = root.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
    navbar.classList.toggle('is-scrolled', scrollY > 24);
    const cutoff = navbar.getBoundingClientRect().bottom + 70;
    let current = sections[0];
    sections.forEach(section => { if (section.getBoundingClientRect().top <= cutoff) current = section; });
    navItems.forEach(link => {
      if (link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    if (heroVisual && !reducedMotion.matches && !motionPaused && innerWidth > 700 && scrollY < 1000) {
      heroVisual.style.setProperty('--parallax', `${Math.min(scrollY * .065, 40)}px`);
    } else if (heroVisual) heroVisual.style.removeProperty('--parallax');
    scrollQueued = false;
  }
  function queueScroll() {
    if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateScroll); }
  }
  addEventListener('scroll', queueScroll, { passive: true });
  addEventListener('resize', queueScroll);
  updateScroll();

  // Content stays visible when JavaScript is unavailable or motion is reduced.
  root.classList.add('motion-ready');
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .08, rootMargin: '0px 0px 30px 0px' });
  document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
  document.querySelectorAll('details').forEach(detail => detail.addEventListener('toggle', queueScroll));

  const countObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      countObserver.unobserve(entry.target);
      if (reducedMotion.matches || motionPaused) return;
      const element = entry.target;
      const value = Number(element.dataset.count);
      const start = performance.now();
      function count(now) {
        const t = Math.min((now - start) / 1300, 1);
        const result = Math.round(value * (1 - Math.pow(1 - t, 3)));
        element.firstChild.textContent = result.toLocaleString('en-IN');
        if (t < 1 && !reducedMotion.matches && !motionPaused) requestAnimationFrame(count);
        else element.firstChild.textContent = value.toLocaleString('en-IN');
      }
      requestAnimationFrame(count);
    });
  }, { threshold: .4 });
  document.querySelectorAll('[data-count]').forEach(element => countObserver.observe(element));

  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const programCards = [...document.querySelectorAll('.program-card')];
  filterButtons.forEach(button => button.addEventListener('click', () => {
    filterButtons.forEach(item => {
      item.classList.toggle('active', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    });
    let visible = 0;
    programCards.forEach(card => {
      card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
      if (!card.hidden) { visible++; card.classList.add('is-visible'); }
    });
    document.querySelector('.filter-count').textContent = `${visible} programs. Your next move.`;
    queueScroll();
  }));

  document.querySelectorAll('[data-tilt]').forEach(card => {
    let frame = 0;
    card.addEventListener('pointermove', event => {
      if (!finePointer.matches || reducedMotion.matches || motionPaused) return;
      if (frame) cancelAnimationFrame(frame);
      const x = event.clientX, y = event.clientY;
      frame = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--tilt-x', `${((y - rect.top) / rect.height - .5) * -5}deg`);
        card.style.setProperty('--tilt-y', `${((x - rect.left) / rect.width - .5) * 6}deg`);
        frame = 0;
      });
    });
    card.addEventListener('pointerleave', () => {
      cancelAnimationFrame(frame);
      frame = 0;
      card.style.removeProperty('--tilt-x');
      card.style.removeProperty('--tilt-y');
    });
  });

  const roadmap = [
    { label: 'WEEK 01 / THE FIRST STEP', title: "Just show up.\nThat's your first win.", description: 'Meet your coach, get comfortable with the gym and build a routine you can come back to.', focus: 'Build the habit.', badge: 'FOUNDATION', bars: 1 },
    { label: 'WEEK 04 / FIND YOUR RHYTHM', title: 'Less overthinking.\nMore moving.', description: 'Practise the basics, notice what feels better and make training a regular part of your week.', focus: 'Find your rhythm.', badge: 'CONSISTENCY', bars: 4 },
    { label: 'WEEK 08 / KEEP BUILDING', title: 'Same commitment.\nA little more confidence.', description: 'Review your routine with your coach, adjust your training and keep working towards your own goals.', focus: 'Trust the process.', badge: 'MOMENTUM', bars: 8 },
    { label: 'WEEK 12 / YOUR NEXT CHAPTER', title: 'Look how far\nyou have come.', description: 'Reflect on the habits you have built, celebrate your effort and plan what you want to work on next.', focus: 'Keep raising your bar.', badge: 'NEXT CHAPTER', bars: 12 }
  ];
  const weekTabs = [...document.querySelectorAll('[data-week]')];
  function setWeek(index, focusTab = false) {
    const week = roadmap[index];
    weekTabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
    });
    document.getElementById('journey-index').textContent = String(index + 1).padStart(2, '0');
    document.getElementById('journey-label').textContent = week.label;
    document.getElementById('journey-title').textContent = week.title;
    document.getElementById('journey-description').textContent = week.description;
    document.getElementById('journey-focus').textContent = week.focus;
    document.getElementById('journey-badge').textContent = week.badge;
    document.getElementById('journey-panel').setAttribute('aria-labelledby', weekTabs[index].id);
    document.querySelectorAll('.growth-chart>div>span').forEach((bar, i) => { bar.style.opacity = i < week.bars ? String(.45 + i / 24) : '.12'; });
    if (focusTab) weekTabs[index].focus();
  }
  weekTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setWeek(index));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % weekTabs.length;
      if (event.key === 'ArrowLeft') next = (index + weekTabs.length - 1) % weekTabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = weekTabs.length - 1;
      if (next !== undefined) { event.preventDefault(); setWeek(next, true); }
    });
  });

  function initEnquiry() {
    const form = document.getElementById('join-form');
    if (!form) return;
    // All actions lead to an editable, truthful enquiry preview.
    document.querySelectorAll('.plan-select[href="#join"]').forEach(link => link.addEventListener('click', () => {
      document.getElementById('plan').value = link.dataset.plan;
      editEnquiry(false);
    }));
    programCards.filter(link => link.getAttribute('href') === '#join').forEach(link => link.addEventListener('click', () => {
      document.getElementById('goal').value = link.dataset.program;
      editEnquiry(false);
    }));
    const result = document.getElementById('enquiry-result');
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const enquiryParams = new URLSearchParams(location.search);
    const requestedProgram = enquiryParams.get('program');
    const planInput = document.getElementById('plan');
    const requestedPlan = enquiryParams.get('plan');
    if ([...planInput.options].some(option => option.value === requestedPlan)) planInput.value = requestedPlan;
    const goal = document.getElementById('goal');
    if ([...goal.options].some(option => option.value === requestedProgram)) goal.value = requestedProgram;
    const productInput = document.getElementById('product');
    if (productInput) {
      const requestedProduct = enquiryParams.get('product');
      if ([...productInput.options].some(option => option.value === requestedProduct)) productInput.value = requestedProduct;
      const trainingFields = form.querySelector('.contact-select-row');
      const productContext = document.getElementById('product-contact-context');
      function updateEnquiryTopic() {
        const isProduct = productInput.value !== '';
        if (trainingFields) trainingFields.hidden = isProduct;
        if (productContext) productContext.hidden = !isProduct;
      }
      productInput.addEventListener('change', updateEnquiryTopic);
      updateEnquiryTopic();
    }
    form.querySelector('[type="submit"]').disabled = false;
    nameInput.addEventListener('input', () => nameInput.setCustomValidity(''));
    phoneInput.addEventListener('input', () => phoneInput.setCustomValidity(''));
    form.addEventListener('submit', event => {
      event.preventDefault();
      const name = nameInput.value.trim();
      const phone = phoneInput.value.trim();
      const digits = phone.replace(/\D/g, '');
      if (name.length < 2) {
        nameInput.setCustomValidity('Please enter your name using at least two characters.');
        nameInput.reportValidity();
        return;
      }
      if (!/^[+\d\s().-]+$/.test(phone) || digits.length < 10 || digits.length > 15) {
        phoneInput.setCustomValidity('Please enter a valid phone number with 10 to 15 digits.');
        phoneInput.reportValidity();
        return;
      }
      let summary = `${name} \u00b7 ${phone} \u00b7 ${planInput.value} membership \u00b7 ${goal.value}.`;
      if (productInput?.value) {
        summary = `${name} \u00b7 ${phone}\nProduct enquiry: ${productInput.selectedOptions[0].textContent}.\nPlease confirm options, pricing and availability.`;
      }
      const email = form.querySelector('[name="email"]')?.value.trim();
      const message = form.querySelector('[name="message"]')?.value.trim();
      if (email) summary += `\nEmail: ${email}`;
      if (message) summary += `\nMessage: ${message}`;
      document.getElementById('enquiry-summary').textContent = summary;
      const copyStatus = document.getElementById('copy-status');
      if (copyStatus) copyStatus.textContent = '';
      form.hidden = true;
      result.hidden = false;
      document.getElementById('edit-enquiry').focus({ preventScroll: true });
      queueScroll();
    });
    function editEnquiry(focus = true) {
      form.hidden = false;
      result.hidden = true;
      if (focus) nameInput.focus();
      queueScroll();
    }
    document.getElementById('edit-enquiry').addEventListener('click', () => editEnquiry());
    const copyButton = document.getElementById('copy-enquiry');
    copyButton?.addEventListener('click', async () => {
      const status = document.getElementById('copy-status');
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(document.getElementById('enquiry-summary').textContent);
        status.textContent = 'Draft copied. You can paste it wherever you choose.';
      } catch (_) {
        status.textContent = 'Select the enquiry summary above and copy it manually.';
      }
    });

  }
  initEnquiry();

  // Actual 3D geometry, local dependency, no remote models or runtime CDN requests.
  function initDumbbell() {
    const host = document.getElementById('weight-scene');
    if (!host) return;
    const pause = document.createElement('button');
    pause.type = 'button';
    pause.className = 'scene-pause';
    pause.setAttribute('aria-label', 'Pause animations');
    pause.setAttribute('aria-pressed', 'false');
    pause.title = 'Pause animations';
    pause.textContent = 'Ⅱ';
    document.querySelector('.weight-card-top').append(pause);
    let drawStatic = () => {};
    let startLoop = () => {};
    pause.addEventListener('click', () => {
      motionPaused = !motionPaused;
      root.classList.toggle('is-motion-paused', motionPaused);
      pause.setAttribute('aria-pressed', String(motionPaused));
      pause.setAttribute('aria-label', `${motionPaused ? 'Play' : 'Pause'} animations`);
      pause.title = `${motionPaused ? 'Play' : 'Pause'} animations`;
      pause.textContent = motionPaused ? '▷' : 'Ⅱ';
      if (!motionPaused) startLoop();
      else drawStatic();
      queueScroll();
    });
    if (!window.THREE) { host.dataset.renderer = 'fallback'; return; }
    const probe = document.createElement('canvas');
    if (!probe.getContext('webgl2') && !probe.getContext('webgl')) { host.dataset.renderer = 'fallback'; return; }
    try {
      const T = window.THREE;
      const renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.6));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = T.SRGBColorSpace;
      host.append(renderer.domElement);
      host.classList.add('has-webgl');
      host.dataset.renderer = 'webgl';
      const scene = new T.Scene();
      const camera = new T.PerspectiveCamera(35, 1, .1, 100);
      camera.position.set(0, .4, 8.5);
      camera.lookAt(0, 0, 0);
      scene.add(new T.HemisphereLight(0xf6ffe9, 0x3b4529, 2.4));
      const key = new T.DirectionalLight(0xffffff, 3.5);
      key.position.set(3, 5, 4); scene.add(key);
      const rim = new T.DirectionalLight(0xd2fa49, 2.5);
      rim.position.set(-4, 1, -2); scene.add(rim);
      const fill = new T.DirectionalLight(0xb3d4ff, 1.2);
      fill.position.set(2, -2, 3); scene.add(fill);
      const lime = new T.MeshStandardMaterial({ color: 0xd2fa49, metalness: .42, roughness: .25 });
      const charcoal = new T.MeshStandardMaterial({ color: 0x252d21, metalness: .7, roughness: .3 });
      const chrome = new T.MeshStandardMaterial({ color: 0xdfe5d8, metalness: .8, roughness: .2 });
      const grip = new T.MeshStandardMaterial({ color: 0x66705e, metalness: .6, roughness: .6 });
      const dumbbell = new T.Group();
      function cylinder(radius, depth, x, material, sides = 64) {
        const mesh = new T.Mesh(new T.CylinderGeometry(radius, radius, depth, sides), material);
        mesh.rotation.z = Math.PI / 2;
        mesh.position.x = x;
        dumbbell.add(mesh);
        return mesh;
      }
      cylinder(.13, 3.1, 0, chrome);
      cylinder(.17, 1.25, 0, grip);
      for (let i = -5; i <= 5; i++) cylinder(.176, .024, i * .105, chrome, 32);
      [-1, 1].forEach(side => {
        cylinder(.61, .27, side * .95, charcoal, 12);
        cylinder(.78, .37, side * 1.23, lime, 12);
        cylinder(.65, .12, side * 1.47, charcoal, 12);
        cylinder(.4, .13, side * 1.55, lime, 48);
        cylinder(.15, .17, side * 1.65, chrome, 32);
        const ring = new T.Mesh(new T.TorusGeometry(.5, .018, 8, 48), chrome);
        ring.rotation.y = Math.PI / 2;
        ring.position.x = side * 1.625;
        dumbbell.add(ring);
      });
      dumbbell.rotation.set(.35, .45, -.45);
      scene.add(dumbbell);
      const orbit = new T.Mesh(new T.TorusGeometry(2.02, .009, 6, 100), new T.MeshBasicMaterial({ color: 0x7c9652, transparent: true, opacity: .3 }));
      orbit.rotation.x = 1.1;
      orbit.rotation.z = -.3;
      scene.add(orbit);
      let inView = true, lost = false, animationFrame = 0, time = 0, last = 0;
      let pointerX = 0, pointerY = 0, dragRotation = 0, dragStart = null;
      const canAnimate = () => inView && !document.hidden && !reducedMotion.matches && !motionPaused && !lost;
      function render() { if (!lost) renderer.render(scene, camera); }
      drawStatic = render;
      function resize() {
        const { width, height } = host.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        render();
      }
      new ResizeObserver(resize).observe(host);
      resize();
      function tick(now) {
        animationFrame = 0;
        if (!canAnimate()) { last = 0; return; }
        const delta = last ? Math.min((now - last) / 1000, .05) : 0;
        last = now; time += delta;
        dumbbell.rotation.x += (.35 + pointerY * .3 + Math.min(scrollY, 1000) * .0005 - dumbbell.rotation.x) * .05;
        dumbbell.rotation.y = .45 + time * .28 + pointerX * .4 + dragRotation;
        dumbbell.rotation.z = -.45 + Math.sin(time * .55) * .12;
        dumbbell.position.y = Math.sin(time * 1.1) * .1;
        orbit.rotation.z = -.3 + time * .06;
        render();
        animationFrame = requestAnimationFrame(tick);
      }
      startLoop = () => { if (!animationFrame && canAnimate()) animationFrame = requestAnimationFrame(tick); };
      function stopLoop() { if (animationFrame) cancelAnimationFrame(animationFrame); animationFrame = 0; last = 0; }
      new IntersectionObserver(entries => {
        inView = entries[0].isIntersecting;
        if (inView) startLoop(); else stopLoop();
      }, { rootMargin: '80px' }).observe(host);
      document.addEventListener('visibilitychange', () => { if (document.hidden) stopLoop(); else startLoop(); });
      reducedMotion.addEventListener('change', () => {
        if (reducedMotion.matches) { stopLoop(); render(); } else startLoop();
        queueScroll();
      });
      host.addEventListener('pointermove', event => {
        if (reducedMotion.matches || motionPaused) return;
        const rect = host.getBoundingClientRect();
        pointerX = (event.clientX - rect.left) / rect.width - .5;
        pointerY = (event.clientY - rect.top) / rect.height - .5;
        if (dragStart !== null) { dragRotation += (event.clientX - dragStart) * .015; dragStart = event.clientX; }
      });
      host.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; });
      host.addEventListener('pointerdown', event => {
        if (event.pointerType !== 'mouse' || reducedMotion.matches || motionPaused) return;
        dragStart = event.clientX;
        host.setPointerCapture(event.pointerId);
        host.style.cursor = 'grabbing';
      });
      function endDrag() { dragStart = null; host.style.cursor = ''; }
      host.addEventListener('pointerup', endDrag);
      host.addEventListener('pointercancel', endDrag);
      host.addEventListener('lostpointercapture', endDrag);
      renderer.domElement.addEventListener('webglcontextlost', event => {
        event.preventDefault(); lost = true; stopLoop(); host.classList.remove('has-webgl'); host.dataset.renderer = 'fallback';
      });
      renderer.domElement.addEventListener('webglcontextrestored', () => {
        lost = false; host.classList.add('has-webgl'); host.dataset.renderer = 'webgl'; resize(); startLoop();
      });
      render();
      startLoop();
    } catch (_) {
      host.querySelector('canvas')?.remove();
      host.classList.remove('has-webgl');
      host.dataset.renderer = 'fallback';
    }
  }
  initDumbbell();
})();
