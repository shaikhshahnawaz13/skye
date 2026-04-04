<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,14,20,24,30&height=200&section=header&text=SKYE&fontSize=90&fontAlignY=38&fontColor=ffffff&desc=neumorphic%20weather%20intelligence&descAlignY=60&descSize=18&animation=fadeIn" width="100%"/>

<br/>

<img src="https://readme-typing-svg.demolab.com?font=Inter&weight=800&size=22&duration=2500&pause=800&color=4A90D9&center=true&vCenter=true&multiline=true&width=700&height=60&lines=Real-time+weather+%E2%80%94+coordinate-accurate+%E2%80%94+beautifully+minimal" alt="Typing SVG" />

<br/><br/>

<a href="https://shaikhshahnawaz13.github.io/skye/"><img src="https://img.shields.io/badge/%F0%9F%8C%90%20Live%20Demo-shaikhshahnawaz13.github.io%2Fskye-0ea5e9?style=for-the-badge&labelColor=0f172a" alt="Live Demo"/></a>
&nbsp;
<a href="https://github.com/shaikhshahnawaz13/skye/actions"><img src="https://github.com/shaikhshahnawaz13/skye/actions/workflows/ci.yml/badge.svg?style=for-the-badge" alt="CI/CD"/></a>
&nbsp;
<img src="https://img.shields.io/badge/tests-73%20passed-22c55e?style=for-the-badge&logo=vitest&logoColor=white" alt="Tests"/>
&nbsp;
<img src="https://img.shields.io/badge/license-MIT-f59e0b?style=for-the-badge" alt="License"/>

<br/><br/>

<img src="https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=flat-square&logo=javascript&logoColor=black"/>
<img src="https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white"/>
<img src="https://img.shields.io/badge/Vitest-1.x-6E9F18?style=flat-square&logo=vitest&logoColor=white"/>
<img src="https://img.shields.io/badge/ESLint-8.x-4B32C3?style=flat-square&logo=eslint&logoColor=white"/>
<img src="https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?style=flat-square&logo=github-actions&logoColor=white"/>
<img src="https://img.shields.io/badge/OpenWeatherMap-API-E36316?style=flat-square"/>

</div>

<br/>

---

## ◈ The Problem With Weather Apps

Most weather apps fetch temperature by city *name*. OpenWeatherMap resolves that to a broad bounding-box average — a station that can be kilometres away from your actual location, off by **5–8°C**.

```
❌  GET /weather?q=Mumbai              → city bounding box → 30°C
✅  GET /geo/1.0/direct?q=Mumbai       → { lat: 19.07, lon: 72.87 }
    GET /weather?lat=19.07&lon=72.87   → nearest station  → 37°C
```

Skye geocodes first, then fetches by exact coordinates. Two API calls instead of one. The difference matches what Google and AccuWeather show.

---

## ◈ Feature Matrix

<table>
<tr>
<td width="50%">

**Core Weather**
| | Feature |
|---|---|
| ✅ | Coordinate-accurate temperatures |
| ✅ | 5-day forecast (3-hourly aggregated) |
| ✅ | Feels like / min / max strip |
| ✅ | Humidity, wind speed, pressure, visibility |
| ✅ | Wind direction (degree → compass) |
| ✅ | Sunrise & sunset times |
| ✅ | Cloud cover percentage |
| ✅ | Temperature wave chart (Canvas) |

</td>
<td width="50%">

**UI / UX**
| | Feature |
|---|---|
| ✅ | Neumorphic design system |
| ✅ | Auto dark/light (time-of-day engine) |
| ✅ | 6 weather accent states |
| ✅ | Real nearby cities (OWM `/find`) |
| ✅ | Clickable nearby city cards |
| ✅ | Custom spring-physics cursor |
| ✅ | Animated temperature counter |
| ✅ | CORS proxy fallback chain (3 proxies) |

</td>
</tr>
<tr>
<td>

**Infrastructure**
| | Feature |
|---|---|
| ✅ | CI/CD — GitHub Actions |
| ✅ | Lint → Test → Build → Deploy pipeline |
| ✅ | 73 unit tests (Vitest) |
| ✅ | V8 coverage reporting |
| ✅ | ESLint strict mode |
| ✅ | Vite production build |

</td>
<td>

**Honest ❌ (Not in scope)**
| | Signal |
|---|---|
| ❌ | Auth / login |
| ❌ | Database (stateless by design) |
| ❌ | Docker / containerisation |
| ❌ | TypeScript |
| ❌ | AI / ML |
| ❌ | Server-side rendering |

</td>
</tr>
</table>

---

## ◈ Architecture

```
╔══════════════════════════════════════════════════════════════╗
║                    SKYE  —  Client Architecture              ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║   main.js ──── entry point, event wiring, search handlers   ║
║      │                                                       ║
║      ├──▶ api.js ─────── all network I/O                    ║
║      │       ├── owmFetch()        multi-proxy fetch         ║
║      │       ├── geocodeCity()     name → lat/lon            ║
║      │       ├── fetchWeatherByCity()                        ║
║      │       ├── fetchWeatherByCoords()                      ║
║      │       └── fetchNearbyCities()  OWM /find endpoint     ║
║      │                                                       ║
║      ├──▶ weather.js ── all rendering                        ║
║      │       ├── paint()           full UI repaint           ║
║      │       ├── loadNearby()      nearby city cards         ║
║      │       ├── paintForecast()   5-day forecast row        ║
║      │       ├── drawWave()        canvas bezier chart       ║
║      │       ├── animateCounter()  rAF number animation      ║
║      │       └── weatherIcon()     Lucide icon factory       ║
║      │                                                       ║
║      ├──▶ theme.js ──── dark/light + weather accents         ║
║      │       ├── applyTimeClasses()   auto day/night         ║
║      │       ├── applyWeatherTheme()  wx-clear / wx-rain…    ║
║      │       ├── toggleDark()         manual override        ║
║      │       ├── scheduleAutoTheme()  60s poll               ║
║      │       └── aqFromHumidity()     air quality proxy      ║
║      │                                                       ║
║      ├──▶ ui.js ──────── non-weather UI                      ║
║      │       ├── initCursor()     spring-physics dot+ring    ║
║      │       ├── initClock()      live HH:MM ticker          ║
║      │       ├── setSpin()        loading spinners           ║
║      │       └── showToast()      error notifications        ║
║      │                                                       ║
║      └──▶ config.js ─── single source of truth              ║
║              ├── OWM_KEY / OWM_BASE / OWM_GEO               ║
║              ├── FALLBACK_CITIES                             ║
║              ├── WX_CLASS_MAP   condition → CSS class        ║
║              ├── WX_ICON_MAP    condition → Lucide name      ║
║              └── DAYS[]                                      ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
           │                              │
           ▼                              ▼
  ┌─────────────────┐          ┌────────────────────┐
  │  OWM Weather    │          │  OWM Geocoding     │
  │  /data/2.5/     │          │  /geo/1.0/direct   │
  │  weather        │          │  city → coords     │
  │  forecast       │          └────────────────────┘
  │  find           │
  └─────────────────┘
```

---

## ◈ CORS Proxy Fallback Chain

Skye runs entirely client-side with no backend. When the browser's CORS policy blocks a direct OWM request, it cascades through three public proxies:

```
Request
  │
  ├─1─▶ Direct fetch (api.openweathermap.org)
  │         timeout: 5s  ──▶ ✅ return  |  ❌ continue
  │
  ├─2─▶ api.allorigins.win/get?url=...
  │         timeout: 9s  ──▶ ✅ return  |  ❌ continue
  │
  ├─3─▶ corsproxy.io/?url=...
  │         timeout: 9s  ──▶ ✅ return  |  ❌ continue
  │
  └─────▶ throw Error('NETWORK')
```

API key errors (401) and not-found errors (404) short-circuit immediately — no wasted proxy hops.

---

## ◈ Neumorphic Design System

```css
/* One background. Two shadows. Everything emerges from this. */

:root {
  --bg:   #e8eef5;   /* the ONE base color          */
  --bg-d: #c8d2de;   /* darker  — bottom-right shadow */
  --bg-l: #ffffff;   /* lighter — top-left highlight  */
}

/* Raised element */
.neu     { box-shadow: 6px 6px 14px var(--bg-d), -6px -6px 14px var(--bg-l); }

/* Pressed/inset element */
.neu-in  { box-shadow: inset 4px 4px 10px var(--bg-d), inset -4px -4px 10px var(--bg-l); }
```

**12 visual modes** — 6 weather conditions × 2 themes (dark/light). All transitions are `1.4s cubic-bezier(0.4,0,0.2,1)` — slow enough to feel physical, fast enough to feel responsive.

| Weather | Accent (Light) | Accent (Dark) |
|---|---|---|
| Clear | `#e8a020` amber | `#e8a020` amber |
| Clouds | `#5a7a9a` steel | `#7a9aba` mist |
| Rain | `#2e72b2` blue | `#50a0e0` sky |
| Thunderstorm | `#6040a0` violet | `#a080e0` lavender |
| Snow | `#5a98c8` ice | `#90c8f0` frost |
| Mist/Fog/Haze | `#6a8a9a` grey | `#90a8b8` silver |

---

## ◈ Test Architecture

```
tests/
├── api.test.js      16 tests
│   ├── owmFetch         direct 200, 401, 404, proxy fallthrough, all-fail
│   ├── geocodeCity      known city, empty result, network error, non-ok
│   ├── fetchWeatherByCity   geocode→coords path, name fallback, NOT_FOUND
│   ├── fetchWeatherByCoords parallel fetch
│   └── fetchNearbyCities    list returned, network fail, missing list
│
├── theme.test.js    24 tests
│   ├── isNightTime      21:00, 03:00, 06:00, 14:00, 19:59, 20:00 boundary
│   ├── applyTimeClasses forceDark, forceLight, auto-night, auto-day, cleanup
│   ├── applyWeatherTheme  Clear, Rain, Drizzle, Haze, unknown, cleanup
│   └── aqFromHumidity   all 4 bands + color format + boundaries (44/45, 79/80)
│
├── weather.test.js  23 tests
│   ├── animateCounter   target value, zero target (rAF mock pattern)
│   ├── windDirection    all 8 compass points + null/undefined defaults
│   ├── formatTime       string output, AM/PM, colon present
│   └── weatherIcon      tag structure, 7 conditions, fallback, size param
│
└── ui.test.js       10 tests
    ├── setSpin          show, hide, missing elements
    ├── showToast        text, display, 5.5s auto-hide, timer reset
    └── initClock        immediate render, date render, 1s tick update
```

**Key patterns:**
- Closure-safe mocks — data captured at invocation, not inside `json()` callback, to survive `Promise.all` races
- Direct `requestAnimationFrame` mock — vitest fake timers don't intercept `performance.now()`, so rAF is mocked manually with a controlled timestamp
- Boundary testing — every threshold in `aqFromHumidity` tested at `n−1`, `n`, `n+1`

---

## ◈ CI / CD Pipeline

```
┌─────────────────────────────────────────────────────┐
│  Every push to main                                 │
│                                                     │
│  JOB 1 — test                                       │
│  ┌──────────────────────────────────────────────┐   │
│  │  1. Checkout                                 │   │
│  │  2. Node 20 setup + npm cache                │   │
│  │  3. npm ci                                   │   │
│  │  4. ESLint  src/js/**                        │   │
│  │  5. Vitest  --coverage (V8)                  │   │
│  │  6. Upload coverage artifact (7 days)        │   │
│  └──────────────────────────────────────────────┘   │
│             │ needs: test                           │
│  JOB 2 — build                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  1. Checkout + Node 20                       │   │
│  │  2. npm ci                                   │   │
│  │  3. vite build → dist/                       │   │
│  │  4. upload-pages-artifact                    │   │
│  └──────────────────────────────────────────────┘   │
│             │ needs: build  (main branch only)      │
│  JOB 3 — deploy                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │  actions/deploy-pages@v4                     │   │
│  │  → https://shaikhshahnawaz13.github.io/skye/ │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## ◈ Project Structure

```
skye/
│
├── .github/
│   └── workflows/
│       └── ci.yml              ← Lint → Test → Build → Deploy
│
├── src/
│   ├── index.html              ← Zero inline scripts or styles
│   ├── css/
│   │   └── styles.css          ← Neumorphic design system (690 lines)
│   └── js/
│       ├── config.js           ← All constants in one place
│       ├── api.js              ← Every network call lives here
│       ├── theme.js            ← Dark/light & weather accent engine
│       ├── weather.js          ← paint(), loadNearby(), drawWave()
│       ├── ui.js               ← Cursor, clock, spinner, toast
│       └── main.js             ← Entry point — event wiring only
│
├── tests/
│   ├── api.test.js             ← 16 tests
│   ├── theme.test.js           ← 24 tests
│   ├── weather.test.js         ← 23 tests
│   └── ui.test.js              ← 10 tests
│
├── public/
│   └── favicon.png
│
├── .eslintrc.json              ← ESLint config
├── .gitignore
├── LICENSE                     ← MIT
├── package.json                ← scripts: dev, build, deploy, test, lint
├── vite.config.js              ← base: '/skye/' for GitHub Pages
└── vitest.config.js            ← jsdom environment
```

---

## ◈ Getting Started

```bash
# Clone
git clone https://github.com/shaikhshahnawaz13/skye.git
cd skye

# Install
npm install

# Dev server → http://localhost:3000
npm run dev

# All 73 tests
npm test

# Lint
npm run lint

# Production build → dist/
npm run build

# Build + deploy to GitHub Pages
npm run deploy
```

**API key** — replace in `src/js/config.js`:
```js
export const OWM_KEY = 'your_key_here';
```
Get one free at [openweathermap.org](https://openweathermap.org/api). Active within ~10 minutes.

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,14,20,24,30&height=100&section=footer&animation=fadeIn" width="100%"/>

<img src="https://readme-typing-svg.demolab.com?font=Inter&weight=300&size=12&duration=4000&pause=1000&color=8AA0B8&center=true&vCenter=true&width=500&height=25&lines=MIT+License+%C2%A9+2025+Shahnawaz+Shaikh+%E2%80%94+shaikhshahnawaz13" alt="Footer"/>

<br/>

[![GitHub followers](https://img.shields.io/github/followers/shaikhshahnawaz13?style=social)](https://github.com/shaikhshahnawaz13)
[![GitHub stars](https://img.shields.io/github/stars/shaikhshahnawaz13/skye?style=social)](https://github.com/shaikhshahnawaz13/skye)

</div>
