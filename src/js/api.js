import { OWM_BASE, OWM_GEO, OWM_KEY } from './config.js';

/**
 * Fetch from OWM with CORS-proxy fallbacks.
 * Throws 'API_KEY' | 'NOT_FOUND' | 'NETWORK' on failure.
 * @param {string} endpoint - path + query (e.g. "weather?lat=...&appid=...")
 * @returns {Promise<object>}
 */
export async function owmFetch(endpoint) {
  const url = `${OWM_BASE}/${endpoint}`;
  const checkStatus = (s) => {
    if (s === 401) throw new Error('API_KEY');
    if (s === 404) throw new Error('NOT_FOUND');
  };

  // 1. Direct fetch
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(5000) });
    checkStatus(r.status);
    if (r.ok) return await r.json();
  } catch (e) {
    if (['API_KEY', 'NOT_FOUND'].includes(e.message)) throw e;
  }

  // 2. allorigins.win proxy
  try {
    const r = await fetch(
      `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
      { signal: AbortSignal.timeout(9000) }
    );
    if (r.ok) {
      const w = await r.json();
      const d = JSON.parse(w.contents);
      if (d.cod === 401 || d.cod === '401') throw new Error('API_KEY');
      if (d.cod === '404' || d.cod === 404) throw new Error('NOT_FOUND');
      return d;
    }
  } catch (e) {
    if (['API_KEY', 'NOT_FOUND'].includes(e.message)) throw e;
  }

  // 3. corsproxy.io
  try {
    const r = await fetch(
      `https://corsproxy.io/?${encodeURIComponent(url)}`,
      { signal: AbortSignal.timeout(9000) }
    );
    checkStatus(r.status);
    if (r.ok) return await r.json();
  } catch (e) {
    if (['API_KEY', 'NOT_FOUND'].includes(e.message)) throw e;
  }

  throw new Error('NETWORK');
}

/**
 * Geocode a city name → { lat, lon } using OWM Geocoding API.
 * Returns null on failure (caller falls back to name-based search).
 * @param {string} city
 * @returns {Promise<{lat: number, lon: number}|null>}
 */
export async function geocodeCity(city) {
  try {
    const url = `${OWM_GEO}/direct?q=${encodeURIComponent(city)}&limit=1&appid=${OWM_KEY}`;
    const r = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!r.ok) return null;
    const data = await r.json();
    if (data && data.length > 0) return { lat: data[0].lat, lon: data[0].lon };
  } catch {
    // silently fail — caller uses name-based fallback
  }
  return null;
}

/**
 * Fetch current weather + 5-day forecast for a city by name.
 * Geocodes first for coordinate-based accuracy; falls back to name query.
 * @param {string} city
 * @returns {Promise<{weather: object, forecast: object}>}
 */
export async function fetchWeatherByCity(city) {
  const coords = await geocodeCity(city);

  if (coords) {
    const { lat, lon } = coords;
    const [weather, forecast] = await Promise.all([
      owmFetch(`weather?lat=${lat}&lon=${lon}&units=metric&appid=${OWM_KEY}`),
      owmFetch(`forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OWM_KEY}`),
    ]);
    return { weather, forecast };
  }

  // Fallback: name-based query
  const [weather, forecast] = await Promise.all([
    owmFetch(`weather?q=${encodeURIComponent(city)}&units=metric&appid=${OWM_KEY}`),
    owmFetch(`forecast?q=${encodeURIComponent(city)}&units=metric&appid=${OWM_KEY}`),
  ]);
  return { weather, forecast };
}

/**
 * Fetch current weather + 5-day forecast by coordinates.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<{weather: object, forecast: object}>}
 */
export async function fetchWeatherByCoords(lat, lon) {
  const [weather, forecast] = await Promise.all([
    owmFetch(`weather?lat=${lat}&lon=${lon}&units=metric&appid=${OWM_KEY}`),
    owmFetch(`forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OWM_KEY}`),
  ]);
  return { weather, forecast };
}

/**
 * Fetch nearby cities using OWM /find endpoint.
 * Returns [] on failure (caller uses fallback list).
 * @param {number} lat
 * @param {number} lon
 * @param {number} count
 * @returns {Promise<object[]>}
 */
export async function fetchNearbyCities(lat, lon, count = 8) {
  try {
    const data = await owmFetch(
      `find?lat=${lat}&lon=${lon}&cnt=${count}&units=metric&appid=${OWM_KEY}`
    );
    return data?.list ?? [];
  } catch {
    return [];
  }
}
