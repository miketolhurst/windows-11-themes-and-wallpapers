export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  accentColor: string;
  secondaryAccent: string;
  isLightMode: boolean;
  taskbarMode: 'blur' | 'gradient';
  cornerRadius: number;
  taskbarBlur: number;
  startMenuBlur: number;
  notificationBlur: number;
  hideRecommended: boolean;
  compactSearch: boolean;
  dynamicNotificationHeight: boolean;
  removeDropShadows: boolean;
  wallpaperUrl: string;
  previewGradient: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    description: 'High-contrast dark synthwave aesthetic with neon cyan and magenta accents.',
    accentColor: '#FF007F',
    secondaryAccent: '#00F0FF',
    isLightMode: false,
    taskbarMode: 'gradient',
    cornerRadius: 4,
    taskbarBlur: 20,
    startMenuBlur: 25,
    notificationBlur: 25,
    hideRecommended: true,
    compactSearch: true,
    dynamicNotificationHeight: true,
    removeDropShadows: false,
    wallpaperUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230d0221"/><stop offset="50%" stop-color="%230f0826"/><stop offset="100%" stop-color="%23240046"/></linearGradient><radialGradient id="glow" cx="70%" cy="30%" r="60%"><stop offset="0%" stop-color="%23ff007f" stop-opacity="0.35"/><stop offset="100%" stop-color="%23000000" stop-opacity="0"/></radialGradient><radialGradient id="glow2" cx="20%" cy="80%" r="50%"><stop offset="0%" stop-color="%2300f0ff" stop-opacity="0.25"/><stop offset="100%" stop-color="%23000000" stop-opacity="0"/></radialGradient></defs><rect width="100%" height="100%" fill="url(%23bg)"/><rect width="100%" height="100%" fill="url(%23glow)"/><rect width="100%" height="100%" fill="url(%23glow2)"/></svg>',
    previewGradient: 'linear-gradient(135deg, #0d0221 0%, #ff007f 50%, #00f0ff 100%)',
  },
  {
    id: 'nordic-frost',
    name: 'Nordic Frost',
    description: 'Clean Scandinavian winter chill featuring cool slate and arctic glacier blue.',
    accentColor: '#38BDF8',
    secondaryAccent: '#0284C7',
    isLightMode: false,
    taskbarMode: 'blur',
    cornerRadius: 12,
    taskbarBlur: 28,
    startMenuBlur: 30,
    notificationBlur: 30,
    hideRecommended: false,
    compactSearch: false,
    dynamicNotificationHeight: true,
    removeDropShadows: false,
    wallpaperUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230b132b"/><stop offset="50%" stop-color="%231c2541"/><stop offset="100%" stop-color="%233a506b"/></linearGradient><radialGradient id="ice" cx="50%" cy="40%" r="50%"><stop offset="0%" stop-color="%2338bdf8" stop-opacity="0.3"/><stop offset="100%" stop-color="%23000000" stop-opacity="0"/></radialGradient></defs><rect width="100%" height="100%" fill="url(%23bg)"/><rect width="100%" height="100%" fill="url(%23ice)"/></svg>',
    previewGradient: 'linear-gradient(135deg, #0b132b 0%, #1c2541 50%, #38bdf8 100%)',
  },
  {
    id: 'aero-glass',
    name: 'Aero Glass',
    description: 'Nostalgic modern Aero Glass revival with ultra-high transparency and bright crystal accents.',
    accentColor: '#0EA5E9',
    secondaryAccent: '#38BDF8',
    isLightMode: true,
    taskbarMode: 'blur',
    cornerRadius: 10,
    taskbarBlur: 8,
    startMenuBlur: 12,
    notificationBlur: 12,
    hideRecommended: false,
    compactSearch: false,
    dynamicNotificationHeight: false,
    removeDropShadows: false,
    wallpaperUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><defs><linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%2370c1ff"/><stop offset="60%" stop-color="%23cbe9ff"/><stop offset="100%" stop-color="%23ffffff"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23sky)"/></svg>',
    previewGradient: 'linear-gradient(135deg, #70c1ff 0%, #cbe9ff 50%, #ffffff 100%)',
  },
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    description: 'Stealth deep OLED black with subtle titanium grey borders and sharp lines.',
    accentColor: '#71717A',
    secondaryAccent: '#3F3F46',
    isLightMode: false,
    taskbarMode: 'blur',
    cornerRadius: 2,
    taskbarBlur: 5,
    startMenuBlur: 10,
    notificationBlur: 10,
    hideRecommended: true,
    compactSearch: true,
    dynamicNotificationHeight: false,
    removeDropShadows: true,
    wallpaperUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><rect width="100%" height="100%" fill="%2309090b"/></svg>',
    previewGradient: 'linear-gradient(135deg, #09090b 0%, #27272a 50%, #71717a 100%)',
  },
  {
    id: 'solarized-warm',
    name: 'Solarized Warm',
    description: 'Warm, easy-on-the-eyes palette inspired by solarized amber and deep cyan tones.',
    accentColor: '#B58900',
    secondaryAccent: '#2AA198',
    isLightMode: false,
    taskbarMode: 'gradient',
    cornerRadius: 12,
    taskbarBlur: 18,
    startMenuBlur: 20,
    notificationBlur: 20,
    hideRecommended: false,
    compactSearch: false,
    dynamicNotificationHeight: true,
    removeDropShadows: false,
    wallpaperUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><defs><linearGradient id="sol" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23002b36"/><stop offset="50%" stop-color="%23073642"/><stop offset="100%" stop-color="%231a2a30"/></linearGradient><radialGradient id="amber" cx="80%" cy="20%" r="50%"><stop offset="0%" stop-color="%23b58900" stop-opacity="0.3"/><stop offset="100%" stop-color="%23000000" stop-opacity="0"/></radialGradient></defs><rect width="100%" height="100%" fill="url(%23sol)"/><rect width="100%" height="100%" fill="url(%23amber)"/></svg>',
    previewGradient: 'linear-gradient(135deg, #002b36 0%, #073642 50%, #b58900 100%)',
  },
];
