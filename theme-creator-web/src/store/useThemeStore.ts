import { create } from 'zustand';

export interface ThemeConfigSnapshot {
  themeName: string;
  accentColor: string;
  secondaryAccent: string;
  isLightMode: boolean;
  taskbarMode: 'blur' | 'gradient';
  cornerRadius: number;
  borderThickness: number;
  wallpaperUrl: string | null;
  wallpaperData: Uint8Array | null;
  customStartIconUrl: string | null;
  customStartIconData: Uint8Array | null;
  hideRecommended: boolean;
  compactSearch: boolean;
  dynamicNotificationHeight: boolean;
  removeDropShadows: boolean;
  taskbarBlur: number;
  startMenuBlur: number;
  notificationBlur: number;
  taskbarOpacity: number;
  startMenuOpacity: number;
  notificationOpacity: number;
}

export interface ThemeState extends ThemeConfigSnapshot {
  // Active flyout preview pane
  activePane: 'start' | 'notifications' | 'quicksettings' | null;

  // Desktop & UI preview toggles
  showDesktopIcons: boolean;
  showWindowPreview: boolean;
  isSidebarCollapsed: boolean;
  showDownloadModal: boolean;

  // History for Undo / Redo
  past: ThemeConfigSnapshot[];
  future: ThemeConfigSnapshot[];

  // Actions
  setThemeName: (name: string) => void;
  setAccentColor: (c: string) => void;
  setSecondaryAccent: (c: string) => void;
  setIsLightMode: (v: boolean) => void;
  setTaskbarMode: (m: 'blur' | 'gradient') => void;
  setCornerRadius: (r: number) => void;
  setBorderThickness: (t: number) => void;
  setWallpaper: (url: string | null, data?: Uint8Array | null) => void;
  setCustomStartIcon: (url: string | null, data?: Uint8Array | null) => void;
  setHideRecommended: (v: boolean) => void;
  setCompactSearch: (v: boolean) => void;
  setDynamicNotificationHeight: (v: boolean) => void;
  setRemoveDropShadows: (v: boolean) => void;
  setTaskbarBlur: (b: number) => void;
  setStartMenuBlur: (b: number) => void;
  setNotificationBlur: (b: number) => void;
  setTaskbarOpacity: (o: number) => void;
  setStartMenuOpacity: (o: number) => void;
  setNotificationOpacity: (o: number) => void;
  setActivePane: (pane: 'start' | 'notifications' | 'quicksettings' | null) => void;

  // Preview & UI Actions
  setShowDesktopIcons: (v: boolean) => void;
  setShowWindowPreview: (v: boolean) => void;
  setIsSidebarCollapsed: (v: boolean) => void;
  toggleSidebar: () => void;
  setShowDownloadModal: (v: boolean) => void;

  // History Actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Bulk state update (e.g. preset or reg import)
  applyThemeConfig: (config: Partial<ThemeState>) => void;
  resetToDefaults: () => void;
}

export const takeSnapshot = (state: ThemeState): ThemeConfigSnapshot => ({
  themeName: state.themeName,
  accentColor: state.accentColor,
  secondaryAccent: state.secondaryAccent,
  isLightMode: state.isLightMode,
  taskbarMode: state.taskbarMode,
  cornerRadius: state.cornerRadius,
  borderThickness: state.borderThickness,
  wallpaperUrl: state.wallpaperUrl,
  wallpaperData: state.wallpaperData,
  customStartIconUrl: state.customStartIconUrl,
  customStartIconData: state.customStartIconData,
  hideRecommended: state.hideRecommended,
  compactSearch: state.compactSearch,
  dynamicNotificationHeight: state.dynamicNotificationHeight,
  removeDropShadows: state.removeDropShadows,
  taskbarBlur: state.taskbarBlur,
  startMenuBlur: state.startMenuBlur,
  notificationBlur: state.notificationBlur,
  taskbarOpacity: state.taskbarOpacity,
  startMenuOpacity: state.startMenuOpacity,
  notificationOpacity: state.notificationOpacity,
});

const DEFAULT_THEME_STATE = {
  themeName: 'Custom Theme',
  accentColor: '#0078D4',
  secondaryAccent: '#005A9E',
  isLightMode: false,
  taskbarMode: 'blur' as const,
  cornerRadius: 8,
  borderThickness: 2,
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
  taskbarOpacity: 97,
  startMenuOpacity: 97,
  notificationOpacity: 97,
  activePane: 'start' as const,
  showDesktopIcons: true,
  showWindowPreview: false,
  isSidebarCollapsed: false,
  showDownloadModal: false,
  past: [] as ThemeConfigSnapshot[],
  future: [] as ThemeConfigSnapshot[],
};

export const useThemeStore = create<ThemeState>((set, get) => {
  const withHistory = (update: (state: ThemeState) => Partial<ThemeState>) => {
    set((state) => {
      const snap = takeSnapshot(state);
      const newPast = [...state.past, snap].slice(-30);
      return {
        ...update(state),
        past: newPast,
        future: [],
      };
    });
  };

  return {
    ...DEFAULT_THEME_STATE,

    setThemeName: (name: string) => withHistory(() => ({ themeName: name })),
    setAccentColor: (c: string) => withHistory(() => ({ accentColor: c })),
    setSecondaryAccent: (c: string) => withHistory(() => ({ secondaryAccent: c })),
    setIsLightMode: (v: boolean) => withHistory(() => ({ isLightMode: v })),
    setTaskbarMode: (m: 'blur' | 'gradient') => withHistory(() => ({ taskbarMode: m })),
    setCornerRadius: (r: number) => withHistory(() => ({ cornerRadius: r })),
    setBorderThickness: (t: number) => withHistory(() => ({ borderThickness: t })),
    setWallpaper: (url: string | null, data: Uint8Array | null = null) =>
      withHistory(() => ({ wallpaperUrl: url, wallpaperData: data })),
    setCustomStartIcon: (url: string | null, data: Uint8Array | null = null) =>
      withHistory(() => ({ customStartIconUrl: url, customStartIconData: data })),
    setHideRecommended: (v: boolean) => withHistory(() => ({ hideRecommended: v })),
    setCompactSearch: (v: boolean) => withHistory(() => ({ compactSearch: v })),
    setDynamicNotificationHeight: (v: boolean) => withHistory(() => ({ dynamicNotificationHeight: v })),
    setRemoveDropShadows: (v: boolean) => withHistory(() => ({ removeDropShadows: v })),

    setTaskbarBlur: (b: number) => withHistory(() => ({ taskbarBlur: b })),
    setStartMenuBlur: (b: number) => withHistory(() => ({ startMenuBlur: b })),
    setNotificationBlur: (b: number) => withHistory(() => ({ notificationBlur: b })),
    setTaskbarOpacity: (o: number) => withHistory(() => ({ taskbarOpacity: o })),
    setStartMenuOpacity: (o: number) => withHistory(() => ({ startMenuOpacity: o })),
    setNotificationOpacity: (o: number) => withHistory(() => ({ notificationOpacity: o })),

    // Flyout & preview navigation (does not pollute history)
    setActivePane: (pane: 'start' | 'notifications' | 'quicksettings' | null) => set({ activePane: pane }),
    setShowDesktopIcons: (v: boolean) => set({ showDesktopIcons: v }),
    setShowWindowPreview: (v: boolean) => set({ showWindowPreview: v }),
    setIsSidebarCollapsed: (v: boolean) => set({ isSidebarCollapsed: v }),
    toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
    setShowDownloadModal: (v: boolean) => set({ showDownloadModal: v }),

    // Undo / Redo
    canUndo: () => get().past.length > 0,
    canRedo: () => get().future.length > 0,

    undo: () =>
      set((state) => {
        if (state.past.length === 0) return state;
        const previous = state.past[state.past.length - 1];
        const newPast = state.past.slice(0, -1);
        const currentSnapshot = takeSnapshot(state);
        return {
          ...state,
          ...previous,
          past: newPast,
          future: [currentSnapshot, ...state.future].slice(0, 30),
        };
      }),

    redo: () =>
      set((state) => {
        if (state.future.length === 0) return state;
        const next = state.future[0];
        const newFuture = state.future.slice(1);
        const currentSnapshot = takeSnapshot(state);
        return {
          ...state,
          ...next,
          past: [...state.past, currentSnapshot].slice(-30),
          future: newFuture,
        };
      }),

    applyThemeConfig: (config: Partial<ThemeState>) =>
      set((state) => {
        const snap = takeSnapshot(state);
        return {
          ...state,
          ...config,
          past: [...state.past, snap].slice(-30),
          future: [],
        };
      }),

    resetToDefaults: () =>
      set((state) => {
        const snap = takeSnapshot(state);
        return {
          ...DEFAULT_THEME_STATE,
          past: [...state.past, snap].slice(-30),
          future: [],
        };
      }),
  };
});

