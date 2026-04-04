// ─── APP CONFIG ──────────────────────────────────────────────────────────────
export const OWM_KEY = '49e9292ca08a1c7b6d62899698d144ff';
export const OWM_BASE = 'https://api.openweathermap.org/data/2.5';
export const OWM_GEO  = 'https://api.openweathermap.org/geo/1.0';

// Fallback cities shown when /find endpoint fails
export const FALLBACK_CITIES = ['Delhi', 'Pune', 'Bangalore', 'Hyderabad', 'Chennai'];

// Weather condition → CSS class map
export const WX_CLASS_MAP = {
  Clear: 'clear', Clouds: 'clouds',
  Rain: 'rain', Drizzle: 'rain',
  Thunderstorm: 'thunderstorm',
  Snow: 'snow',
  Mist: 'mist', Fog: 'mist', Haze: 'mist',
};

// Weather condition → Lucide icon name map
export const WX_ICON_MAP = {
  Clear: 'sun', Clouds: 'cloud',
  Rain: 'cloud-rain', Drizzle: 'cloud-drizzle',
  Thunderstorm: 'cloud-lightning', Snow: 'cloud-snow',
  Mist: 'wind', Fog: 'wind', Haze: 'wind',
};

export const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
