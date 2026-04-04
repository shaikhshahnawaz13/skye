import { WX_CLASS_MAP } from './config.js';

let _manualOverride = false;

/** Returns true if current local time is between 20:00–05:59 */
export function isNightTime() {
  const h = new Date().getHours();
  return h >= 20 || h < 6;
}

/** Apply dark/light body classes. Pass forceDark/forceLight to override auto. */
export function applyTimeClasses(forceDark = false, forceLight = false) {
  document.body.classList.remove('dark', 'time-day');
  if (forceDark || (!forceLight && isNightTime())) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.add('time-day');
  }
  updateToggleIcon();
}

/** Sync the dark-mode toggle button icon */
export function updateToggleIcon() {
  const isDark = document.body.classList.contains('dark');
  const btn = document.getElementById('darkToggle');
  if (!btn) return;
  btn.innerHTML = isDark
    ? '<i data-lucide="sun" style="width:15px;height:15px;"></i>'
    : '<i data-lucide="moon" style="width:15px;height:15px;"></i>';
  if (window.lucide) lucide.createIcons();
}

/** Apply weather-based accent class */
export function applyWeatherTheme(condition) {
  const wxClass = 'wx-' + (WX_CLASS_MAP[condition] ?? 'clear');
  const body = document.body;
  // Remove old wx-* classes
  Array.from(body.classList)
    .filter(c => c.startsWith('wx-'))
    .forEach(c => body.classList.remove(c));
  body.classList.add(wxClass);
  if (!body.classList.contains('dark') && !body.classList.contains('time-day')) {
    applyTimeClasses();
  }
}

/** Called by dark mode toggle button */
export function toggleDark() {
  _manualOverride = true;
  const isDark = document.body.classList.contains('dark');
  applyTimeClasses(!isDark, isDark);
  sessionStorage.setItem('skye-mode', isDark ? 'day' : 'night');
}

/** Poll every 60s and auto-switch if user hasn't manually toggled */
export function scheduleAutoTheme() {
  setInterval(() => {
    if (_manualOverride) return;
    const shouldBeDark = isNightTime();
    const isDark = document.body.classList.contains('dark');
    if (shouldBeDark !== isDark) applyTimeClasses();
  }, 60_000);
}

/** Air quality descriptor from humidity (proxy) */
export function aqFromHumidity(h) {
  if (h < 45) return { label: 'Excellent', color: '#2dc96a' };
  if (h < 65) return { label: 'Good',      color: '#6abf4a' };
  if (h < 80) return { label: 'Moderate',  color: '#e8c030' };
  return          { label: 'Poor',         color: '#e06040' };
}
