(() => {
  'use strict';

  // History snapshots can bypass HTTP cache headers. Recheck the session on restore.
  window.addEventListener('pagehide', event => {
    if (event.persisted) document.documentElement.style.visibility = 'hidden';
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) window.location.reload();
  });
})();
