(() => {
  'use strict';
  const toast = document.querySelector('[data-flash-toast]');
  if (toast) {
    const close = toast.querySelector('[data-toast-dismiss]');
    let timer;
    const dismiss = () => { clearTimeout(timer); toast.hidden = true; };
    const schedule = () => { clearTimeout(timer); timer = setTimeout(dismiss, 5000); };
    close.hidden = false;
    close.addEventListener('click', dismiss);
    toast.addEventListener('pointerenter', () => clearTimeout(timer));
    toast.addEventListener('pointerleave', schedule);
    toast.addEventListener('focusin', () => clearTimeout(timer));
    toast.addEventListener('focusout', event => { if (!toast.contains(event.relatedTarget)) schedule(); });
    schedule();
  }
  const profile = document.querySelector('.fh-profile-menu');
  document.addEventListener('click', event => {
    if (profile?.open && !profile.contains(event.target)) profile.open = false;
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && profile?.open) {
      profile.open = false;
      profile.querySelector('summary').focus();
    }
  });
  const photoInput = document.getElementById('avatar');
  const photoPreview = document.querySelector('[data-avatar-preview] .bp-avatar');
  if (photoInput && photoPreview) {
    const originalPreview = photoPreview.cloneNode(true);
    const status = document.getElementById('avatar-status');
    const removePhoto = document.querySelector('[name="remove_avatar"]');
    let previewUrl;
    const resetPreview = () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl = null;
      photoPreview.replaceChildren(...[...originalPreview.childNodes].map(node => node.cloneNode(true)));
    };
    photoInput.addEventListener('change', () => {
      resetPreview();
      const file = photoInput.files[0];
      if (!file) { status.textContent = ''; return; }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
        photoInput.value = '';
        status.textContent = 'Choose a JPG, PNG or WebP image smaller than 2 MB.';
        return;
      }
      if (removePhoto) removePhoto.checked = false;
      const image = document.createElement('img');
      previewUrl = URL.createObjectURL(file);
      image.src = previewUrl;
      image.alt = '';
      photoPreview.replaceChildren(image);
      status.textContent = `${file.name} selected. Save profile to apply.`;
    });
    removePhoto?.addEventListener('change', () => {
      photoInput.value = '';
      resetPreview();
      if (removePhoto.checked) {
        photoPreview.textContent = Array.from(document.getElementById('name').value.trim())[0] || '';
        status.textContent = 'Photo will be removed when you save your profile.';
      } else { status.textContent = ''; }
    });
    window.addEventListener('pagehide', () => { if (previewUrl) URL.revokeObjectURL(previewUrl); });
  }
  const workouts = {
    running: { label: 'Running', subtitle: 'Beginner Walking Workout', path: 'M0 215 L26 110 L155 110 L255 18 L600 18', value: 140, values: [45,110,110,150,150,150,150] },
    strength: { label: 'Strength', subtitle: 'Build Your Strength, Rep by Rep', path: 'M0 200 L100 155 L200 175 L300 90 L400 110 L500 45 L600 60', value: 105, values: [55,80,70,115,105,145,135] },
    yoga: { label: 'Yoga', subtitle: 'A Little Balance, Every Day', path: 'M0 210 L100 180 L200 155 L300 160 L400 105 L500 80 L600 45', value: 95, values: [45,65,80,75,105,120,140] }
  };
  document.querySelector('[data-plan-type]')?.addEventListener('change', event => {
    const workout = workouts[event.target.value];
    document.querySelector('[data-plan-line]').setAttribute('d', workout.path);
    document.querySelector('[data-plan-area]').setAttribute('d', `${workout.path} L600 230 L0 230Z`);
    document.querySelector('[data-plan-subtitle]').textContent = workout.subtitle;
    document.querySelector('[data-plan-primary]').textContent = workout.label;
    document.querySelector('[data-plan-primary-value]').textContent = workout.value;
    document.querySelector('[data-plan-chart]').setAttribute('aria-label', `Sample ${workout.label.toLowerCase()} plan, Sunday through Saturday: ${workout.values.join(', ')} minutes.`);
    document.querySelector('[data-plan-status]').textContent = `Sample ${workout.label.toLowerCase()} workout selected.`;
  });
  const calories = {
    monthly: [[44,25],[72,54],[60,41],[60,41],[52,33],[66,40],[53,34],[35,16],[59,30],[54,35],[60,41],[68,49]],
    weekly: [[55,30],[65,44],[48,30],[78,52],[60,38],[45,22],[70,45]]
  };
  document.querySelector('[data-calorie-period]')?.addEventListener('change', event => {
    const period = event.target.value, values = calories[period];
    const columns = document.querySelectorAll('.fh-calorie-column');
    document.querySelector('.fh-calorie-bars').style.gridTemplateColumns = `repeat(${values.length}, minmax(0, 1fr))`;
    columns.forEach((column, index) => {
      column.hidden = index >= values.length;
      if (column.hidden) return;
      const bar = column.querySelector('[data-calorie-bar]');
      bar.style.setProperty('--height', `${values[index][0]}%`);
      bar.style.setProperty('--fill', `${values[index][1] / values[index][0] * 100}%`);
      column.querySelector('small').textContent = period === 'weekly' ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][index] : String(index + 1).padStart(2, '0');
    });
    document.querySelector('[data-calorie-chart]').setAttribute('aria-label', `Sample ${period} calorie balance chart; ${values.length} periods, values from minus 80 to 80.`);
    document.querySelector('[data-calorie-status]').textContent = `Showing sample ${period} calorie balance.`;
  });
})();
