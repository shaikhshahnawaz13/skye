import { describe, it, expect, vi, beforeEach } from 'vitest';
import { animateCounter, windDirection, formatTime, weatherIcon } from '../src/js/weather.js';

// ─── animateCounter ───────────────────────────────────────────────────────────

describe('animateCounter', () => {
  it('sets textContent to target value after animation completes', () => {
    // vi.useFakeTimers() doesn't fake performance.now(), so the rAF-based
    // animation gets mismatched timestamps. Instead mock rAF directly:
    // capture t0 from the real performance.now() then immediately invoke the
    // callback with t0 + 1000ms so the easing function reaches p=1 (done).
    let rafCallback = null;
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
      rafCallback = cb;
      return 0;
    });

    const el = document.createElement('span');
    const t0 = performance.now();
    animateCounter(el, 37);

    // Fire the pending rAF callback with t0 + 1000ms (well past 820ms duration)
    if (rafCallback) rafCallback(t0 + 1000);

    expect(Number(el.textContent)).toBe(37);
    rafSpy.mockRestore();
  });

  it('sets textContent to 0 when target is 0', async () => {
    vi.useFakeTimers();
    const el = document.createElement('span');
    animateCounter(el, 0);
    await vi.advanceTimersByTimeAsync(1000);
    expect(Number(el.textContent)).toBe(0);
    vi.useRealTimers();
  });
});

// ─── windDirection ────────────────────────────────────────────────────────────

describe('windDirection', () => {
  const cases = [
    [0,   'N'],
    [45,  'NE'],
    [90,  'E'],
    [135, 'SE'],
    [180, 'S'],
    [225, 'SW'],
    [270, 'W'],
    [315, 'NW'],
    [360, 'N'],   // wraps back to N
  ];

  cases.forEach(([deg, expected]) => {
    it(`${deg}° → ${expected}`, () => {
      expect(windDirection(deg)).toBe(expected);
    });
  });

  it('defaults to N when deg is null/undefined', () => {
    expect(windDirection(null)).toBe('N');
    expect(windDirection(undefined)).toBe('N');
  });
});

// ─── formatTime ──────────────────────────────────────────────────────────────

describe('formatTime', () => {
  it('returns a non-empty time string', () => {
    const result = formatTime(1700000000);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('contains AM or PM', () => {
    const result = formatTime(1700000000);
    expect(result).toMatch(/AM|PM/);
  });

  it('contains a colon', () => {
    expect(formatTime(1700000000)).toContain(':');
  });
});

// ─── weatherIcon ─────────────────────────────────────────────────────────────

describe('weatherIcon', () => {
  it('returns an <i> tag string', () => {
    const result = weatherIcon('Clear');
    expect(result).toContain('<i data-lucide=');
    expect(result).toContain('</i>');
  });

  it('uses sun icon for Clear', () => {
    expect(weatherIcon('Clear')).toContain('"sun"');
  });

  it('uses cloud-rain icon for Rain', () => {
    expect(weatherIcon('Rain')).toContain('"cloud-rain"');
  });

  it('uses cloud-lightning icon for Thunderstorm', () => {
    expect(weatherIcon('Thunderstorm')).toContain('"cloud-lightning"');
  });

  it('uses wind icon for Mist, Fog, Haze', () => {
    ['Mist', 'Fog', 'Haze'].forEach(c => {
      expect(weatherIcon(c)).toContain('"wind"');
    });
  });

  it('falls back to cloud icon for unknown condition', () => {
    expect(weatherIcon('Tornado')).toContain('"cloud"');
  });

  it('applies custom size', () => {
    const result = weatherIcon('Clear', 32);
    expect(result).toContain('width:32px');
    expect(result).toContain('height:32px');
  });

  it('defaults to 20px size', () => {
    const result = weatherIcon('Clear');
    expect(result).toContain('width:20px');
  });
});
