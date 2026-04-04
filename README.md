# SKYE ☁️

Minimal neumorphic weather app — real-time forecasts, animated UI, dark/light auto-theme.

[![CI](https://github.com/shaikhshahnawaz13/skye/actions/workflows/ci.yml/badge.svg)](https://github.com/shaikhshahnawaz13/skye/actions)

---

## Features

- Coordinate-based weather lookup for maximum accuracy
- Real nearby cities via OWM `/find` endpoint (not hardcoded)
- Clickable nearby city cards
- Auto dark/light theme based on time of day
- 5-day forecast + temperature wave chart
- Responsive — mobile, tablet, desktop

## Project Structure

```
skye/
├── .github/
│   └── workflows/
│       └── ci.yml          # Lint → Test → Build → Deploy to GitHub Pages
├── src/
│   ├── index.html          # Clean HTML, no inline scripts or styles
│   ├── css/
│   │   └── styles.css      # All styles
│   └── js/
│       ├── config.js       # Constants (API key, maps, fallback cities)
│       ├── api.js          # owmFetch, geocodeCity, fetchWeatherByCity, etc.
│       ├── theme.js        # Dark/light mode, weather accents, air quality
│       ├── weather.js      # paint(), loadNearby(), drawWave(), forecast
│       ├── ui.js           # Cursor, clock, spinner, toast
│       └── main.js         # Entry point — wires everything together
├── tests/
│   ├── api.test.js
│   ├── theme.test.js
│   ├── weather.test.js
│   └── ui.test.js
├── public/
│   └── favicon.png
├── .eslintrc.json
├── .gitignore
├── LICENSE
├── package.json
├── vite.config.js
└── vitest.config.js
```

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev

# Run tests
npm test

# Run tests with coverage report
npm run test:coverage

# Lint
npm run lint

# Production build → dist/
npm run build
```

## API Key

The app uses [OpenWeatherMap](https://openweathermap.org/api). The key lives in `src/js/config.js`:

```js
export const OWM_KEY = 'your_key_here';
```

New keys are active within ~10 minutes of account creation.

## CI/CD

Every push to `main`:
1. ESLint runs across `src/**/*.js`
2. Vitest runs all tests with V8 coverage
3. Vite builds to `dist/`
4. GitHub Pages deploys automatically

Enable Pages in your repo: **Settings → Pages → Source: GitHub Actions**.

## License

MIT © Shahnawaz Shaikh
