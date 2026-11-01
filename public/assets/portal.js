(() => {
  'use strict';
  const root = document.documentElement;
  const themeButtons = document.querySelectorAll('[data-theme-toggle]');
  const updateThemeLabels = () => themeButtons.forEach(button => {
    button.setAttribute('aria-label', `Switch to ${root.dataset.theme === 'dark' ? 'light' : 'dark'} theme`);
  });
  themeButtons.forEach(button => {
    button.hidden = false;
    button.addEventListener('click', () => {
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('beast-theme', root.dataset.theme); } catch (_) { /* In-memory theme still works. */ }
      updateThemeLabels();
    });
  });
  updateThemeLabels();

  const previewForm = document.querySelector('[data-login-preview]');
  previewForm?.addEventListener('submit', event => {
    event.preventDefault();
    location.assign(previewForm.action);
  });

  const password = document.getElementById('password');
  const passwordToggle = document.querySelector('[data-password-toggle]');
  if (password && passwordToggle) {
    passwordToggle.hidden = false;
    passwordToggle.addEventListener('click', () => {
      const visible = password.type === 'password';
      password.type = visible ? 'text' : 'password';
      passwordToggle.setAttribute('aria-pressed', String(visible));
      passwordToggle.setAttribute('aria-label', `${visible ? 'Hide' : 'Show'} password`);
    });
  }
  const email = document.getElementById('email');
  const emailError = document.getElementById('email-error');
  if (email && emailError) {
    email.addEventListener('invalid', () => { emailError.hidden = false; email.setAttribute('aria-invalid', 'true'); });
    email.addEventListener('input', () => { emailError.hidden = true; email.removeAttribute('aria-invalid'); });
  }

  const sidebar = document.getElementById('portal-sidebar');
  const main = document.querySelector('[data-dashboard-main]');
  const openButton = document.querySelector('[data-menu-open]');
  const closeButton = document.querySelector('[data-menu-close]');
  const backdrop = document.querySelector('[data-menu-backdrop]');
  if (sidebar && openButton && closeButton && backdrop) {
    openButton.hidden = false;
    closeButton.hidden = false;
    const mobile = matchMedia('(max-width: 900px)');
    let open = false, previousFocus = null;
    const syncMenu = () => {
      sidebar.inert = mobile.matches && !open;
      sidebar.setAttribute('aria-hidden', String(mobile.matches && !open));
      sidebar.toggleAttribute('aria-modal', mobile.matches && open);
      if (mobile.matches && open) { sidebar.setAttribute('role', 'dialog'); sidebar.setAttribute('aria-modal', 'true'); }
      else { sidebar.removeAttribute('role'); sidebar.removeAttribute('aria-modal'); }
      main.inert = mobile.matches && open;
      backdrop.hidden = !(mobile.matches && open);
      document.body.classList.toggle('bp-menu-is-open', mobile.matches && open);
      openButton.setAttribute('aria-expanded', String(mobile.matches && open));
    };
    const closeMenu = (restoreFocus = true) => {
      open = false; syncMenu();
      if (restoreFocus && mobile.matches) previousFocus?.focus();
    };
    openButton.addEventListener('click', () => {
      previousFocus = document.activeElement; open = true; syncMenu();
      sidebar.querySelector('a,button')?.focus();
    });
    closeButton.addEventListener('click', () => closeMenu());
    backdrop.addEventListener('click', () => closeMenu());
    sidebar.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu(false)));
    mobile.addEventListener('change', () => closeMenu(false));
    document.addEventListener('keydown', event => {
      if (!open || !mobile.matches) return;
      if (event.key === 'Escape') { event.preventDefault(); closeMenu(); }
      if (event.key === 'Tab') {
        const controls = [...sidebar.querySelectorAll('a[href],button')].filter(e => e.getClientRects().length);
        const first = controls[0], last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    syncMenu();
    document.querySelectorAll('[data-section-link]').forEach(link => link.addEventListener('click', () => {
      document.querySelectorAll('[data-section-link]').forEach(item => item.removeAttribute('aria-current'));
      link.setAttribute('aria-current', 'page');
    }));
  }

  const period = document.getElementById('activity-period');
  if (period) {
    const series = {current: [56, 72, 64, 88, 76, 45, 36], previous: [42, 55, 70, 64, 80, 38, 28]};
    period.addEventListener('change', () => {
      const values = series[period.value];
      document.querySelector('[data-visit-total]').textContent = values.reduce((sum, value) => sum + value, 0);
      document.querySelectorAll('.bp-chart-bar').forEach((bar, index) => {
        bar.style.setProperty('--bar-height', `${values[index]}%`);
        bar.dataset.value = values[index]; bar.querySelector('span').textContent = values[index];
        bar.classList.toggle('is-highlight', values[index] === Math.max(...values));
      });
      const label = period.value === 'current' ? 'this week' : 'last week';
      document.querySelector('.bp-chart').setAttribute('aria-label', `Sample daily gym visits ${label}`);
      document.querySelector('[data-chart-status]').textContent = `Sample activity for ${label}. Keep the momentum going.`;
    });
  }

  const classSearch = document.getElementById('class-search');
  if (classSearch) {
    let filter = 'all';
    const rows = [...document.querySelectorAll('[data-class-category]')];
    const filterButtons = document.querySelectorAll('[data-class-filter]');
    const updateClasses = () => {
      const term = classSearch.value.trim().toLowerCase();
      let visible = 0;
      rows.forEach(row => {
        const matches = (filter === 'all' || row.dataset.classCategory === filter) && row.textContent.toLowerCase().includes(term);
        row.hidden = !matches; if (matches) visible++;
      });
      document.querySelector('.bp-schedule-empty').hidden = visible !== 0;
      document.querySelector('[data-class-count]').textContent = `${visible} sample ${visible === 1 ? 'class' : 'classes'}`;
      filterButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.classFilter === filter)));
    };
    classSearch.addEventListener('input', updateClasses);
    filterButtons.forEach(button => button.addEventListener('click', () => { filter = button.dataset.classFilter; updateClasses(); }));
    document.querySelector('[data-reset-classes]').addEventListener('click', () => { filter = 'all'; classSearch.value = ''; updateClasses(); classSearch.focus(); });
  }
})();
