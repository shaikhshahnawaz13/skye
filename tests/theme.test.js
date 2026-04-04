import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isNightTime, applyTimeClasses, applyWeatherTheme, aqFromHumidity } from '../src/js/theme.js';

// ─── isNightTime ──────────────────────────────────────────────────────────────

describe('isNightTime', () => {
  afterEach(() => { vi.useRealTimers(); });

  it('returns true at 21:00', () => {
    vi.setSystemTime(new Date('2025-01-01T21:00:00'));
    expect(isNightTime()).toBe(true);
  });

  it('returns true at 03:00', () => {
    vi.setSystemTime(new Date('2025-01-01T03:00:00'));
    expect(isNightTime()).toBe(true);
  });

  it('returns false at 06:00', () => {
    vi.setSystemTime(new Date('2025-01-01T06:00:00'));
    expect(isNightTime()).toBe(false);
  });

  it('returns false at 14:00', () => {
    vi.setSystemTime(new Date('2025-01-01T14:00:00'));
    expect(isNightTime()).toBe(false);
  });

  it('returns false at 19:59', () => {
    vi.setSystemTime(new Date('2025-01-01T19:59:00'));
    expect(isNightTime()).toBe(false);
  });

  it('returns true at 20:00 exactly', () => {
    vi.setSystemTime(new Date('2025-01-01T20:00:00'));
    expect(isNightTime()).toBe(true);
  });
});

// ─── applyTimeClasses ─────────────────────────────────────────────────────────

describe('applyTimeClasses', () => {
  beforeEach(() => {
    document.body.className = '';
    // Stub updateToggleIcon's getElementById
    document.body.innerHTML = '<button id="darkToggle"></button>';
  });

  it('adds dark class when forceDark=true regardless of time', () => {
    vi.setSystemTime(new Date('2025-01-01T12:00:00'));
    applyTimeClasses(true, false);
    expect(document.body.classList.contains('dark')).toBe(true);
    expect(document.body.classList.contains('time-day')).toBe(false);
  });

  it('adds time-day class when forceLight=true regardless of time', () => {
    vi.setSystemTime(new Date('2025-01-01T22:00:00'));
    applyTimeClasses(false, true);
    expect(document.body.classList.contains('time-day')).toBe(true);
    expect(document.body.classList.contains('dark')).toBe(false);
  });

  it('auto-detects dark at night (20:00)', () => {
    vi.setSystemTime(new Date('2025-01-01T20:30:00'));
    applyTimeClasses();
    expect(document.body.classList.contains('dark')).toBe(true);
  });

  it('auto-detects light during day (10:00)', () => {
    vi.setSystemTime(new Date('2025-01-01T10:00:00'));
    applyTimeClasses();
    expect(document.body.classList.contains('time-day')).toBe(true);
  });

  it('removes previous dark/time-day before applying new class', () => {
    document.body.classList.add('dark', 'time-day');
    vi.setSystemTime(new Date('2025-01-01T10:00:00'));
    applyTimeClasses();
    expect(document.body.classList.contains('dark')).toBe(false);
  });
});

// ─── applyWeatherTheme ────────────────────────────────────────────────────────

describe('applyWeatherTheme', () => {
  beforeEach(() => {
    document.body.className = 'time-day';
    document.body.innerHTML = '<button id="darkToggle"></button>';
  });

  it('adds wx-clear for Clear condition', () => {
    applyWeatherTheme('Clear');
    expect(document.body.classList.contains('wx-clear')).toBe(true);
  });

  it('adds wx-rain for Rain condition', () => {
    applyWeatherTheme('Rain');
    expect(document.body.classList.contains('wx-rain')).toBe(true);
  });

  it('adds wx-rain for Drizzle condition', () => {
    applyWeatherTheme('Drizzle');
    expect(document.body.classList.contains('wx-rain')).toBe(true);
  });

  it('adds wx-mist for Haze condition', () => {
    applyWeatherTheme('Haze');
    expect(document.body.classList.contains('wx-mist')).toBe(true);
  });

  it('adds wx-clear as default for unknown condition', () => {
    applyWeatherTheme('Tornado');
    expect(document.body.classList.contains('wx-clear')).toBe(true);
  });

  it('removes previous wx-* class before adding new one', () => {
    document.body.classList.add('wx-snow');
    applyWeatherTheme('Clear');
    expect(document.body.classList.contains('wx-snow')).toBe(false);
    expect(document.body.classList.contains('wx-clear')).toBe(true);
  });
});

// ─── aqFromHumidity ───────────────────────────────────────────────────────────

describe('aqFromHumidity', () => {
  it('returns Excellent for humidity < 45', () => {
    expect(aqFromHumidity(40).label).toBe('Excellent');
  });

  it('returns Good for humidity 45–64', () => {
    expect(aqFromHumidity(60).label).toBe('Good');
  });

  it('returns Moderate for humidity 65–79', () => {
    expect(aqFromHumidity(72).label).toBe('Moderate');
  });

  it('returns Poor for humidity >= 80', () => {
    expect(aqFromHumidity(85).label).toBe('Poor');
  });

  it('returns a color string for each level', () => {
    [30, 55, 70, 90].forEach(h => {
      const { color } = aqFromHumidity(h);
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  it('boundary: 44 is Excellent, 45 is Good', () => {
    expect(aqFromHumidity(44).label).toBe('Excellent');
    expect(aqFromHumidity(45).label).toBe('Good');
  });

  it('boundary: 79 is Moderate, 80 is Poor', () => {
    expect(aqFromHumidity(79).label).toBe('Moderate');
    expect(aqFromHumidity(80).label).toBe('Poor');
  });
});
