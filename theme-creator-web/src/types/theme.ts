import type { ColorHarmonyType } from '../lib/paletteEngine';
export type { ColorHarmonyType };

export type MaterialStyle = 'fluent-acrylic' | 'pure-black-neon' | 'linear-gradient' | 'matte-slate' | 'mica' | 'mica-alt';
export type RunningIndicatorStyle = 'line' | 'dot' | 'pill' | 'glow' | 'off' | 'bar' | 'standard' | 'hidden';

export type StartButtonType = 'default' | 'preset' | 'custom';
export type StartButtonPresetId =
  | 'win11-minimal'
  | 'win98-retro'
  | 'apple-glyph'
  | 'cyberpunk-hex'
  | 'linux-tux'
  | 'minimal-diamond'
  | 'gaming-rog'
  | 'fluent-orb';

export interface StartButtonConfig {
  type: StartButtonType;
  presetId?: StartButtonPresetId;
  customIconUrl?: string | null;
  colorMode: 'accent' | 'secondary' | 'custom';
  customColor: string;
  size: number;
}

export interface RunningIndicatorConfig {
  style: RunningIndicatorStyle;
  activeColorMode: 'accent' | 'white' | 'custom';
  activeCustomColor: string;
  inactiveColorMode: 'subtle-white' | 'accent' | 'custom';
  inactiveCustomColor: string;
  indicatorSize: number;
}

export interface ComponentOverride {
  enabled: boolean;
  materialStyle?: MaterialStyle;
  customColor?: string;
  gradient?: GradientConfig;
  opacity?: number;
  blur?: number;
  cornerRadius?: number;
  borderThickness?: number;
}

export interface ContextMenuOverride extends ComponentOverride {
  enableClassicMenu?: boolean;
  itemHoverAccent?: boolean;
}

export interface FileExplorerOverride extends ComponentOverride {
  tabStyle: 'integrated' | 'floating' | 'accent-border';
  showCommandBarTint: boolean;
  activeTabColorMode: 'accent' | 'surface';
}

export type PreviewViewMode = 'desktop' | 'file-explorer' | 'terminal' | 'context-menu';

export interface GradientStop {
  id: string;
  color: string;
  offset: number;
}

export interface GradientConfig {
  type: 'linear' | 'radial';
  angle: number;
  stops: GradientStop[];
}

export interface TypographyConfig {
  fontFamily: string;
  fontWeight: '300' | '400' | '500' | '600' | '700';
  characterSpacing: number;
}

export interface AnimationConfig {
  speed: 'instant' | 'snappy' | 'default' | 'smooth';
  durationMs: number;
  easing: 'fluent-spring' | 'decelerate' | 'linear';
}

export interface ThemeConfigSnapshot {
  themeName: string;
  accentColor: string;
  secondaryAccent: string;
  isLightMode: boolean;
  taskbarMode: 'blur' | 'gradient';
  materialStyle: MaterialStyle;
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
  noiseOpacity: number;
  tintSaturation: number;
  dockMode: boolean;
  dockMargin: number;
  runningIndicatorStyle: RunningIndicatorStyle;
  colorHarmony: ColorHarmonyType;
  globalGradient: GradientConfig;
  taskbarOverride: ComponentOverride;
  startMenuOverride: ComponentOverride;
  flyoutOverride: ComponentOverride;
  typography: TypographyConfig;
  animations: AnimationConfig;

  // Phase 2 Properties
  startButton: StartButtonConfig;
  runningIndicator: RunningIndicatorConfig;
  runningIndicators?: RunningIndicatorConfig;
  contextMenuOverride: ContextMenuOverride;
  fileExplorerOverride: FileExplorerOverride;
  previewViewMode: PreviewViewMode;
}

export interface SavedTheme {
  id: string;
  name: string;
  date: string;
  config: ThemeConfigSnapshot;
}

export interface ThemeState extends ThemeConfigSnapshot {
  // Active flyout preview pane
  activePane: 'start' | 'notifications' | 'quicksettings' | null;

  // Desktop & UI preview toggles
  showDesktopIcons: boolean;
  showWindowPreview: boolean;
  isSidebarCollapsed: boolean;
  showDownloadModal: boolean;

  // Saved themes library
  savedThemes: SavedTheme[];

  // History for Undo / Redo
  past: ThemeConfigSnapshot[];
  future: ThemeConfigSnapshot[];

  // Actions
  setThemeName: (name: string) => void;
  setAccentColor: (c: string) => void;
  setSecondaryAccent: (c: string) => void;
  setIsLightMode: (v: boolean) => void;
  setTaskbarMode: (m: 'blur' | 'gradient') => void;
  setMaterialStyle: (m: MaterialStyle) => void;
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
  setNoiseOpacity: (n: number) => void;
  setTintSaturation: (s: number) => void;
  setDockMode: (d: boolean) => void;
  setDockMargin: (m: number) => void;
  setRunningIndicatorStyle: (i: RunningIndicatorStyle) => void;
  setColorHarmony: (h: ColorHarmonyType) => void;
  setActivePane: (pane: 'start' | 'notifications' | 'quicksettings' | null) => void;

  // Phase 1 Actions
  setGlobalGradient: (g: GradientConfig) => void;
  setTaskbarOverride: (o: Partial<ComponentOverride>) => void;
  setStartMenuOverride: (o: Partial<ComponentOverride>) => void;
  setFlyoutOverride: (o: Partial<ComponentOverride>) => void;
  setTypography: (t: Partial<TypographyConfig>) => void;
  setAnimations: (a: Partial<AnimationConfig>) => void;

  // Phase 2 Actions
  setStartButton: (b: Partial<StartButtonConfig>) => void;
  setRunningIndicator: (i: Partial<RunningIndicatorConfig>) => void;
  setContextMenuOverride: (o: Partial<ContextMenuOverride>) => void;
  setFileExplorerOverride: (o: Partial<FileExplorerOverride>) => void;
  setPreviewViewMode: (m: PreviewViewMode) => void;

  // Preview & UI Actions
  setShowDesktopIcons: (v: boolean) => void;
  setShowWindowPreview: (v: boolean) => void;
  setIsSidebarCollapsed: (v: boolean) => void;
  toggleSidebar: () => void;
  setShowDownloadModal: (v: boolean) => void;

  // Saved Themes Actions
  saveCurrentTheme: (name?: string) => void;
  loadSavedTheme: (id: string) => void;
  deleteSavedTheme: (id: string) => void;

  // History Actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Bulk state update (e.g. preset or reg import)
  applyThemeConfig: (config: Partial<ThemeState>) => void;
  resetToDefaults: () => void;
}
