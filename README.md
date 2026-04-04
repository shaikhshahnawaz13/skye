<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Inter&weight=900&size=72&duration=3000&pause=1000&color=4A90D9&center=true&vCenter=true&width=500&height=120&lines=SKYE+%E2%98%81%EF%B8%8F" alt="SKYE" />

<img src="https://readme-typing-svg.demolab.com?font=Inter&weight=300&size=16&duration=4000&pause=500&color=8AA0B8&center=true&vCenter=true&width=600&height=40&lines=Live+weather+%C2%B7+minimal+%C2%B7+precise;Real-time+forecasts+with+neumorphic+UI;Coordinate-accurate+temperatures%2C+finally." alt="Tagline" />

<br/>

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-shaikhshahnawaz13.github.io%2Fskye-4A90D9?style=for-the-badge&labelColor=1a1a2e)](https://shaikhshahnawaz13.github.io/skye/)
[![CI / CD](https://github.com/shaikhshahnawaz13/skye/actions/workflows/ci.yml/badge.svg)](https://github.com/shaikhshahnawaz13/skye/actions)
[![Tests](https://img.shields.io/badge/tests-73%20passed-2dc96a?style=flat-square&logo=vitest&logoColor=white)](https://github.com/shaikhshahnawaz13/skye/tree/main/tests)
[![License](https://img.shields.io/badge/license-MIT-e8a020?style=flat-square)](LICENSE)
[![JS](https://img.shields.io/badge/Vanilla_JS-ES2022-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)

</div>

---

<div align="center">
  <img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" width="100%"/>
</div>

## ✦ What is Skye?

Skye is a **neumorphic weather dashboard** that fetches real-time data from OpenWeatherMap and renders it with a tactile soft-shadow UI system. It auto-switches between dark and light themes based on the time of day, shows a 5-day forecast with a wave chart, and surfaces genuinely nearby cities — not a hardcoded list.

> **Why it's different:** Most weather apps fetch by city *name*, hitting a generic bounding-box station that can be off by 5–8°C. Skye geocodes first, then fetches by exact coordinates — the same approach the OWM mobile app uses.

---

## ✦ Feature Breakdown

| Feature | Status | Notes |
|---|---|---|
| 🌡️ Coordinate-accurate temperatures | ✅ | Geocode API → `/weather?lat=&lon=` |
| 🏙️ Real nearby cities | ✅ | OWM `/find` endpoint, not hardcoded |
| 👆 Clickable city cards | ✅ | Custom event dispatch pattern |
| 🌓 Auto dark / light theme | ✅ | Time-of-day engine, manual override |
| ☁️ Weather accent theming | ✅ | 6 weather states × dark/light |
| 📅 5-day forecast | ✅ | Aggregated from 3-hourly slots |
| 〰️ Temperature wave chart | ✅ | Canvas bezier, CSS var colors |
| 💧 Humidity / wind / pressure | ✅ | Stat chips with Lucide icons |
| 🌅 Sunrise & sunset times | ✅ | Unix timestamp → locale string |
| 🌬️ Wind direction compass | ✅ | Degree → cardinal direction |
| 📱 Fully responsive | ✅ | 3-col → 2-col → 1-col grid |
| 🖱️ Custom animated cursor | ✅ | Dot + ring with spring physics |
| 🔴 Air quality indicator | ✅ | Humidity-based proxy |
| 🔌 CORS proxy fallback chain | ✅ | Direct → allorigins → corsproxy |
| 🔒 Auth | ❌ | No login — open weather data |
| 🗄️ Database | ❌ | Stateless — `localStorage` for last city only |
| 🐳 Docker | ❌ | Static site, no container needed |
| 🤖 AI / ML | ❌ | Pure meteorological data |
| 🟦 TypeScript | ❌ | Vanilla ES2022 modules |

---

## ✦ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (Client)                    │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │config.js │  │  api.js  │  │ theme.js │  │ ui.js  │  │
│  │constants │  │owmFetch  │  │dark/light│  │cursor  │  │
│  │key, maps │  │geocode   │  │wx accents│  │clock   │  │
│  └────┬─────┘  │nearby    │  └────┬─────┘  │spinner │  │
│       │        └────┬─────┘       │        │toast   │  │
│       └──────┬───────────────┬────┘        └────────┘  │
│              ▼               ▼                         │
│         ┌──────────┐   ┌──────────┐                    │
│         │weather.js│   │ main.js  │                    │
│         │paint()   │   │entry pt  │                    │
│         │loadNearby│   │events    │                    │
│         │drawWave()│   │search()  │                    │
│         └──────────┘   └──────────┘                    │
└─────────────────────────────────────────────────────────┘
          │                      │
          ▼                      ▼
┌──────────────────┐   ┌──────────────────────────┐
│  OpenWeatherMap  │   │  OWM Geocoding API        │
│  /weather        │   │  geo/1.0/direct           │
│  /forecast       │   │  city name → lat/lon      │
│  /find (nearby)  │   └──────────────────────────┘
└──────────────────┘
```

---

## ✦ Temperature Accuracy Fix

```js
// ❌ Before — hits a generic city-boundary weather station
fetch(`/weather?q=Mumbai&appid=KEY`)

// ✅ After — geocode first, then fetch by exact coordinates
const [{ lat, lon }] = await fetch(`/geo/1.0/direct?q=Mumbai&limit=1&appid=KEY`)
fetch(`/weather?lat=${lat}&lon=${lon}&appid=KEY`)
```

This reduces temperature error from ~5–8°C to ~1–2°C by targeting the nearest station to the actual coordinate rather than a cached city aggregate.

---

## ✦ Tech Stack

<div align="center">

![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-1.x-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-8.x-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-Deploy-222222?style=for-the-badge&logo=github&logoColor=white)
![OpenWeatherMap](https://img.shields.io/badge/OpenWeatherMap-API-E36316?style=for-the-badge)

</div>

| Layer | Choice | Why |
|---|---|---|
| **Bundler** | Vite 5 | HMR, ES module native, fast cold start |
| **Testing** | Vitest + jsdom | Same config as Vite, browser-like DOM |
| **Linting** | ESLint 8 | Enforces strict equality, no `var` |
| **Deploy** | gh-pages + GitHub Actions | Zero-config, branch-based |
| **Icons** | Lucide (CDN) | Consistent SVG stroke style |
| **Fonts** | Inter (Google Fonts) | Variable weight, screen-optimized |
| **API** | OpenWeatherMap Free | `/weather`, `/forecast`, `/find`, Geocoding |

---

## ✦ Project Structure

```
skye/
├── .github/
│   └── workflows/
│       └── ci.yml              # Lint → Test → Build → Deploy
├── src/
│   ├── index.html              # Clean HTML, zero inline scripts
│   ├── css/
│   │   └── styles.css          # Neumorphic design system (690 lines)
│   └── js/
│       ├── config.js           # All constants — API key, icon/class maps
│       ├── api.js              # Network layer — fetch, geocode, proxies
│       ├── theme.js            # Dark/light engine, weather accents
│       ├── weather.js          # UI rendering — paint, wave, nearby
│       ├── ui.js               # Cursor, clock, spinner, toast
│       └── main.js             # Entry point — event wiring only
├── tests/
│   ├── api.test.js             # 16 tests
│   ├── theme.test.js           # 24 tests
│   ├── weather.test.js         # 23 tests
│   └── ui.test.js              # 10 tests
├── public/favicon.png
├── .eslintrc.json
├── .gitignore
├── LICENSE
├── package.json
├── vite.config.js
└── vitest.config.js
```

---

## ✦ Test Coverage

```
 ✓ tests/ui.test.js       10 tests
 ✓ tests/api.test.js      16 tests
 ✓ tests/theme.test.js    24 tests
 ✓ tests/weather.test.js  23 tests

 Test Files  4 passed (4)
 Tests       73 passed (73)
```

Notable patterns: closure-safe `Promise.all` mocks, direct `requestAnimationFrame` mocking (not fake timers), boundary testing on all threshold values.

---

## ✦ CI / CD Pipeline

```
push to main
     │
     ├──▶ Lint (ESLint)
     ├──▶ Test (Vitest, 73 tests, V8 coverage)
     ├──▶ Build (Vite → dist/)
     └──▶ Deploy (gh-pages branch → GitHub Pages)
```

---

## ✦ Getting Started

```bash
git clone https://github.com/shaikhshahnawaz13/skye.git
cd skye
npm install

npm run dev        # localhost:3000
npm test           # 73 tests
npm run lint       # ESLint
npm run build      # dist/
npm run deploy     # build + push to gh-pages
```

---

## ✦ Design System

Neumorphism: one background color, dual directional shadows.

```css
--neu-out: 6px 6px 14px var(--bg-d), -6px -6px 14px var(--bg-l);
--neu-in:  inset 4px 4px 10px var(--bg-d), inset -4px -4px 10px var(--bg-l);
```

6 weather accent states × 2 themes (dark/light) = 12 visual modes. All transitions are 1.4s eased.

---

<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=13&duration=3000&pause=1000&color=8AA0B8&center=true&vCenter=true&width=400&height=30&lines=MIT+License+%C2%A9+2025+Shahnawaz+Shaikh" alt="License" />

[![GitHub](https://img.shields.io/badge/shaikhshahnawaz13-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/shaikhshahnawaz13)

</div>
