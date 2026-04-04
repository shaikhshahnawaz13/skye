import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { owmFetch, geocodeCity, fetchWeatherByCity, fetchWeatherByCoords, fetchNearbyCities } from '../src/js/api.js';

// ─── MOCK FACTORY ────────────────────────────────────────────────────────────

function mockFetch(data, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  });
}

function mockFetchFail(error) {
  return vi.fn().mockRejectedValue(error);
}

const WEATHER_STUB = {
  name: 'Mumbai',
  sys: { country: 'IN', sunrise: 1700000000, sunset: 1700040000 },
  main: { temp: 31.4, feels_like: 34.1, temp_min: 28, temp_max: 34, humidity: 72, pressure: 1010 },
  weather: [{ main: 'Clear', description: 'clear sky' }],
  wind: { speed: 4.2, deg: 220 },
  visibility: 8000,
  clouds: { all: 10 },
  coord: { lat: 19.07, lon: 72.87 },
};

const FORECAST_STUB = {
  list: [
    { dt: 1700000000, main: { temp_max: 35, temp_min: 27 }, weather: [{ main: 'Clear' }] },
    { dt: 1700086400, main: { temp_max: 33, temp_min: 26 }, weather: [{ main: 'Clouds' }] },
  ],
};

const GEO_STUB = [{ lat: 19.07, lon: 72.87, name: 'Mumbai' }];

const FIND_STUB = {
  list: [
    { name: 'Thane', coord: { lat: 19.2, lon: 72.97 }, main: { temp: 30 }, weather: [{ main: 'Clear' }] },
    { name: 'Navi Mumbai', coord: { lat: 19.04, lon: 73.01 }, main: { temp: 29 }, weather: [{ main: 'Clouds' }] },
  ],
};

// ─── owmFetch ────────────────────────────────────────────────────────────────

describe('owmFetch', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('returns JSON on direct 200 response', async () => {
    global.fetch = mockFetch(WEATHER_STUB, 200);
    const result = await owmFetch('weather?q=Mumbai&units=metric&appid=test');
    expect(result.name).toBe('Mumbai');
  });

  it('throws API_KEY on 401', async () => {
    global.fetch = mockFetch({}, 401);
    await expect(owmFetch('weather?q=x&appid=bad')).rejects.toThrow('API_KEY');
  });

  it('throws NOT_FOUND on 404', async () => {
    global.fetch = mockFetch({}, 404);
    await expect(owmFetch('weather?q=zzz&appid=test')).rejects.toThrow('NOT_FOUND');
  });

  it('falls through to allorigins proxy on network failure and returns data', async () => {
    let call = 0;
    global.fetch = vi.fn().mockImplementation((url) => {
      call++;
      // First call (direct) fails; second call (allorigins) succeeds
      if (call === 1) return Promise.reject(new Error('Failed to fetch'));
      if (call === 2) return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ contents: JSON.stringify(WEATHER_STUB) }),
      });
      return Promise.reject(new Error('unexpected'));
    });
    const result = await owmFetch('weather?q=Mumbai&units=metric&appid=test');
    expect(result.name).toBe('Mumbai');
  });

  it('throws NETWORK when all three proxies fail', async () => {
    global.fetch = mockFetchFail(new Error('Failed to fetch'));
    await expect(owmFetch('weather?q=x&appid=test')).rejects.toThrow('NETWORK');
  });
});

// ─── geocodeCity ─────────────────────────────────────────────────────────────

describe('geocodeCity', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('returns lat/lon for a known city', async () => {
    global.fetch = mockFetch(GEO_STUB, 200);
    const coords = await geocodeCity('Mumbai');
    expect(coords).toEqual({ lat: 19.07, lon: 72.87 });
  });

  it('returns null for an empty geocoding result', async () => {
    global.fetch = mockFetch([], 200);
    const coords = await geocodeCity('zzzzz');
    expect(coords).toBeNull();
  });

  it('returns null on network error', async () => {
    global.fetch = mockFetchFail(new Error('timeout'));
    const coords = await geocodeCity('Mumbai');
    expect(coords).toBeNull();
  });

  it('returns null on non-ok response', async () => {
    global.fetch = mockFetch({}, 500);
    const coords = await geocodeCity('Mumbai');
    expect(coords).toBeNull();
  });
});

// ─── fetchWeatherByCity ───────────────────────────────────────────────────────

describe('fetchWeatherByCity', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('geocodes then fetches by coords when geocoding succeeds', async () => {
    // Capture data at invocation time (not inside json callback) to avoid
    // closure race: Promise.all fires both fetches before either .json() runs,
    // so a reference to `call` inside json() sees the final incremented value.
    let call = 0;
    const responses = [GEO_STUB, WEATHER_STUB, FORECAST_STUB];
    global.fetch = vi.fn().mockImplementation(() => {
      const data = responses[call++] ?? FORECAST_STUB;
      return Promise.resolve({ ok: true, status: 200, json: async () => data });
    });
    const { weather, forecast } = await fetchWeatherByCity('Mumbai');
    expect(weather.name).toBe('Mumbai');
    expect(forecast.list).toHaveLength(2);
  });

  it('falls back to name-based query when geocoding returns null', async () => {
    let call = 0;
    const responses = [[], WEATHER_STUB, FORECAST_STUB]; // [] → geocode returns empty
    global.fetch = vi.fn().mockImplementation(() => {
      const data = responses[call++] ?? FORECAST_STUB;
      return Promise.resolve({ ok: true, status: 200, json: async () => data });
    });
    const { weather } = await fetchWeatherByCity('Mumbai');
    expect(weather.name).toBe('Mumbai');
  });

  it('propagates NOT_FOUND when city does not exist', async () => {
    global.fetch = mockFetch({}, 404);
    await expect(fetchWeatherByCity('zzzzz')).rejects.toThrow('NOT_FOUND');
  });
});

// ─── fetchWeatherByCoords ─────────────────────────────────────────────────────

describe('fetchWeatherByCoords', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('fetches weather and forecast in parallel', async () => {
    // Capture data at invocation time — same closure race as above
    let call = 0;
    const responses = [WEATHER_STUB, FORECAST_STUB];
    global.fetch = vi.fn().mockImplementation(() => {
      const data = responses[call++] ?? FORECAST_STUB;
      return Promise.resolve({ ok: true, status: 200, json: async () => data });
    });
    const { weather, forecast } = await fetchWeatherByCoords(19.07, 72.87);
    expect(weather.coord.lat).toBe(19.07);
    expect(forecast.list).toBeDefined();
  });
});

// ─── fetchNearbyCities ────────────────────────────────────────────────────────

describe('fetchNearbyCities', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('returns list of nearby cities', async () => {
    global.fetch = mockFetch(FIND_STUB, 200);
    const cities = await fetchNearbyCities(19.07, 72.87);
    expect(cities).toHaveLength(2);
    expect(cities[0].name).toBe('Thane');
  });

  it('returns empty array on network failure', async () => {
    global.fetch = mockFetchFail(new Error('timeout'));
    const cities = await fetchNearbyCities(19.07, 72.87);
    expect(cities).toEqual([]);
  });

  it('returns empty array when list is missing from response', async () => {
    global.fetch = mockFetch({}, 200);
    const cities = await fetchNearbyCities(19.07, 72.87);
    expect(cities).toEqual([]);
  });
});
