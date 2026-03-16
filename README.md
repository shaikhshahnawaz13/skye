<div align="center">

```
 ███████╗██╗  ██╗██╗   ██╗███████╗
 ██╔════╝██║ ██╔╝╚██╗ ██╔╝██╔════╝
 ███████╗█████╔╝  ╚████╔╝ █████╗  
 ╚════██║██╔═██╗   ╚██╔╝  ██╔══╝  
 ███████║██║  ██╗   ██║   ███████╗
 ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝
```

**A minimal, modern weather dashboard · Pure HTML · CSS · JavaScript**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-4a90d9?style=for-the-badge&logo=vercel&logoColor=white)](https://shaikhshahnawaz13.github.io/skye-weather)
[![GitHub Stars](https://img.shields.io/github/stars/shaikhshahnawaz13/skye-weather?style=for-the-badge&color=4a90d9&logo=github)](https://github.com/shaikhshahnawaz13/skye-weather/stargazers)
[![License](https://img.shields.io/badge/License-MIT-4a90d9?style=for-the-badge)](LICENSE)
[![Made with Love](https://img.shields.io/badge/Made%20with-❤️-e85a5a?style=for-the-badge)](https://github.com/shaikhshahnawaz13)

</div>

---

## 🌤 What is SKYE?

SKYE is a **real-time weather dashboard** that gives you live weather data for any city on Earth — wrapped in a clean, professional **Neumorphic UI**. No bloat. No frameworks. No build tools. Just one `index.html` file that opens and works instantly.

Built as a portfolio project to demonstrate front-end skills including **design systems**, **API integration**, **physics-based interactions**, and **responsive layouts**.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎨 **Neumorphic Design** | Soft extruded shadows, single-tone surface — real tactile depth without borders or gradients |
| 🌍 **Any City on Earth** | Live weather via OpenWeatherMap API for 200,000+ cities worldwide |
| 📍 **Geolocation** | One-click auto-detect your current location |
| 💧 **Water Ripple Cursor** | Physics-based canvas simulation — cursor creates real water waves on the page |
| 🌡 **Animated Orb** | Center display with a pulsing neumorphic sphere showing temperature |
| 📅 **5-Day Forecast** | Daily high/low temperatures with weather icons |
| 📈 **Wave Graph** | Bezier curve temperature trend chart built from scratch with Canvas API |
| 🌆 **Nearby Cities** | Auto-loads 4 nearby city temperatures on the right panel |
| 🌙 **Day / Night Themes** | Automatically switches to dark navy after 8 PM based on local time |
| ⚡ **Weather Themes** | Accent colors shift per condition — amber for clear, deep blue for rain, purple for storm |
| 💾 **Remembers Last City** | localStorage auto-loads your last searched city on return |
| 📱 **Fully Responsive** | Works on mobile, tablet, and desktop |
| 🔁 **3-Proxy Fallback** | Direct API → allorigins.win → corsproxy.io — works even from `file://` |

---

## 🛠 Tech Stack

```
Zero dependencies. No React. No Vue. No npm. No build step.
```

| Layer | Technology |
|---|---|
| **Structure** | HTML5 |
| **Styling** | Pure CSS3 — Custom Properties, Grid, Flexbox |
| **Design System** | Neumorphism — dual shadow technique |
| **Interactions** | Vanilla JavaScript (ES2022) |
| **Physics** | Custom Canvas ripple simulation (wave equation) |
| **Charts** | Canvas API — hand-written Bezier wave graph |
| **Fonts** | Inter (Google Fonts) |
| **Weather Data** | [OpenWeatherMap API](https://openweathermap.org/api) — free tier |
| **Hosting** | GitHub Pages |

---

## 📂 Project Structure

```
skye-weather/
│
├── index.html      ← The entire app lives here (single file)
├── README.md       ← You are here
└── LICENSE         ← MIT License
```

> Everything is in one `index.html`. CSS in `<style>`, JS in `<script>`. No external files needed.

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/shaikhshahnawaz13/skye-weather.git
cd skye-weather
```

### 2. Run locally

Open `index.html` with **VS Code Live Server** (right-click → *Open with Live Server*)

Or use a quick server:

```bash
# Node.js
npx serve .

# Python
python -m http.server 8080
```

> ⚠️ **Don't open directly with `file://`** — browsers block external API calls for security reasons. Always use a local server or deploy to GitHub Pages.

---

## 🔑 API Key Setup

SKYE uses the **OpenWeatherMap API** (completely free, no credit card).

**Step 1** — Sign up at [openweathermap.org/api](https://openweathermap.org/api)

**Step 2** — Go to your profile → **My API Keys** → copy your default key

**Step 3** — Open `index.html`, search for `KEY =` and replace:

```js
// Before
const KEY = 'your_api_key_here';

// After  
const KEY = 'abc123youractualkey456';
```

> ⏳ New API keys take **10–15 minutes** to activate after account creation.

---

## 🎨 Design System — Neumorphism Explained

Neumorphism creates tactile depth using **two shadows on one shared background color**:

```css
:root {
  --bg:   #e8eef6;   /* the ONE background — everything matches this */
  --bg-d: #d1dae6;   /* slightly darker  = shadow side  */
  --bg-l: #ffffff;   /* slightly lighter = highlight side */
}

/* Raised card or button */
.raised {
  background: var(--bg);
  box-shadow:
     10px  10px 24px var(--bg-d),   /* dark  → bottom-right */
    -10px -10px 24px var(--bg-l);   /* light → top-left     */
}

/* Pressed / inset (input fields, detail tiles) */
.pressed {
  background: var(--bg);
  box-shadow:
    inset  6px  6px 16px var(--bg-d),
    inset -6px -6px 16px var(--bg-l);
}
```

> 💡 **The golden rule:** cards, buttons, inputs — they all have the **exact same background color** as the page. Depth comes entirely from shadows, not color.

---

## 🌊 Water Ripple — Physics Behind It

The cursor effect uses the **discrete wave equation** solved on a 2D float grid:

```
next[x,y] = (cur[x-1,y] + cur[x+1,y] + cur[x,y-1] + cur[x,y+1]) / 2 - prev[x,y]
```

Each animation frame: compute wave propagation → render displacement as pixel brightness → swap buffers. The result is physically accurate water wave simulation.

```js
// Drop a ripple at (x, y)
function drop(x, y, radius, strength) {
  for (let dy = -radius; dy <= radius; dy++)
    for (let dx = -radius; dx <= radius; dx++)
      if (dx*dx + dy*dy <= radius*radius)
        buffer1[(y+dy) * W + (x+dx)] = strength;
}
```

No WebGL. No Three.js. Just math on a `Float32Array` at 60fps. 🧠

---

## 🌐 Deploy to GitHub Pages

```bash
# Step 1 — Initialize and push
git init
git add .
git commit -m "feat: SKYE weather dashboard v1.0"
git branch -M main
git remote add origin https://github.com/shaikhshahnawaz13/skye-weather.git
git push -u origin main

# Step 2 — Enable Pages
# GitHub Repo → Settings → Pages → Source: main → / (root) → Save
```

Live in ~2 minutes at:
```
https://shaikhshahnawaz13.github.io/skye-weather
```

---

## 📡 API Endpoints Used

```
# Current weather
GET api.openweathermap.org/data/2.5/weather
    ?q={city}&units=metric&appid={key}

# 5-day forecast (3-hour intervals)  
GET api.openweathermap.org/data/2.5/forecast
    ?q={city}&units=metric&appid={key}
```

Both on the **free tier** — 60 calls/minute, 1,000,000 calls/month.

---

## 🔧 Customization

**Change nearby cities:**
```js
const NB = ['Delhi', 'Pune', 'Bangalore', 'Hyderabad', 'Chennai'];
// Edit this array to any cities you want
```

**Change the color palette:**
```css
:root {
  --bg:   #e8eef6;  /* warmer: try #f0ece8, greener: #e8f0ec */
  --bg-d: #d1dae6;
  --bg-l: #ffffff;
}
```

**Switch to Fahrenheit:**
```js
// Change 'metric' to 'imperial' in both API calls
owm(`weather?q=${city}&units=imperial&appid=${KEY}`)
```

---

## 📋 Roadmap

- [ ] °C / °F unit toggle button
- [ ] Hourly forecast view (next 24h)
- [ ] UV index + AQI data
- [ ] Search history dropdown
- [ ] PWA support (installable on mobile)
- [ ] Dark mode toggle (manual override)
- [ ] Weather alerts integration

---

## 🤝 Contributing

PRs are welcome! For major changes, open an issue first.

```bash
# Fork → clone → branch → PR

git checkout -b feature/your-feature
git commit -m "feat: your feature description"
git push origin feature/your-feature
# Open a Pull Request on GitHub
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for full details.
Free to use, modify, and distribute.

---

## 👨‍💻 Author

<div align="center">

**Shahnawaz Ahmed Taqi Kanrul Shaikh**

BSc IT · Akbar Peerbhoy College · University of Mumbai

[![GitHub](https://img.shields.io/badge/GitHub-shaikhshahnawaz13-181717?style=flat-square&logo=github)](https://github.com/shaikhshahnawaz13)
[![Portfolio](https://img.shields.io/badge/Portfolio-Visit-4a90d9?style=flat-square&logo=vercel)](https://shaikhshahnawaz13.github.io/portfolio)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/shaikhshahnawaz13)

</div>

---

<div align="center">

*If this project helped you or you liked the design — drop a ⭐ It means a lot!*

**Built with 💙 and a lot of CSS shadows**

</div>
