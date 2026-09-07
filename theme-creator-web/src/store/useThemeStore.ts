import { create } from 'zustand';

export interface ThemeState {
  // Theme settings
  themeName: string;
  accentColor: string;
  secondaryAccent: string;
  isLightMode: boolean;
  taskbarMode: 'blur' | 'gradient';
  cornerRadius: number;
  wallpaperUrl: string | null;
  wallpaperData: Uint8Array | null;
  customStartIconUrl: string | null;
  customStartIconData: Uint8Array | null;
  
  // Layout overrides
  hideRecommended: boolean;
  compactSearch: boolean;
  dynamicNotificationHeight: boolean;
  removeDropShadows: boolean;

  // Styler blur levels
  taskbarBlur: number;
  startMenuBlur: number;
  notificationBlur: number;
  
  // Active flyout preview pane
  activePane: 'start' | 'notifications' | null;

  // Actions
  setThemeName: (name: string) => void;
  setAccentColor: (c: string) => void;
  setSecondaryAccent: (c: string) => void;
  setIsLightMode: (v: boolean) => void;
  setTaskbarMode: (m: 'blur' | 'gradient') => void;
  setCornerRadius: (r: number) => void;
  setWallpaper: (url: string | null, data?: Uint8Array | null) => void;
  setCustomStartIcon: (url: string | null, data?: Uint8Array | null) => void;
  setHideRecommended: (v: boolean) => void;
  setCompactSearch: (v: boolean) => void;
  setDynamicNotificationHeight: (v: boolean) => void;
  setRemoveDropShadows: (v: boolean) => void;
  setTaskbarBlur: (b: number) => void;
  setStartMenuBlur: (b: number) => void;
  setNotificationBlur: (b: number) => void;
  setActivePane: (pane: 'start' | 'notifications' | null) => void;
  
  // Bulk state update (e.g. preset or reg import)
  applyThemeConfig: (config: Partial<ThemeState>) => void;
  resetToDefaults: () => void;
}

const DEFAULT_THEME_STATE = {
  themeName: 'Custom Theme',
  accentColor: '#0078D4',
  secondaryAccent: '#005A9E',
  isLightMode: false,
  taskbarMode: 'blur' as const,
  cornerRadius: 8,
  wallpaperUrl: null,
  wallpaperData: null,
  customStartIconUrl: null,
  customStartIconData: null,
  hideRecommended: false,
  compactSearch: false,
  dynamicNotificationHeight: false,
  removeDropShadows: false,
  taskbarBlur: 10,
  startMenuBlur: 15,
  notificationBlur: 15,
  activePane: 'start' as const,
};

export const useThemeStore = create<ThemeState>((set) => ({
  ...DEFAULT_THEME_STATE,

  setThemeName: (name: string) => set({ themeName: name }),
  setAccentColor: (c: string) => set({ accentColor: c }),
  setSecondaryAccent: (c: string) => set({ secondaryAccent: c }),
  setIsLightMode: (v: boolean) => set({ isLightMode: v }),
  setTaskbarMode: (m: 'blur' | 'gradient') => set({ taskbarMode: m }),
  setCornerRadius: (r: number) => set({ cornerRadius: r }),
  setWallpaper: (url: string | null, data: Uint8Array | null = null) =>
    set({ wallpaperUrl: url, wallpaperData: data }),
  setCustomStartIcon: (url: string | null, data: Uint8Array | null = null) =>
    set({ customStartIconUrl: url, customStartIconData: data }),
  setHideRecommended: (v: boolean) => set({ hideRecommended: v }),
  setCompactSearch: (v: boolean) => set({ compactSearch: v }),
  setDynamicNotificationHeight: (v: boolean) => set({ dynamicNotificationHeight: v }),
  setRemoveDropShadows: (v: boolean) => set({ removeDropShadows: v }),

  setTaskbarBlur: (b: number) => set({ taskbarBlur: b }),
  setStartMenuBlur: (b: number) => set({ startMenuBlur: b }),
  setNotificationBlur: (b: number) => set({ notificationBlur: b }),
  setActivePane: (pane: 'start' | 'notifications' | null) => set({ activePane: pane }),

  applyThemeConfig: (config: Partial<ThemeState>) => set((state) => ({ ...state, ...config })),
  resetToDefaults: () => set({ ...DEFAULT_THEME_STATE }),
}));
