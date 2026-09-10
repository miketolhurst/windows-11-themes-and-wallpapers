import { encodeThemeToUrl } from "../lib/urlSharing";
import { ThemeState } from "../store/useThemeStore";

export interface FeaturedTheme {
  id: string;
  name: string;
  tag: string;
  description: string;
  wallpaperFileName: string;
  isFeaturedHero?: boolean;
  config: {
    accentColor: string;
    secondaryAccent: string;
    mode: "dark" | "light";
    taskbarBlur: number;
    taskbarOpacity: number;
    taskbarRadius: number;
    startMenuBlur: number;
    startMenuRadius: number;
    ncBlur: number;
    ncRadius: number;
    activeEffect: "none" | "acrylic" | "glass";
    iconSpacing: number;
    iconSize: number;
  };
}

export const FEATURED_THEMES: FeaturedTheme[] = [
  {
    id: "google-assistant-wave",
    name: "Google Assistant Wave",
    tag: "🌟 Featured Showcase",
    description: "Vibrant kinetic wave colors with Google blue, red, yellow, and green accents across an authentic dark acrylic shell.",
    wallpaperFileName: "google-assistant-wave.jpg",
    isFeaturedHero: true,
    config: {
      accentColor: "#4285F4",
      secondaryAccent: "#EA4335",
      mode: "dark",
      taskbarBlur: 20,
      taskbarOpacity: 92,
      taskbarRadius: 10,
      startMenuBlur: 20,
      startMenuRadius: 12,
      ncBlur: 18,
      ncRadius: 12,
      activeEffect: "acrylic",
      iconSpacing: 10,
      iconSize: 24,
    },
  },
  {
    id: "cobalt-porcelain",
    name: "Cobalt & Porcelain",
    tag: "Official Preset",
    description: "Deep royal blues paired with pristine porcelain ice highlights and smooth frosted WinUI 3 glass.",
    wallpaperFileName: "cobalt-porcelain.jpg",
    config: {
      accentColor: "#0047AB",
      secondaryAccent: "#E1EBF5",
      mode: "dark",
      taskbarBlur: 16,
      taskbarOpacity: 94,
      taskbarRadius: 8,
      startMenuBlur: 18,
      startMenuRadius: 12,
      ncBlur: 16,
      ncRadius: 10,
      activeEffect: "glass",
      iconSpacing: 8,
      iconSize: 24,
    },
  },
  {
    id: "forest-sage",
    name: "Forest Sage & Warm Brass",
    tag: "Official Preset",
    description: "Organic woodland sage greens harmonized with warm brass gold accents and botanical wallpaper.",
    wallpaperFileName: "forest-sage.jpg",
    config: {
      accentColor: "#2D5A43",
      secondaryAccent: "#C9A84E",
      mode: "dark",
      taskbarBlur: 14,
      taskbarOpacity: 95,
      taskbarRadius: 8,
      startMenuBlur: 16,
      startMenuRadius: 10,
      ncBlur: 14,
      ncRadius: 10,
      activeEffect: "acrylic",
      iconSpacing: 8,
      iconSize: 24,
    },
  },
  {
    id: "cyberpunk-neon",
    name: "Cyberpunk Neon Noir",
    tag: "Vibrant Glow",
    description: "High-energy electric magenta and cyan neon glow on dark obsidian glass for futuristic setups.",
    wallpaperFileName: "default-dark.jpg",
    config: {
      accentColor: "#FF007F",
      secondaryAccent: "#00F0FF",
      mode: "dark",
      taskbarBlur: 25,
      taskbarOpacity: 88,
      taskbarRadius: 12,
      startMenuBlur: 25,
      startMenuRadius: 16,
      ncBlur: 20,
      ncRadius: 14,
      activeEffect: "glass",
      iconSpacing: 12,
      iconSize: 26,
    },
  },
  {
    id: "nordic-frost",
    name: "Nordic Frost & Aurora",
    tag: "Clean Minimal",
    description: "Crisp arctic ice blues and soft aurora mint highlights on an airy, frosted light-mode layout.",
    wallpaperFileName: "default-light.jpg",
    config: {
      accentColor: "#4AA8D8",
      secondaryAccent: "#A8E6CF",
      mode: "light",
      taskbarBlur: 12,
      taskbarOpacity: 90,
      taskbarRadius: 8,
      startMenuBlur: 14,
      startMenuRadius: 10,
      ncBlur: 12,
      ncRadius: 10,
      activeEffect: "acrylic",
      iconSpacing: 8,
      iconSize: 24,
    },
  },
  {
    id: "aero-glass",
    name: "Aero Glass Classic",
    tag: "Nostalgia",
    description: "Windows 7 Aero-inspired crystalline blues and subtle WinUI 3 borders for a modern glass revival.",
    wallpaperFileName: "default-dark.jpg",
    config: {
      accentColor: "#0078D4",
      secondaryAccent: "#60CDFF",
      mode: "dark",
      taskbarBlur: 18,
      taskbarOpacity: 93,
      taskbarRadius: 8,
      startMenuBlur: 20,
      startMenuRadius: 12,
      ncBlur: 16,
      ncRadius: 12,
      activeEffect: "glass",
      iconSpacing: 8,
      iconSize: 24,
    },
  },
];

export function getThemeById(id: string): FeaturedTheme | undefined {
  return FEATURED_THEMES.find((t) => t.id === id);
}

export function getThemeStudioUrl(theme: FeaturedTheme, basePath: string = ""): string {
  const pseudoState: ThemeState = {
    themeName: theme.name,
    accentColor: theme.config.accentColor,
    secondaryAccent: theme.config.secondaryAccent,
    isLightMode: theme.config.mode === "light",
    taskbarMode: "blur",
    cornerRadius: theme.config.taskbarRadius,
    borderThickness: 2,
    hideRecommended: false,
    compactSearch: false,
    dynamicNotificationHeight: false,
    removeDropShadows: false,
    taskbarBlur: theme.config.taskbarBlur,
    startMenuBlur: theme.config.startMenuBlur,
    notificationBlur: theme.config.ncBlur,
    taskbarOpacity: theme.config.taskbarOpacity,
    startMenuOpacity: 97,
    notificationOpacity: 97,
    customWallpaper: null,
    history: [],
    historyIndex: -1,
    setThemeName: () => {},
    setAccentColor: () => {},
    setSecondaryAccent: () => {},
    toggleLightMode: () => {},
    setTaskbarMode: () => {},
    setCornerRadius: () => {},
    setBorderThickness: () => {},
    toggleHideRecommended: () => {},
    toggleCompactSearch: () => {},
    toggleDynamicNotificationHeight: () => {},
    toggleRemoveDropShadows: () => {},
    setTaskbarBlur: () => {},
    setStartMenuBlur: () => {},
    setNotificationBlur: () => {},
    setTaskbarOpacity: () => {},
    setStartMenuOpacity: () => {},
    setNotificationOpacity: () => {},
    setCustomWallpaper: () => {},
    resetDefaults: () => {},
    undo: () => {},
    redo: () => {},
    canUndo: () => false,
    canRedo: () => false,
    applyPreset: () => {},
  };

  const query = encodeThemeToUrl(pseudoState);
  const cleanBase = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
  return `${cleanBase}/studio${query}`;
}
