import { DAYS, WX_ICON_MAP, FALLBACK_CITIES, OWM_KEY } from './config.js';
import { fetchNearbyCities, owmFetch } from './api.js';
import { applyWeatherTheme, aqFromHumidity } from './theme.js';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/** Animated counter from 0 → target value */
export function animateCounter(el, to) {
  const t0 = performance.now();
  const DURATION = 820;
  (function step(now) {
    const p = Math.min((now - t0) / DURATION, 1);
    el.textContent = Math.round(to * (1 - (1 - p) ** 3));
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}

/** Return wind direction string from degrees */
export function windDirection(deg) {
  return ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round((deg ?? 0) / 45) % 8];
}

/** Format unix timestamp as HH:MM AM/PM */
export function formatTime(unix) {
  return new Date(unix * 1000).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  });
}

/** Return Lucide icon <i> tag for a weather condition */
export function weatherIcon(condition, size = 20) {
  const name = WX_ICON_MAP[condition] ?? 'cloud';
  return `<i data-lucide="${name}" style="width:${size}px;height:${size}px;"></i>`;
}

/** Re-render all Lucide icons on the page */
export function refreshIcons() {
  if (window.lucide) lucide.createIcons();
}

// ─── WAVE GRAPH ──────────────────────────────────────────────────────────────

/**
 * Draw the temperature wave chart on the canvas.
 * @param {{ hi: number, lo: number }[]} data
 */
export function drawWave(data) {
  const cv = document.getElementById('waveC');
  if (!cv || !data || data.length < 2) return;

  const pr = devicePixelRatio || 1;
  const W = cv.offsetWidth;
  const H = 44;
  cv.width  = W * pr;
  cv.height = H * pr;

  const ctx = cv.getContext('2d');
  ctx.scale(pr, pr);

  const his = data.map(d => d.hi);
  const los = data.map(d => d.lo);
  const all = [...his, ...los];
  const mn  = Math.min(...all) - 2;
  const mx  = Math.max(...all) + 2;

  const ty = t => H - 5 - ((t - mn) / (mx - mn)) * (H - 10);
  const tx = i => (i / (data.length - 1)) * (W - 2) + 1;

  const accent = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#4a90d9';
  const t3     = getComputedStyle(document.body).getPropertyValue('--t3').trim()     || '#8aa0b8';

  function drawLine(pts, color, width, fill) {
    ctx.beginPath();
    pts.forEach((p, i) => {
      if (i === 0) {
        ctx.moveTo(tx(i), ty(p));
      } else {
        const cx = (tx(i - 1) + tx(i)) / 2;
        ctx.bezierCurveTo(cx, ty(pts[i - 1]), cx, ty(p), tx(i), ty(p));
      }
    });
    if (fill) {
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
      ctx.fillStyle = fill; ctx.fill();
    }
    ctx.strokeStyle = color; ctx.lineWidth = width;
    ctx.lineJoin = 'round'; ctx.stroke();
  }

  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, accent + '55');
  grad.addColorStop(1, accent + '08');

  drawLine(his, accent, 1.8, grad);
  drawLine(los, t3, 1, null);
}

// ─── PAINT ───────────────────────────────────────────────────────────────────

/**
 * Populate the entire UI with weather + forecast data.
 * @param {object} w - OWM current weather response
 * @param {object} f - OWM 5-day forecast response
 */
export function paint(w, f) {
  applyWeatherTheme(w.weather[0].main);

  // Left card
  document.getElementById('wxCity').textContent  = w.name;
  document.getElementById('wxCC').textContent    = w.sys.country;
  document.getElementById('wxWhen').textContent  =
    new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) +
    ' · ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  animateCounter(document.getElementById('wxTmp'), Math.round(w.main.temp));
  document.getElementById('wxIcoWrap').innerHTML = weatherIcon(w.weather[0].main);
  document.getElementById('wxDesc').textContent  = w.weather[0].description;
  document.getElementById('wxFeels').textContent = `Feels like ${Math.round(w.main.feels_like)}°C`;
  document.getElementById('chH').textContent     = w.main.humidity + '%';
  document.getElementById('chW').textContent     = Math.round(w.wind.speed * 3.6) + ' km/h';
  document.getElementById('chV').textContent     = (w.visibility / 1000).toFixed(1) + ' km';
  document.getElementById('chP').textContent     = w.main.pressure + ' hPa';
  document.getElementById('mmMin').textContent   = Math.round(w.main.temp_min) + '°';
  document.getElementById('mmFl').textContent    = Math.round(w.main.feels_like) + '°';
  document.getElementById('mmMax').textContent   = Math.round(w.main.temp_max) + '°';

  // Center orb
  animateCounter(document.getElementById('ccTmp'), Math.round(w.main.temp));
  document.getElementById('ccLabel').textContent    = w.weather[0].description.toUpperCase();
  document.getElementById('gaugeVal').textContent   = w.main.humidity + '%';
  document.getElementById('gaugeFill').style.width  = w.main.humidity + '%';
  document.getElementById('csSr').textContent       = formatTime(w.sys.sunrise);
  document.getElementById('csSs').textContent       = formatTime(w.sys.sunset);
  document.getElementById('ccWnd').textContent      = Math.round(w.wind.speed * 3.6) + ' km/h';
  document.getElementById('ccDir').textContent      = windDirection(w.wind.deg);
  document.getElementById('ccPrs').textContent      = w.main.pressure;

  // Right card — air quality + details
  const aq = aqFromHumidity(w.main.humidity);
  document.getElementById('aqVal').textContent    = aq.label;
  document.getElementById('aqDot').style.cssText  = `background:${aq.color};box-shadow:0 0 8px ${aq.color}`;
  document.getElementById('diVis').textContent    = (w.visibility / 1000).toFixed(1);
  document.getElementById('diCld').textContent    = w.clouds?.all ?? '—';

  loadNearby(w.name, w.coord.lat, w.coord.lon);

  // Forecast card
  if (f) paintForecast(f);

  document.getElementById('appShell').style.display = 'flex';
  setTimeout(refreshIcons, 50);
}

// ─── FORECAST ────────────────────────────────────────────────────────────────

function paintForecast(f) {
  const map = {};
  f.list.forEach(it => {
    const d = new Date(it.dt * 1000);
    const k = d.toDateString();
    if (!map[k]) map[k] = { day: DAYS[d.getDay()], hi: [], lo: [], main: it.weather[0].main };
    map[k].hi.push(it.main.temp_max);
    map[k].lo.push(it.main.temp_min);
  });

  const days = Object.values(map).slice(0, 5);
  const fcRow = document.getElementById('fcRow');
  fcRow.innerHTML = '';

  days.forEach(d => {
    const hi = Math.round(Math.max(...d.hi));
    const lo = Math.round(Math.min(...d.lo));
    const el = document.createElement('div');
    el.className = 'fc-item';
    el.innerHTML = `
      <div class="fc-day">${d.day}</div>
      <div class="fc-ico-wrap" style="color:var(--accent);">${weatherIcon(d.main)}</div>
      <div class="fc-hi">${hi}°</div>
      <div class="fc-lo">${lo}°</div>
    `;
    fcRow.appendChild(el);
  });

  // Wave graph
  const allDays = Object.values(map).slice(0, 7);
  const waveData = allDays.map(d => ({
    hi: Math.round(Math.max(...d.hi)),
    lo: Math.round(Math.min(...d.lo)),
    day: d.day,
  }));

  const wdEl = document.getElementById('waveDays');
  wdEl.innerHTML = '';
  waveData.forEach(d => {
    const el = document.createElement('div');
    el.className = 'wd';
    el.innerHTML = `<div class="wd-hi">${d.hi}°</div><div class="wd-lo">${d.lo}°</div>`;
    wdEl.appendChild(el);
  });

  setTimeout(() => drawWave(waveData), 80);
}

// ─── NEARBY CITIES ───────────────────────────────────────────────────────────

/**
 * Load and render nearby city cards.
 * Uses OWM /find for real nearby cities; falls back to FALLBACK_CITIES.
 * Each card is clickable and triggers a new search.
 * @param {string} currentCity
 * @param {number|null} lat
 * @param {number|null} lon
 */
export async function loadNearby(currentCity, lat = null, lon = null) {
  const list = document.getElementById('cityList');
  list.innerHTML = '<div class="nci"><span class="nci-name" style="color:var(--t3)">Loading...</span></div>';

  let weatherList = [];

  if (lat !== null && lon !== null) {
    const found = await fetchNearbyCities(lat, lon, 8);
    weatherList = found
      .filter(c => c.name.toLowerCase() !== currentCity.toLowerCase())
      .slice(0, 4);
  }

  // Fallback to hardcoded cities
  if (!weatherList.length) {
    const cities = FALLBACK_CITIES
      .filter(c => c.toLowerCase() !== currentCity.toLowerCase())
      .slice(0, 4);
    const results = await Promise.all(
      cities.map(async c => {
        try { return await owmFetch(`weather?q=${c}&units=metric&appid=${OWM_KEY}`); }
        catch { return null; }
      })
    );
    weatherList = results.filter(Boolean);
  }

  list.innerHTML = '';
  weatherList.forEach(w => {
    if (!w) return;
    const el = document.createElement('div');
    el.className = 'nci';
    el.style.cursor = 'pointer';
    el.innerHTML = `
      <span class="nci-name">${w.name}</span>
      <span class="nci-tmp">${Math.round(w.main.temp)}°</span>
      <span class="nci-ico" style="color:var(--accent);display:flex;align-items:center;">
        ${weatherIcon(w.weather[0].main)}
      </span>
    `;
    el.addEventListener('click', () => {
      // Dispatch custom event — main.js handles it to avoid circular deps
      document.dispatchEvent(new CustomEvent('skye:selectCity', {
        detail: { name: w.name, lat: w.coord.lat, lon: w.coord.lon },
      }));
    });
    list.appendChild(el);
  });

  setTimeout(refreshIcons, 50);
}
