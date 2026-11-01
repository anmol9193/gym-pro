(() => {
  'use strict';
  const catalog = document.querySelector('[data-product-catalog]');
  if (catalog) {
    const cards = [...catalog.querySelectorAll('[data-product-category]')];
    const filters = [...catalog.querySelectorAll('[data-product-filter]')];
    const search = catalog.querySelector('#product-search');
    const count = catalog.querySelector('[data-product-count]');
    const empty = catalog.querySelector('[data-product-empty]');
    const supplementTools = catalog.querySelector('[data-supplement-tools]');
    const supplementType = catalog.querySelector('#supplement-type');
    const params = new URLSearchParams(location.search);
    const requestedCategory = params.get('category');
    let category = filters.some(button => button.dataset.productFilter === requestedCategory) ? requestedCategory : 'all';
    const requestedType = params.get('type');
    if (category === 'supplements' && [...supplementType.options].some(option => option.value === requestedType)) supplementType.value = requestedType;
    function update() {
      const query = search.value.trim().toLocaleLowerCase();
      let visible = 0;
      cards.forEach(card => {
        const matchesType = category !== 'supplements' || supplementType.value === 'all' || card.dataset.productType === supplementType.value;
        const matches = (category === 'all' || card.dataset.productCategory === category) && matchesType && card.dataset.productName.includes(query);
        card.hidden = !matches;
        if (matches) visible++;
      });
      filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.productFilter === category)));
      count.textContent = `${visible} ${visible === 1 ? 'product' : 'products'}${query || category !== 'all' ? ' found' : ''}`;
      empty.hidden = visible !== 0;
      supplementTools.hidden = category !== 'supplements';
    }
    filters.forEach(button => button.addEventListener('click', () => {
      category = button.dataset.productFilter;
      if (category !== 'supplements') supplementType.value = 'all';
      update();
    }));
    supplementType.addEventListener('change', update);
    search.addEventListener('input', update);
    catalog.querySelector('[data-product-reset]').addEventListener('click', () => {
      category = 'all';
      search.value = '';
      supplementType.value = 'all';
      update();
      search.focus({ preventScroll: true });
    });
    catalog.querySelector('[data-product-controls]').hidden = false;
    update();
  }

  const gallery = document.querySelector('[data-product-gallery]');
  if (!gallery) return;
  const main = gallery.querySelector('[data-product-main]');
  const zoomLink = gallery.querySelector('[data-product-zoom]');
  const thumbs = [...gallery.querySelectorAll('[data-product-view]')];
  const status = gallery.querySelector('[data-product-view-status]');
  const dialog = document.querySelector('[data-product-dialog]');
  let view = '1';
  thumbs.forEach(button => {
    button.disabled = false;
    button.addEventListener('click', () => {
      view = button.dataset.productView;
      main.src = button.dataset.productSrc;
      main.alt = button.dataset.productAlt;
      zoomLink.href = button.dataset.productSrc;
      thumbs.forEach(thumb => thumb.setAttribute('aria-pressed', String(thumb === button)));
      status.textContent = `View ${view} of 3. Original 3D concept visual.`;
    });
  });
  // The image link still opens the asset in browsers without native dialog support.
  if (!dialog?.showModal) return;
  zoomLink.addEventListener('click', event => {
    event.preventDefault();
    const enlarged = dialog.querySelector('[data-product-zoom-image]');
    enlarged.src = main.src;
    enlarged.alt = main.alt;
    dialog.querySelector('[data-product-zoom-caption]').textContent = `View ${view} of 3. Demo product concept.`;
    dialog.showModal();
    document.documentElement.classList.add('product-zoom-open');
    dialog.querySelector('[data-product-close]').focus();
  });
  dialog.querySelector('[data-product-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', event => {
    // The close control is the only interactive element in this image dialog.
    if (event.key === 'Tab') {
      event.preventDefault();
      dialog.querySelector('[data-product-close]').focus();
    }
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('product-zoom-open');
    zoomLink.focus({ preventScroll: true });
  });
})();
