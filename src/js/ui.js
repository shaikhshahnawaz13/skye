// ─── CUSTOM CURSOR ───────────────────────────────────────────────────────────
export function initCursor() {
  const dot  = document.getElementById('cur');
  const ring = document.getElementById('cur2');
  if (!dot || !ring) return;

  let rx = 0, ry = 0;

  addEventListener('mousemove', e => {
    dot.style.left = e.clientX + 'px';
    dot.style.top  = e.clientY + 'px';
  });

  (function loop() {
    rx += (parseFloat(dot.style.left || 0) - rx) * 0.13;
    ry += (parseFloat(dot.style.top  || 0) - ry) * 0.13;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();

  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => { dot.classList.add('big'); ring.classList.add('xl'); });
    el.addEventListener('mouseleave', () => { dot.classList.remove('big'); ring.classList.remove('xl'); });
  });
}

// ─── CLOCK ───────────────────────────────────────────────────────────────────
export function initClock() {
  function tick() {
    const d  = new Date();
    const h  = String(d.getHours() % 12 || 12).padStart(2, '0');
    const m  = String(d.getMinutes()).padStart(2, '0');
    const ap = d.getHours() >= 12 ? 'PM' : 'AM';
    const hmEl = document.getElementById('tHm');
    const dtEl = document.getElementById('tDt');
    if (hmEl) hmEl.textContent = `${h}:${m} ${ap}`;
    if (dtEl) dtEl.textContent = d.toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });
    setTimeout(tick, 1000);
  }
  tick();
}

// ─── SPINNER ─────────────────────────────────────────────────────────────────
export function setSpin(visible) {
  ['iSpin', 'tSpin'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = visible ? 'block' : 'none';
  });
}

// ─── TOAST ───────────────────────────────────────────────────────────────────
export function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.style.display = 'block';
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => { t.style.display = 'none'; }, 5500);
}
