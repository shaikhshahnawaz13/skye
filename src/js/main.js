import { fetchWeatherByCity, fetchWeatherByCoords } from './api.js';
import { applyTimeClasses, scheduleAutoTheme, toggleDark } from './theme.js';
import { paint } from './weather.js';
import { initCursor, initClock, setSpin, showToast } from './ui.js';

// ─── SEARCH HANDLERS ─────────────────────────────────────────────────────────

export async function search(city) {
  setSpin(true);
  try {
    const { weather, forecast } = await fetchWeatherByCity(city);
    localStorage.setItem('skye', city);
    document.getElementById('tbInp').value = city;
    paint(weather, forecast);
    document.getElementById('initOv').classList.add('gone');
  } catch (e) {
    const messages = {
      API_KEY : '⚠ API key not active — wait 10 min after signup.',
      NOT_FOUND: `City not found. Try "Mumbai".`,
      NETWORK  : 'Network error. Check your connection.',
    };
    showToast(messages[e.message] ?? 'Something went wrong.');
  } finally {
    setSpin(false);
  }
}

export async function searchCoords(lat, lon) {
  setSpin(true);
  try {
    const { weather, forecast } = await fetchWeatherByCoords(lat, lon);
    document.getElementById('tbInp').value = weather.name;
    localStorage.setItem('skye', weather.name);
    paint(weather, forecast);
    document.getElementById('initOv').classList.add('gone');
  } catch {
    showToast('Location error.');
  } finally {
    setSpin(false);
  }
}

function go(inputId) {
  const v = document.getElementById(inputId)?.value.trim();
  if (v) search(v);
  else showToast('Enter a city name.');
}

function geoGo() {
  if (!navigator.geolocation) return showToast('Geolocation not supported.');
  navigator.geolocation.getCurrentPosition(
    p => searchCoords(p.coords.latitude, p.coords.longitude),
    () => showToast('Location denied.'),
  );
}

// ─── BOOT ────────────────────────────────────────────────────────────────────

function init() {
  // UI subsystems
  initCursor();
  initClock();

  // Time-based theme + auto-switch
  applyTimeClasses();
  scheduleAutoTheme();

  // Wire event handlers
  document.getElementById('iGo').addEventListener('click', () => go('iInp'));
  document.getElementById('iInp').addEventListener('keydown', e => { if (e.key === 'Enter') go('iInp'); });
  document.getElementById('iGeo').addEventListener('click', geoGo);

  document.getElementById('tbGo').addEventListener('click', () => go('tbInp'));
  document.getElementById('tbInp').addEventListener('keydown', e => { if (e.key === 'Enter') go('tbInp'); });
  document.getElementById('tbGeo').addEventListener('click', geoGo);

  document.getElementById('darkToggle').addEventListener('click', toggleDark);

  // Inputs keep default text cursor
  document.querySelectorAll('input').forEach(el => (el.style.cursor = 'text'));

  // Nearby city card click event (dispatched from weather.js to avoid circular deps)
  document.addEventListener('skye:selectCity', e => {
    const { name, lat, lon } = e.detail;
    document.getElementById('tbInp').value = name;
    searchCoords(lat, lon);
  });

  // Initial Lucide icon render
  if (window.lucide) lucide.createIcons();
  window.addEventListener('load', () => { if (window.lucide) lucide.createIcons(); });

  // Restore last city from localStorage
  const last = localStorage.getItem('skye');
  if (last) {
    document.getElementById('iInp').value = last;
    search(last);
  }
}

init();
