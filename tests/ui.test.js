import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setSpin, showToast, initClock } from '../src/js/ui.js';

// ─── setSpin ─────────────────────────────────────────────────────────────────

describe('setSpin', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="ispin" id="iSpin" style="display:none;"></div>
      <div class="tspin" id="tSpin" style="display:none;"></div>
    `;
  });

  it('shows spinners when visible=true', () => {
    setSpin(true);
    expect(document.getElementById('iSpin').style.display).toBe('block');
    expect(document.getElementById('tSpin').style.display).toBe('block');
  });

  it('hides spinners when visible=false', () => {
    setSpin(true);
    setSpin(false);
    expect(document.getElementById('iSpin').style.display).toBe('none');
    expect(document.getElementById('tSpin').style.display).toBe('none');
  });

  it('does not throw when spinner elements are missing', () => {
    document.body.innerHTML = '';
    expect(() => setSpin(true)).not.toThrow();
  });
});

// ─── showToast ───────────────────────────────────────────────────────────────

describe('showToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '<div class="toast" id="toast" style="display:none;"></div>';
  });

  afterEach(() => { vi.useRealTimers(); });

  it('sets toast text and shows it', () => {
    showToast('City not found.');
    const t = document.getElementById('toast');
    expect(t.textContent).toBe('City not found.');
    expect(t.style.display).toBe('block');
  });

  it('hides toast after 5.5 seconds', () => {
    showToast('Test message');
    vi.advanceTimersByTime(5500);
    expect(document.getElementById('toast').style.display).toBe('none');
  });

  it('resets timer if called again before timeout', () => {
    showToast('First message');
    vi.advanceTimersByTime(3000);
    showToast('Second message');
    vi.advanceTimersByTime(3000);
    // Only 3s elapsed since second call — should still be visible
    expect(document.getElementById('toast').style.display).toBe('block');
    vi.advanceTimersByTime(2500);
    expect(document.getElementById('toast').style.display).toBe('none');
  });

  it('does not throw when toast element is missing', () => {
    document.body.innerHTML = '';
    expect(() => showToast('test')).not.toThrow();
  });
});

// ─── initClock ───────────────────────────────────────────────────────────────

describe('initClock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = `
      <div id="tHm">--:--</div>
      <div id="tDt">--</div>
    `;
  });

  afterEach(() => { vi.useRealTimers(); });

  it('populates time element immediately on call', () => {
    vi.setSystemTime(new Date('2025-06-15T14:30:00'));
    initClock();
    const hm = document.getElementById('tHm').textContent;
    expect(hm).toMatch(/\d{2}:\d{2} (AM|PM)/);
  });

  it('populates date element immediately on call', () => {
    vi.setSystemTime(new Date('2025-06-15T14:30:00'));
    initClock();
    const dt = document.getElementById('tDt').textContent;
    expect(dt.length).toBeGreaterThan(5);
  });

  it('updates time after 1 second', () => {
    vi.setSystemTime(new Date('2025-06-15T14:30:00'));
    initClock();
    const before = document.getElementById('tHm').textContent;
    vi.setSystemTime(new Date('2025-06-15T14:31:00'));
    vi.advanceTimersByTime(1000);
    const after = document.getElementById('tHm').textContent;
    expect(after).not.toBe(before);
  });
});
